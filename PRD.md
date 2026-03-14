# PawTrack — Product Requirements Document

> Living task document. Completed tasks get deleted, not checked off.

---

## Phase 1: Foundation

Expand the type system, introduce the Claude API service layer, and migrate storage to support all downstream features.

### Types (`lib/types.ts`)

- Add `TrackingItem` type: `{ id, label, category, icon, intervalDays?, enabled }` — replaces boolean health config fields
- Add `photoUrls: string[]` to `LogEntry`
- Add `Reminder` type: `{ id, petId, trackingItemId?, title, dueDate, recurrence?, source: 'user' | 'claude' }`
- Add `TrackingTemplate` type: `{ name, description, items: TrackingItem[] }` for presets (Puppy, Senior Dog, etc.)
- Add `weightUnit: 'kg' | 'lb'` to `Pet`
- Replace `HealthConfig` boolean fields (`vaccinations`, `medications`, `weightTracking`, `vetVisits`, `allergies`) with `trackingItems: TrackingItem[]`

### Backend Claude Endpoints (`backend/internal/handler/`)

All Claude-powered features run server-side — the Anthropic API key lives in Lambda env vars (`ANTHROPIC_API_KEY`), never in the frontend bundle.

- `POST /parse-log` — accepts `{ text, pet }`, returns `Partial<LogEntry>[]` — convert free-text into structured log entries
- `POST /parse-document` — accepts `{ s3Key, pet }`, returns `Partial<LogEntry>[]` — extract log entries from uploaded vet receipts, medication labels, etc.
- `POST /detect-breed` — already exists (Rekognition), add Claude Vision as enhanced fallback/alternative
- `POST /health-insights` — accepts `{ petId }`, returns `string[]` — proactive health suggestions based on pet profile + log history
- Create `backend/internal/claude/claude.go` — shared Claude API client (messages API, vision, structured output)
- Infra: `ANTHROPIC_API_KEY` added to Lambda env via `TF_VAR_anthropic_api_key` (set as GitHub secret `ANTHROPIC_API_KEY`)

### Frontend API Client (`lib/api.ts`)

- Already wired — all backend calls go through `lib/api.ts` with `X-Device-Id` header
- Add `parseLog(text, pet)`, `parseDocument(s3Key, pet)`, `getHealthInsights(petId)` methods
- Delete `breedDetection.ts` after confirming backend `/detect-breed` covers all cases

### Storage Migration (`lib/storage.ts`)

- Add storage version number and migration runner
- Write migration v1→v2: convert `HealthConfig` booleans to `TrackingItem[]` array
- Add storage keys for reminders, weight unit preference
- Add `getReminders` / `saveReminders` helpers

### Context (`contexts/PetContext.tsx`)

- Expose `trackingItems` and CRUD actions (`addTrackingItem`, `updateTrackingItem`, `removeTrackingItem`)
- Expose `reminders` and CRUD actions
- Expose `weightUnit` preference and setter

---

## Phase 2: Smart Data Input

Let users log pet data by typing naturally or snapping a photo — Claude does the parsing.

### Smart Input Component (`components/log/SmartInput.tsx`)

- Create `SmartInput.tsx` — a modal/sheet with two modes: text and photo
- Text mode: single `TextInput` where user types freely (e.g. "Yamato got his rabies shot today, weighed 4.2kg")
- Photo mode: camera/gallery picker → uploads to S3 via `/upload-url`, then calls `/parse-document`
- Display extracted entries as editable preview cards before saving
- Show confidence indicators on parsed fields so user knows what to double-check
- Handle multi-entry extraction (one vet receipt → multiple log entries)

### Log Form Integration (`components/log/LogForm.tsx`)

- Add "Smart Input" button/toggle at top of LogForm that opens SmartInput
- After user confirms parsed entries, populate LogForm fields or save directly
- Support batch save when multiple entries are extracted

### Error Handling

- Graceful fallback when backend is unreachable — show error toast, allow manual entry
- Timeout and retry logic for backend API calls
- Offline queue: if no network, save raw input and parse when connectivity returns

---

## Phase 3: Customizable Tracking

Replace the 5 fixed health toggles with a fully user-editable tracking system.

### Tracking Item Management

- Build `components/settings/TrackingItemEditor.tsx` — add/edit/delete custom tracking items
- Each item has: label, category (health, grooming, training, diet, custom), icon, optional interval in days
- Provide default items matching current 5 toggles so existing users keep their setup

### Preset Templates

- Ship built-in templates: Puppy, Senior Dog, Indoor Cat, Outdoor Cat, Exotic Pet
- Template selector during onboarding (`components/onboarding/HealthConfig.tsx` replacement)
- Users can start from a template then customize

### Dashboard Integration (`components/dashboard/TodoList.tsx`)

- Derive "due soon" list from tracking items with intervals + last log date
- Sort by urgency (overdue → due today → due this week)
- Tapping a todo opens LogForm pre-filled for that tracking item

### Log Form Updates

- Dynamic category list in LogForm driven by pet's `trackingItems` instead of hardcoded options
- Auto-suggest category when Smart Input parses an entry

---

## Phase 4: Photo & Media

