package breed

import (
	"context"
	"fmt"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/rekognition"
	rektypes "github.com/aws/aws-sdk-go-v2/service/rekognition/types"
	"github.com/pawtrack/backend/internal/model"
)

var speciesParents = map[string]model.Species{
	"Dog":    model.SpeciesDog,
	"Cat":    model.SpeciesCat,
	"Rabbit": model.SpeciesRabbit,
}

type Detector struct {
	client *rekognition.Client
	bucket string
}

func NewDetector(client *rekognition.Client, bucket string) *Detector {
	return &Detector{client: client, bucket: bucket}
}

func (d *Detector) DetectFromS3(ctx context.Context, s3Key string) (*model.BreedDetectionResult, error) {
	out, err := d.client.DetectLabels(ctx, &rekognition.DetectLabelsInput{
		Image: &rektypes.Image{
			S3Object: &rektypes.S3Object{
				Bucket: &d.bucket,
				Name:   &s3Key,
			},
		},
		MaxLabels:     aws.Int32(50),
		MinConfidence: aws.Float32(50),
	})
	if err != nil {
		return nil, fmt.Errorf("rekognition detect labels: %w", err)
	}

	var bestBreed string
	var bestSpecies model.Species
	var bestConfidence float32

	for _, label := range out.Labels {
		species, isBreed := classifyLabel(label)
		if !isBreed {
			continue
		}
		if label.Confidence != nil && *label.Confidence > bestConfidence {
			bestBreed = aws.ToString(label.Name)
			bestSpecies = species
			bestConfidence = *label.Confidence
		}
	}

	if bestBreed == "" {
		// Fall back: look for a top-level species label
		for _, label := range out.Labels {
			name := aws.ToString(label.Name)
			if sp, ok := speciesParents[name]; ok {
				return &model.BreedDetectionResult{
					Species:    sp,
					Breed:      "Mixed / Unknown",
					Color:      "",
					Size:       model.PetSizeMedium,
					Confidence: float64(*label.Confidence) / 100,
				}, nil
			}
		}
		return nil, fmt.Errorf("no animal detected in image")
	}

	return &model.BreedDetectionResult{
		Species:    bestSpecies,
		Breed:      bestBreed,
		Color:      "",
		Size:       guessSize(bestSpecies, bestBreed),
		Confidence: float64(bestConfidence) / 100,
	}, nil
}

// classifyLabel checks if a Rekognition label is a breed by walking its parent chain.
func classifyLabel(label rektypes.Label) (model.Species, bool) {
	for _, parent := range label.Parents {
		parentName := aws.ToString(parent.Name)
		if sp, ok := speciesParents[parentName]; ok {
			return sp, true
		}
	}
	return "", false
}

// guessSize provides a rough size estimate based on known breed patterns.
func guessSize(species model.Species, breed string) model.PetSize {
	if species == model.SpeciesCat || species == model.SpeciesRabbit {
		return model.PetSizeSmall
	}
	lower := strings.ToLower(breed)
	largeBreeds := []string{"retriever", "shepherd", "dane", "mastiff", "bernard", "newfoundland", "rottweiler", "husky", "malamute", "wolfhound"}
	for _, b := range largeBreeds {
		if strings.Contains(lower, b) {
			return model.PetSizeLarge
		}
	}
	smallBreeds := []string{"chihuahua", "pomeranian", "yorkshire", "maltese", "shih tzu", "pekingese", "papillon", "dachshund"}
	for _, b := range smallBreeds {
		if strings.Contains(lower, b) {
			return model.PetSizeSmall
		}
	}
	return model.PetSizeMedium
}
