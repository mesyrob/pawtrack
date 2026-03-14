# PawTrack

An AI-powered pet health companion that makes it effortless to stay on top of your pet's wellbeing.

## The Problem

Pet owners struggle to keep track of their animal's health history. Vaccination dates, deworming schedules, vet visits, weight trends, and medication records end up scattered across paper receipts, vet clinic portals, and forgotten notes. When it's time for a check-up, most people can't answer basic questions: *When was the last flea treatment? Is the rabies vaccine still current? Has their weight been trending up?*

The existing tools — spreadsheets, generic note apps, or clunky pet health apps with dozens of form fields — add friction instead of removing it.

## The Solution

PawTrack replaces forms with conversation. Instead of navigating through screens and filling out structured fields, you just tell the app what happened:

> "Yamato weighed 4.5kg at the vet today, got his rabies booster, cost $85"

The AI understands this, extracts the structured data (weight log, vaccination log, vet visit with cost), and presents it back as cards you can save with a single tap. Three logs from one sentence.

You can also snap a photo of a vet receipt or medication label and let the AI parse it for you.

## Key Features

**Chat-first logging** — The chat screen is the home screen. Describe what happened in plain language and the AI creates structured health logs automatically. No forms, no dropdowns, no date pickers required.

**Proactive health alerts** — PawTrack knows your pet's vaccination, deworming, and flea/tick schedules. When something is overdue or coming due, it tells you right when you open the app — not buried in a settings screen.

**Health dashboard** — A single view showing your pet's health score, tracking status for each category, and a timeline of recent activity. Glanceable, not overwhelming.

**Photo intelligence** — Upload a photo during onboarding and PawTrack detects the breed, color, and size. Send a photo of a vet document in chat and it extracts the relevant health data.

**Multi-pet support** — Switch between pets with a tap. Each pet has its own health history, tracking schedule, and profile.

**Offline-first** — All data is stored locally on your device. The backend is optional — without it, the app works as a fully functional local health tracker with manual entry.

## Who It's For

- Pet owners who want to keep health records without the hassle of data entry
- People with multiple pets who lose track of individual schedules
- Anyone who finds existing pet health apps too complex or tedious to maintain

---

## Technical Overview

### Structure

```
pawtrack/
├── frontend/     Expo (React Native) mobile app
├── backend/      Go API deployed on AWS Lambda
└── infra/        Terraform for AWS infrastructure
```

### Running the App

```bash
cd frontend
npm install
npx expo start
```

Requires Node 22+. Works standalone — no backend needed for local usage.

To connect the backend, create `frontend/.env`:

```
EXPO_PUBLIC_API_URL=https://your-api-gateway-url
```

### Running the Backend

```bash
cd backend
go run ./cmd/
```

Requires `ANTHROPIC_API_KEY` in environment for AI chat.

### Deploying Infrastructure

```bash
cd infra
terraform init
terraform apply
```

See `infra/variables.tf` for required configuration.

### API

All requests use an `X-Device-Id` header for device-scoped data isolation.

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/pets` | List or create pets |
| PUT/DELETE | `/pets/:id` | Update or delete a pet |
| GET/POST | `/pets/:id/logs` | List or create health logs |
| POST | `/chat` | AI conversation (returns structured log suggestions) |
| POST | `/upload-url` | Presigned S3 URL for photo uploads |
| POST | `/detect-breed` | Breed detection from uploaded photo |

### Stack

- **Frontend**: Expo SDK 54, Expo Router v6, NativeWind v4, TypeScript
- **Backend**: Go, AWS Lambda, API Gateway, DynamoDB, S3
- **AI**: Claude (Anthropic) for chat parsing, health insights, breed detection
- **Infra**: Terraform, ECR, IAM
