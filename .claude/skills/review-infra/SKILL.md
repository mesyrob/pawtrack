---
name: review-infra
description: Review Terraform infrastructure code for AWS best practices. Checks Lambda, API Gateway, DynamoDB, S3, IAM, and CI/CD configuration.
argument-hint: "[file or directory path]"
---

Review Terraform and CI/CD code for compliance with PawTrack infrastructure standards and fix violations.

## Input
- File or area to review: $ARGUMENTS (if empty, review all changed .tf/.yml files in infra/ and .github/)

## Architecture
- **IaC**: Terraform with S3 backend for state
- **Region**: eu-central-1 (state), us-east-1 (resources, configurable)
- **Environment**: `dev` (via `var.environment`)
- **CI/CD**: GitHub Actions with OIDC auth to AWS

## Rules

### Terraform Style
- One resource type per file: `lambda.tf`, `dynamodb.tf`, `s3.tf`, `iam.tf`, `api_gateway.tf`
- All configurable values in `variables.tf` with descriptions and defaults
- Outputs in `outputs.tf` for values needed by other systems
- Use `local` blocks for computed values, not repeated expressions
- Resource naming: `pawtrack-{resource}-{environment}` pattern

### Lambda
- Runtime: `provided.al2023` with container image from ECR
- Memory: right-sized (256MB default, increase only with justification)
- Timeout: 30s max for API-facing, document longer timeouts
- Environment variables for all config — never hardcode
- CloudWatch log group with retention policy (14 days dev, 30 days prod)

### API Gateway
- HTTP API (v2) — not REST API
- CORS: restrict origins in production (allow all only in dev)
- All routes integrate with single Lambda
- No authorizers in dev, add Cognito/JWT for prod

### DynamoDB
- Pay-per-request billing (no provisioned capacity in dev)
- Partition key design: avoid hot partitions
- No table scans — every access pattern must use a key query
- GSIs only when access pattern requires — document the reason

### S3
- Block public access EXCEPT for explicit read-only paths (photos)
- CORS restricted to app domains
- Lifecycle rules for temporary uploads
- Encryption: SSE-S3 minimum

### IAM
- Least privilege: Lambda role only gets permissions it needs
- No `*` resource ARNs where specific ARNs are possible
- Separate policies per service (DynamoDB, S3, Rekognition, etc.)
- No inline policies — use managed policy documents

### CI/CD (GitHub Actions)
- OIDC auth — no long-lived AWS credentials
- Terraform plan before apply
- Image tagged with git SHA — never `latest`
- Secrets via GitHub Secrets — never in code or tfvars

### Security
- No secrets in Terraform state — use `sensitive = true` on variables
- API keys passed as Lambda environment variables from GitHub Secrets
- S3 bucket policies: explicit deny for non-SSL access
- No public subnets for compute resources

## Process
1. Read target files
2. Check each rule
3. Fix violations directly
4. Run `cd infra && terraform fmt -check` to verify formatting
5. Run `cd infra && terraform validate` to check syntax

## Reference
- Terraform files: `infra/`
- CI/CD: `.github/workflows/deploy.yml`
- OIDC setup: `infra/github-oidc.cfn.yml`
- Variables: `infra/variables.tf`
- Outputs: `infra/outputs.tf`

$ARGUMENTS
