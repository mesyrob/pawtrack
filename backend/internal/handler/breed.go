package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/pawtrack/backend/internal/breed"
)

type BreedHandler struct {
	detector    *breed.Detector
	s3Presigner *s3.PresignClient
	bucket      string
}

func NewBreedHandler(detector *breed.Detector, s3Client *s3.Client, bucket string) *BreedHandler {
	return &BreedHandler{
		detector:    detector,
		s3Presigner: s3.NewPresignClient(s3Client),
		bucket:      bucket,
	}
}

type uploadURLReq struct {
	ContentType string `json:"contentType"`
}

type uploadURLResp struct {
	URL   string `json:"url"`
	S3Key string `json:"s3Key"`
}

func (h *BreedHandler) UploadURL(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	var body uploadURLReq
	if err := json.Unmarshal([]byte(req.Body), &body); err != nil {
		return errResp(http.StatusBadRequest, "invalid JSON body")
	}
	if body.ContentType == "" {
		body.ContentType = "image/jpeg"
	}

	key := fmt.Sprintf("photos/%s", uuid.NewString())
	presigned, err := h.s3Presigner.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      &h.bucket,
		Key:         aws.String(key),
		ContentType: aws.String(body.ContentType),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return errResp(http.StatusInternalServerError, "failed to generate upload URL")
	}

	return jsonResp(http.StatusOK, uploadURLResp{
		URL:   presigned.URL,
		S3Key: key,
	})
}

type detectReq struct {
	S3Key string `json:"s3Key"`
}

func (h *BreedHandler) Detect(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	var body detectReq
	if err := json.Unmarshal([]byte(req.Body), &body); err != nil {
		return errResp(http.StatusBadRequest, "invalid JSON body")
	}
	if body.S3Key == "" {
		return errResp(http.StatusBadRequest, "s3Key is required")
	}

	result, err := h.detector.DetectFromS3(ctx, body.S3Key)
	if err != nil {
		return errResp(http.StatusUnprocessableEntity, err.Error())
	}
	return jsonResp(http.StatusOK, result)
}
