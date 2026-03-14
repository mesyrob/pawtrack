package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/google/uuid"
	"github.com/pawtrack/backend/internal/model"
	"github.com/pawtrack/backend/internal/store"
)

type LogHandler struct {
	store *store.Store
}

func NewLogHandler(s *store.Store) *LogHandler {
	return &LogHandler{store: s}
}

func (h *LogHandler) Create(ctx context.Context, req events.APIGatewayV2HTTPRequest, petID string) (events.APIGatewayV2HTTPResponse, error) {
	var entry model.LogEntry
	if err := json.Unmarshal([]byte(req.Body), &entry); err != nil {
		return errResp(http.StatusBadRequest, "invalid JSON body")
	}

	entry.ID = uuid.NewString()
	entry.PetID = petID
	entry.CreatedAt = model.NewTimestamp()

	if err := h.store.CreateLog(ctx, entry); err != nil {
		return errResp(http.StatusInternalServerError, "failed to create log")
	}
	return jsonResp(http.StatusCreated, entry)
}

func (h *LogHandler) List(ctx context.Context, req events.APIGatewayV2HTTPRequest, petID string) (events.APIGatewayV2HTTPResponse, error) {
	logs, err := h.store.ListLogs(ctx, petID)
	if err != nil {
		return errResp(http.StatusInternalServerError, "failed to list logs")
	}
	return jsonResp(http.StatusOK, logs)
}
