package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/aws/aws-lambda-go/events"
)

type Router struct {
	pets  *PetHandler
	logs  *LogHandler
	breed *BreedHandler
}

func NewRouter(pets *PetHandler, logs *LogHandler, breed *BreedHandler) *Router {
	return &Router{pets: pets, logs: logs, breed: breed}
}

func (r *Router) Handle(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	method := req.RequestContext.HTTP.Method
	path := req.RawPath

	// Strip trailing slash (except root)
	if len(path) > 1 {
		path = strings.TrimRight(path, "/")
	}

	segments := strings.Split(strings.TrimPrefix(path, "/"), "/")

	log.Printf("%s %s", method, path)

	switch {
	case method == http.MethodGet && path == "/health":
		return jsonResp(http.StatusOK, map[string]string{"status": "ok"})

	case method == http.MethodPost && path == "/upload-url":
		return r.breed.UploadURL(ctx, req)

	case method == http.MethodPost && path == "/detect-breed":
		return r.breed.Detect(ctx, req)

	case path == "/pets" && method == http.MethodPost:
		return r.pets.Create(ctx, req)

	case path == "/pets" && method == http.MethodGet:
		return r.pets.List(ctx, req)

	// /pets/{id}
	case len(segments) == 2 && segments[0] == "pets" && segments[1] != "":
		petID := segments[1]
		switch method {
		case http.MethodGet:
			return r.pets.Get(ctx, req, petID)
		case http.MethodPut:
			return r.pets.Update(ctx, req, petID)
		case http.MethodDelete:
			return r.pets.Delete(ctx, req, petID)
		}

	// /pets/{id}/logs
	case len(segments) == 3 && segments[0] == "pets" && segments[2] == "logs":
		petID := segments[1]
		switch method {
		case http.MethodPost:
			return r.logs.Create(ctx, req, petID)
		case http.MethodGet:
			return r.logs.List(ctx, req, petID)
		}
	}

	return jsonResp(http.StatusNotFound, map[string]string{"error": "not found"})
}

func jsonResp(status int, body any) (events.APIGatewayV2HTTPResponse, error) {
	b, err := json.Marshal(body)
	if err != nil {
		return events.APIGatewayV2HTTPResponse{StatusCode: http.StatusInternalServerError}, nil
	}
	return events.APIGatewayV2HTTPResponse{
		StatusCode: status,
		Headers: map[string]string{
			"Content-Type":                 "application/json",
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type,X-Device-Id",
		},
		Body: string(b),
	}, nil
}

func errResp(status int, msg string) (events.APIGatewayV2HTTPResponse, error) {
	return jsonResp(status, map[string]string{"error": msg})
}

func deviceID(req events.APIGatewayV2HTTPRequest) string {
	return req.Headers["x-device-id"]
}