Add photo capture, storage, and browsing tied to pets and log entries.

### Media Service (`lib/media.ts`)

- Create `lib/media.ts` — wraps `expo-image-picker` for camera + gallery access
- Implement local file storage using `expo-file-system` (photos saved to app documents dir)
- Thumbnail generation for gallery grid
- Cleanup unused photos when log entries are deleted

### Attach Photos to Logs

- Add photo picker to `LogForm` — attach 1-3 photos per log entry
- Display photo thumbnails in log entry cards on dashboard
- Fullscreen photo viewer on tap

### Pet Photo Gallery (`components/dashboard/PhotoGallery.tsx`)

- Grid gallery showing all photos for a pet, newest first
- Filter by log category (show only vet visit photos, etc.)
- Growth timeline view — photos sorted chronologically with weight/age overlay

### Pet Profile Photo

- Allow setting/changing pet avatar from gallery or camera
- Crop/resize to square for consistent display in PetCard

---

## Phase 5: Reminders & Smart Todos

Local push notifications + Claude-generated health insights merged into one actionable list.

### Local Notifications (`lib/notifications.ts`)

- Create `lib/notifications.ts` — wraps `expo-notifications`
- Request permission flow (first launch + settings fallback)
- Schedule/cancel notifications tied to `Reminder` objects
- Handle notification tap → deep link to relevant log form

### User-Created Reminders

- Add "Set Reminder" action on any tracking item or log entry
- Reminder creation UI: title, date/time, recurrence (none, daily, weekly, monthly, custom interval)
- Reminder list view in dashboard or dedicated tab

### Claude-Generated Insights

- Periodically (or on dashboard load) call `GET /health-insights` via backend
- Display insights as dismissible cards on dashboard (e.g. "Yamato hasn't had a dental check in 8 months")
- "Create Reminder" action on each insight card
- Cache insights to avoid redundant API calls

### Merged Todo List

- Combine interval-based todos (Phase 3), user reminders, and Claude insights into unified priority list
- Consistent urgency scoring: overdue > due today > insight > upcoming

---

## Phase 6: Design Polish

Refine animations, loading states, and visual consistency across the app.

### Animations

- Entrance animations on screen transitions (fade/slide via Expo Router)
- Micro-interactions: button press scale, toggle slide, card expand
- Use `react-native-reanimated` for performant animations

### Loading States

- Skeleton screens for dashboard, log list, gallery while data loads
- Shimmer effect on skeleton placeholders
- Loading spinner for Claude API calls with cancel option

### Empty States

- Illustrated empty states for: no pets, no logs, no photos, no reminders
- Each empty state has a clear CTA button (e.g. "Add your first pet")

### Visual Consistency

- Audit all screens for consistent spacing (8px grid)
- Ensure all interactive elements have 2.5px borders and 3px border-radius
- Consistent shadow application from `lib/theme.ts`
- Fix any text that isn't using SpaceMono Bold (headers) or system font (body)

---

## Phase 7: Profile & Settings

Editable pet details, multi-pet quality of life, data management, and app configuration.

### Editable Pet Profile (`app/(tabs)/profile.tsx`)

- View/edit all pet fields: name, breed, birthday, weight, avatar
- Weight history chart (line graph from log entries)
- Quick links to pet's photo gallery and recent logs

### Multi-Pet Management

- Pet switcher in header or tab bar (current `activePet` context)
- Add pet flow (re-use onboarding steps 2-4)
- Delete pet with confirmation and data cleanup
- Reorder pets via drag-and-drop

### Data Management

- Export all data as JSON (pets, logs, reminders)
- Import data from JSON backup
- "Delete all data" with double-confirmation

### App Settings

- Weight unit toggle (kg / lb) — applies globally
- Notification preferences (enable/disable, quiet hours)
- About screen with version number and links

---

## Key Files Reference

| File | Phase | Change |
|---|---|---|
| `lib/types.ts` | 1 | Expanded types |
| `lib/api.ts` | 1 | Add `parseLog`, `parseDocument`, `getHealthInsights` methods |
| `lib/storage.ts` | 1 | Migration + new keys |
| `lib/media.ts` | 4 | New — photo management |
| `lib/notifications.ts` | 5 | New — push notifications |
| `contexts/PetContext.tsx` | 1, 3 | Extended state |
| `components/log/SmartInput.tsx` | 2 | New — NLP/photo input |
| `components/log/LogForm.tsx` | 2, 3 | Smart input + dynamic categories |
| `components/settings/TrackingItemEditor.tsx` | 3 | New — custom tracking |
| `components/dashboard/TodoList.tsx` | 3, 5 | Dynamic + merged todos |
| `components/dashboard/PhotoGallery.tsx` | 4 | New — photo grid/timeline |
| `app/(tabs)/profile.tsx` | 7 | Editable + gallery + settings |
| `components/onboarding/HealthConfig.tsx` | 3 | Template selector |
| `backend/internal/claude/claude.go` | 1 | New — shared Claude API client |
| `backend/internal/handler/claude.go` | 1 | New — `/parse-log`, `/parse-document`, `/health-insights` handlers |
| `infra/lambda.tf` | 1 | `ANTHROPIC_API_KEY` env var |
