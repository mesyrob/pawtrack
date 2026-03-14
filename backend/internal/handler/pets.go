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

type PetHandler struct {
	store *store.Store
}

func NewPetHandler(s *store.Store) *PetHandler {
	return &PetHandler{store: s}
}

func (h *PetHandler) Create(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	did := deviceID(req)
	if did == "" {
		return errResp(http.StatusBadRequest, "X-Device-Id header required")
	}

	var pet model.Pet
	if err := json.Unmarshal([]byte(req.Body), &pet); err != nil {
		return errResp(http.StatusBadRequest, "invalid JSON body")
	}

	pet.ID = uuid.NewString()
	pet.DeviceID = did
	pet.CreatedAt = model.NewTimestamp()

	if err := h.store.CreatePet(ctx, pet); err != nil {
		return errResp(http.StatusInternalServerError, "failed to create pet")
	}
	return jsonResp(http.StatusCreated, pet)
}

func (h *PetHandler) List(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	did := deviceID(req)
	if did == "" {
		return errResp(http.StatusBadRequest, "X-Device-Id header required")
	}

	pets, err := h.store.ListPets(ctx, did)
	if err != nil {
		return errResp(http.StatusInternalServerError, "failed to list pets")
	}
	return jsonResp(http.StatusOK, pets)
}

func (h *PetHandler) Get(ctx context.Context, req events.APIGatewayV2HTTPRequest, petID string) (events.APIGatewayV2HTTPResponse, error) {
	did := deviceID(req)
	if did == "" {
		return errResp(http.StatusBadRequest, "X-Device-Id header required")
	}

	pet, err := h.store.GetPet(ctx, did, petID)
	if err != nil {
		return errResp(http.StatusInternalServerError, "failed to get pet")
	}
	if pet == nil {
		return errResp(http.StatusNotFound, "pet not found")
	}
	return jsonResp(http.StatusOK, pet)
}

func (h *PetHandler) Update(ctx context.Context, req events.APIGatewayV2HTTPRequest, petID string) (events.APIGatewayV2HTTPResponse, error) {
	did := deviceID(req)
	if did == "" {
		return errResp(http.StatusBadRequest, "X-Device-Id header required")
	}

	var pet model.Pet
	if err := json.Unmarshal([]byte(req.Body), &pet); err != nil {
		return errResp(http.StatusBadRequest, "invalid JSON body")
	}

	pet.ID = petID
	pet.DeviceID = did

	if err := h.store.UpdatePet(ctx, pet); err != nil {
		return errResp(http.StatusInternalServerError, "failed to update pet")
	}
	return jsonResp(http.StatusOK, pet)
}

func (h *PetHandler) Delete(ctx context.Context, req events.APIGatewayV2HTTPRequest, petID string) (events.APIGatewayV2HTTPResponse, error) {
	did := deviceID(req)
	if did == "" {
		return errResp(http.StatusBadRequest, "X-Device-Id header required")
	}

	if err := h.store.DeletePet(ctx, did, petID); err != nil {
		return errResp(http.StatusInternalServerError, "failed to delete pet")
	}
	return jsonResp(http.StatusOK, map[string]string{"deleted": petID})
}
