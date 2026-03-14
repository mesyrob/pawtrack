package store

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	ddbtypes "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/pawtrack/backend/internal/model"
)

type Store struct {
	client    *dynamodb.Client
	petsTable string
	logsTable string
}

func New(client *dynamodb.Client, petsTable, logsTable string) *Store {
	return &Store{
		client:    client,
		petsTable: petsTable,
		logsTable: logsTable,
	}
}

func (s *Store) CreatePet(ctx context.Context, pet model.Pet) error {
	item, err := attributevalue.MarshalMap(pet)
	if err != nil {
		return fmt.Errorf("marshal pet: %w", err)
	}
	_, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: &s.petsTable,
		Item:      item,
	})
	return err
}

func (s *Store) GetPet(ctx context.Context, deviceID, petID string) (*model.Pet, error) {
	out, err := s.client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: &s.petsTable,
		Key: map[string]ddbtypes.AttributeValue{
			"deviceId": &ddbtypes.AttributeValueMemberS{Value: deviceID},
			"id":       &ddbtypes.AttributeValueMemberS{Value: petID},
		},
	})
	if err != nil {
		return nil, err
	}
	if out.Item == nil {
		return nil, nil
	}
	var pet model.Pet
	if err := attributevalue.UnmarshalMap(out.Item, &pet); err != nil {
		return nil, fmt.Errorf("unmarshal pet: %w", err)
	}
	return &pet, nil
}

func (s *Store) ListPets(ctx context.Context, deviceID string) ([]model.Pet, error) {
	out, err := s.client.Query(ctx, &dynamodb.QueryInput{
		TableName:              &s.petsTable,
		KeyConditionExpression: aws.String("deviceId = :d"),
		ExpressionAttributeValues: map[string]ddbtypes.AttributeValue{
			":d": &ddbtypes.AttributeValueMemberS{Value: deviceID},
		},
	})
	if err != nil {
		return nil, err
	}
	pets := make([]model.Pet, 0, len(out.Items))
	for _, item := range out.Items {
		var pet model.Pet
		if err := attributevalue.UnmarshalMap(item, &pet); err != nil {
			return nil, fmt.Errorf("unmarshal pet: %w", err)
		}
		pets = append(pets, pet)
	}
	return pets, nil
}

func (s *Store) UpdatePet(ctx context.Context, pet model.Pet) error {
	item, err := attributevalue.MarshalMap(pet)
	if err != nil {
		return fmt.Errorf("marshal pet: %w", err)
	}
	_, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName:           &s.petsTable,
		Item:                item,
		ConditionExpression: aws.String("attribute_exists(id)"),
	})
	return err
}

func (s *Store) DeletePet(ctx context.Context, deviceID, petID string) error {
	_, err := s.client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: &s.petsTable,
		Key: map[string]ddbtypes.AttributeValue{
			"deviceId": &ddbtypes.AttributeValueMemberS{Value: deviceID},
			"id":       &ddbtypes.AttributeValueMemberS{Value: petID},
		},
	})
	return err
}

func (s *Store) CreateLog(ctx context.Context, entry model.LogEntry) error {
	item, err := attributevalue.MarshalMap(entry)
	if err != nil {
		return fmt.Errorf("marshal log: %w", err)
	}
	_, err = s.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: &s.logsTable,
		Item:      item,
	})
	return err
}

func (s *Store) ListLogs(ctx context.Context, petID string) ([]model.LogEntry, error) {
	out, err := s.client.Query(ctx, &dynamodb.QueryInput{
		TableName:              &s.logsTable,
		KeyConditionExpression: aws.String("petId = :p"),
		ExpressionAttributeValues: map[string]ddbtypes.AttributeValue{
			":p": &ddbtypes.AttributeValueMemberS{Value: petID},
		},
		ScanIndexForward: aws.Bool(false),
	})
	if err != nil {
		return nil, err
	}
	logs := make([]model.LogEntry, 0, len(out.Items))
	for _, item := range out.Items {
		var entry model.LogEntry
		if err := attributevalue.UnmarshalMap(item, &entry); err != nil {
			return nil, fmt.Errorf("unmarshal log: %w", err)
		}
		logs = append(logs, entry)
	}
	return logs, nil
}
