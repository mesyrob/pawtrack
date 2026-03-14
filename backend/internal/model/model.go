package model

import "time"

type Species string

const (
	SpeciesDog    Species = "dog"
	SpeciesCat    Species = "cat"
	SpeciesRabbit Species = "rabbit"
	SpeciesOther  Species = "other"
)

type PetSize string

const (
	PetSizeSmall  PetSize = "small"
	PetSizeMedium PetSize = "medium"
	PetSizeLarge  PetSize = "large"
)

type Sex string

const (
	SexMale   Sex = "male"
	SexFemale Sex = "female"
)

type LogType string

const (
	LogTypeWeight      LogType = "weight"
	LogTypeVaccination LogType = "vaccination"
	LogTypeDeworming   LogType = "deworming"
	LogTypeFleaTick    LogType = "flea_tick"
	LogTypeVetVisit    LogType = "vet_visit"
	LogTypeMedication  LogType = "medication"
	LogTypeSymptom     LogType = "symptom"
	LogTypeNote        LogType = "note"
)

type TrackingConfig struct {
	Vaccinations bool `json:"vaccinations" dynamodbav:"vaccinations"`
	Deworming    bool `json:"deworming" dynamodbav:"deworming"`
	FleaTick     bool `json:"fleaTick" dynamodbav:"fleaTick"`
	Weight       bool `json:"weight" dynamodbav:"weight"`
	Symptoms     bool `json:"symptoms" dynamodbav:"symptoms"`
}

type Pet struct {
	ID             string         `json:"id" dynamodbav:"id"`
	DeviceID       string         `json:"deviceId" dynamodbav:"deviceId"`
	Name           string         `json:"name" dynamodbav:"name"`
	Species        Species        `json:"species" dynamodbav:"species"`
	Breed          string         `json:"breed" dynamodbav:"breed"`
	Birthday       string         `json:"birthday" dynamodbav:"birthday"`
	Sex            Sex            `json:"sex" dynamodbav:"sex"`
	Size           PetSize        `json:"size" dynamodbav:"size"`
	Color          string         `json:"color" dynamodbav:"color"`
	PhotoURL       string         `json:"photoUrl,omitempty" dynamodbav:"photoUrl,omitempty"`
	VetClinic      string         `json:"vetClinic,omitempty" dynamodbav:"vetClinic,omitempty"`
	TrackingConfig TrackingConfig `json:"trackingConfig" dynamodbav:"trackingConfig"`
	CreatedAt      string         `json:"createdAt" dynamodbav:"createdAt"`
}

type LogData struct {
	Weight         *float64 `json:"weight,omitempty" dynamodbav:"weight,omitempty"`
	WeightUnit     string   `json:"weightUnit,omitempty" dynamodbav:"weightUnit,omitempty"`
	VaccineName    string   `json:"vaccineName,omitempty" dynamodbav:"vaccineName,omitempty"`
	MedicationName string   `json:"medicationName,omitempty" dynamodbav:"medicationName,omitempty"`
	Dosage         string   `json:"dosage,omitempty" dynamodbav:"dosage,omitempty"`
	Duration       string   `json:"duration,omitempty" dynamodbav:"duration,omitempty"`
	Severity       string   `json:"severity,omitempty" dynamodbav:"severity,omitempty"`
	VetName        string   `json:"vetName,omitempty" dynamodbav:"vetName,omitempty"`
	Cost           *float64 `json:"cost,omitempty" dynamodbav:"cost,omitempty"`
}

type LogEntry struct {
	ID        string  `json:"id" dynamodbav:"id"`
	PetID     string  `json:"petId" dynamodbav:"petId"`
	Type      LogType `json:"type" dynamodbav:"type"`
	Date      string  `json:"date" dynamodbav:"date"`
	Title     string  `json:"title" dynamodbav:"title"`
	Notes     string  `json:"notes,omitempty" dynamodbav:"notes,omitempty"`
	Data      *LogData `json:"data,omitempty" dynamodbav:"data,omitempty"`
	CreatedAt string  `json:"createdAt" dynamodbav:"createdAt"`
}

type BreedDetectionResult struct {
	Species    Species `json:"species"`
	Breed      string  `json:"breed"`
	Color      string  `json:"color"`
	Size       PetSize `json:"size"`
	Confidence float64 `json:"confidence"`
}

func NewTimestamp() string {
	return time.Now().UTC().Format(time.RFC3339)
}
