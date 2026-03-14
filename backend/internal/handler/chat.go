package handler

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	claude "github.com/pawtrack/backend/internal/claude"
	"github.com/pawtrack/backend/internal/model"
	"github.com/pawtrack/backend/internal/store"
)

type ChatHandler struct {
	claude *claude.Client
	store  *store.Store
	s3     *s3.Client
	bucket string
}

func NewChatHandler(c *claude.Client, s *store.Store, s3Client *s3.Client, bucket string) *ChatHandler {
	return &ChatHandler{
		claude: c,
		store:  s,
		s3:     s3Client,
		bucket: bucket,
	}
}

type chatReq struct {
	PetID   string `json:"petId"`
	Message string `json:"message,omitempty"`
	S3Key   string `json:"s3Key,omitempty"`
}

func (h *ChatHandler) Chat(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	did := deviceID(req)
	if did == "" {
		return errResp(http.StatusBadRequest, "X-Device-Id header required")
	}

	var body chatReq
	if err := json.Unmarshal([]byte(req.Body), &body); err != nil {
		return errResp(http.StatusBadRequest, "invalid JSON body")
	}

	if body.PetID == "" {
		return errResp(http.StatusBadRequest, "petId is required")
	}

	if body.Message == "" && body.S3Key == "" {
		return errResp(http.StatusBadRequest, "message or s3Key is required")
	}

	// Fetch pet
	pet, err := h.store.GetPet(ctx, did, body.PetID)
	if err != nil {
		log.Printf("get pet: %v", err)
		return errResp(http.StatusInternalServerError, "failed to get pet")
	}
	if pet == nil {
		return errResp(http.StatusNotFound, "pet not found")
	}

	// Fetch recent logs (last 10)
	allLogs, err := h.store.ListLogs(ctx, body.PetID)
	if err != nil {
		log.Printf("list logs: %v", err)
		return errResp(http.StatusInternalServerError, "failed to list logs")
	}
	recentLogs := allLogs
	if len(recentLogs) > 10 {
		recentLogs = recentLogs[:10]
	}

	// Download image from S3 if provided
	var imageBase64 string
	var mediaType string
	if body.S3Key != "" {
		imageBase64, mediaType, err = h.downloadImage(ctx, body.S3Key)
		if err != nil {
			log.Printf("download image: %v", err)
			return errResp(http.StatusInternalServerError, "failed to download image")
		}
	}

	// Build system prompt
	systemPrompt := buildSystemPrompt(pet, recentLogs)

	// Call Claude
	resp, err := h.claude.Chat(ctx, claude.ChatRequest{
		SystemPrompt: systemPrompt,
		UserMessage:  body.Message,
		ImageBase64:  imageBase64,
		MediaType:    mediaType,
	})
	if err != nil {
		log.Printf("claude chat: %v", err)
		return errResp(http.StatusInternalServerError, "failed to get AI response")
	}

	return jsonResp(http.StatusOK, resp)
}

func (h *ChatHandler) downloadImage(ctx context.Context, s3Key string) (string, string, error) {
	out, err := h.s3.GetObject(ctx, &s3.GetObjectInput{
		Bucket: &h.bucket,
		Key:    &s3Key,
	})
	if err != nil {
		return "", "", fmt.Errorf("s3 get object: %w", err)
	}
	defer out.Body.Close()

	data, err := io.ReadAll(out.Body)
	if err != nil {
		return "", "", fmt.Errorf("read s3 body: %w", err)
	}

	encoded := base64.StdEncoding.EncodeToString(data)

	contentType := "image/jpeg"
	if out.ContentType != nil {
		contentType = *out.ContentType
	}

	return encoded, contentType, nil
}

func buildSystemPrompt(pet *model.Pet, recentLogs []model.LogEntry) string {
	var sb strings.Builder

	sb.WriteString(`You are PawTrack AI, a helpful veterinary assistant for pet health tracking.

You are helping manage health records for a pet. Analyze the user's message (and any attached photo) and return a JSON response.

ALWAYS respond with a JSON block in this exact format:
` + "```json" + `
{
  "reply": "Your friendly, helpful response to the user",
  "suggestedLogs": [
    {
      "type": "weight|vaccination|deworming|flea_tick|vet_visit|medication|symptom|note",
      "date": "YYYY-MM-DD",
      "title": "Short descriptive title",
      "notes": "Optional additional details",
      "data": {
        "weight": 4.5,
        "weightUnit": "kg",
        "vaccineName": "...",
        "medicationName": "...",
        "dosage": "...",
        "severity": "mild|moderate|severe",
        "vetName": "...",
        "cost": 0
      }
    }
  ],
  "petUpdates": {
    "breed": "...",
    "species": "dog|cat|rabbit|other",
    "color": "...",
    "size": "small|medium|large"
  }
}
` + "```" + `

Rules:
- "suggestedLogs" should only be included if the user's message implies health events to log. Each entry should have the appropriate type and filled data fields.
- "petUpdates" should only be included if the user provides new info about the pet's breed, species, color, or size (e.g. from a photo).
- Use today's date if no date is mentioned.
- Be concise but warm in your reply.
- If the user attaches a photo, describe what you see and suggest relevant updates.
- Only include data fields that are relevant to the log type.

`)

	sb.WriteString(fmt.Sprintf("Pet: %s (%s %s, %s, %s)\n", pet.Name, pet.Size, pet.Species, pet.Breed, pet.Sex))
	sb.WriteString(fmt.Sprintf("Birthday: %s\n", pet.Birthday))
	if pet.Color != "" {
		sb.WriteString(fmt.Sprintf("Color: %s\n", pet.Color))
	}
	if pet.VetClinic != "" {
		sb.WriteString(fmt.Sprintf("Vet Clinic: %s\n", pet.VetClinic))
	}

	if len(recentLogs) > 0 {
		sb.WriteString("\nRecent health logs:\n")
		for _, l := range recentLogs {
			sb.WriteString(fmt.Sprintf("- [%s] %s: %s", l.Date, l.Type, l.Title))
			if l.Data != nil && l.Data.Weight != nil {
				sb.WriteString(fmt.Sprintf(" (%.1f%s)", *l.Data.Weight, l.Data.WeightUnit))
			}
			if l.Notes != "" {
				sb.WriteString(fmt.Sprintf(" — %s", l.Notes))
			}
			sb.WriteString("\n")
		}
	}

	sb.WriteString(fmt.Sprintf("\nToday's date: %s\n", model.NewTimestamp()[:10]))

	return sb.String()
}
