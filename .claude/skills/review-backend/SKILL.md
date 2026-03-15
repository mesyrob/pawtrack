---
name: review-backend
description: Review Go Lambda backend code for standards compliance. Checks handler patterns, DynamoDB access, error handling, Claude/Rekognition integration.
argument-hint: "[file or directory path]"
---

Review Go backend code for compliance with PawTrack backend standards and fix violations.

## Input
- File or area to review: $ARGUMENTS (if empty, review all changed .go files in backend/)

## Architecture
- **Runtime**: Go 1.23 on AWS Lambda (`provided:al2023`)
- **Entry**: `cmd/api/main.go` — Lambda handler init
- **Routing**: `internal/handler/router.go` — manual HTTP method + path routing
- **Auth**: `X-Device-Id` header scoping (no JWT/OAuth)

## Rules

### Project Structure
- `cmd/api/` — entry point only, no business logic
- `internal/handler/` — HTTP handlers, request parsing, response writing
- `internal/store/` — DynamoDB data access (pets, logs)
- `internal/claude/` — Anthropic API client
- `internal/breed/` — Rekognition breed detection
- `internal/model/` — Domain types
- No logic in handler that belongs in store or service layer

### Handler Pattern
- Parse request → validate → call store/service → write JSON response
- Always check `X-Device-Id` header for device-scoped operations
- Return structured JSON errors: `{"error": "message"}`
- Use appropriate HTTP status codes (400 for bad input, 404 for not found, 500 for internal)

### DynamoDB Access
- All DB operations in `internal/store/`
- Use `expression` package for building queries — no raw string expressions
- Always scope pet queries by `deviceId` partition key
- Log queries by `petId` partition key
- No table scans — always query by key

### Error Handling
- Return errors up the call stack — don't swallow them
- Log errors with context: `log.Printf("[Handler] failed to get pet: %v", err)`
- Prefix log lines with component: `[Store]`, `[Handler]`, `[Claude]`, `[Breed]`
- No `panic` in production code

### External Services
- Claude API: use `internal/claude/client.go` — never call Anthropic directly from handlers
- Rekognition: use `internal/breed/rekognition.go`
- S3 presigned URLs: generate in handler, don't expose bucket name to client

### Go Style
- `gofmt` compliant (mandatory)
- Short variable names in small scopes (`p` for pet, `l` for log, `err` for error)
- Descriptive names for exported types and functions
- No unused imports or variables
- Context propagation: pass `context.Context` through all layers

### Security
- Never log API keys, device IDs in full, or user data
- Validate all input lengths and types before processing
- S3 upload URLs: restrict content type and set expiry

## Process
1. Read target files
2. Check each rule
3. Fix violations directly
4. Run `cd backend && go build ./...` to verify
5. Run `cd backend && go vet ./...` for static analysis

## Reference
- Handlers: `backend/internal/handler/`
- Store: `backend/internal/store/`
- Models: `backend/internal/model/`
- Entry: `backend/cmd/api/main.go`

$ARGUMENTS
