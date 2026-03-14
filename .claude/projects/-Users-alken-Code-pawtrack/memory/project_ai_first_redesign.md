---
name: AI-first UX redesign
description: PawTrack was redesigned from 5-tab form-based app to 3-tab chat-first AI tool (2026-03-14)
type: project
---

PawTrack was redesigned to be AI-first on 2026-03-14.

**Before**: 5 tabs (Home, Timeline, Health, Chat, Profile) — Chat was buried as tab 4, users manually filled forms to log data.

**After**: 3 tabs (Dashboard, Chat, Profile) — Chat is the default/home tab. AI is the primary way to add and manage pet health data.

**Why:** User wanted the app to be an AI-first tool where chat is the main interaction method, not forms.

**How to apply:** All new features should be chat-centric. The Dashboard is read-only (health score, tracking, timeline). The Chat tab is where all data entry happens via natural language. The log modal still exists as a fallback but chat is the primary flow.

**Key changes:**
- Deleted: `timeline.tsx`, `health.tsx`, `chat.tsx` (old tabs)
- Created: `dashboard.tsx` (merged Home + Timeline + Health into one read-only view)
- Rewritten: `index.tsx` (now the Chat screen with proactive AI greeting, health alerts, smart suggestion chips)
- Updated: `_layout.tsx` (3 tabs: Dashboard | Chat | Profile)
