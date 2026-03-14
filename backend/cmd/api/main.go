package main

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/rekognition"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/pawtrack/backend/internal/breed"
	claude "github.com/pawtrack/backend/internal/claude"
	"github.com/pawtrack/backend/internal/handler"
	"github.com/pawtrack/backend/internal/store"
)

func main() {
	ctx := context.Background()

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		log.Fatalf("load AWS config: %v", err)
	}

	petsTable := envOrDefault("PETS_TABLE", "pawtrack-pets-dev")
	logsTable := envOrDefault("LOGS_TABLE", "pawtrack-logs-dev")
	photosBucket := envOrDefault("PHOTOS_BUCKET", "pawtrack-photos-dev")

	ddbClient := dynamodb.NewFromConfig(cfg)
	s3Client := s3.NewFromConfig(cfg)
	rekClient := rekognition.NewFromConfig(cfg)

	anthropicKey := os.Getenv("ANTHROPIC_API_KEY")

	st := store.New(ddbClient, petsTable, logsTable)
	detector := breed.NewDetector(rekClient, photosBucket)
	claudeClient := claude.New(anthropicKey)

	petHandler := handler.NewPetHandler(st)
	logHandler := handler.NewLogHandler(st)
	breedHandler := handler.NewBreedHandler(detector, s3Client, photosBucket)
	chatHandler := handler.NewChatHandler(claudeClient, st, s3Client, photosBucket)

	router := handler.NewRouter(petHandler, logHandler, breedHandler, chatHandler)

	lambda.Start(router.Handle)
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
