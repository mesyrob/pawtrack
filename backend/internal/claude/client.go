package claude

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/pawtrack/backend/internal/model"
)

const apiURL = "https://api.anthropic.com/v1/messages"

type Client struct {
	apiKey     string
	model      string
	httpClient *http.Client
}

func New(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		model:  "claude-sonnet-4-20250514",
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type ChatRequest struct {
	SystemPrompt string
	UserMessage  string
	ImageBase64  string // optional
	MediaType    string // e.g. "image/jpeg"
}

type ChatResponse struct {
	Reply         string           `json:"reply"`
	SuggestedLogs []model.LogEntry `json:"suggestedLogs,omitempty"`
	PetUpdates    *PetUpdates      `json:"petUpdates,omitempty"`
}

type PetUpdates struct {
	Breed   string        `json:"breed,omitempty"`
	Species model.Species `json:"species,omitempty"`
	Color   string        `json:"color,omitempty"`
	Size    model.PetSize `json:"size,omitempty"`
}

// Anthropic API types
type apiRequest struct {
	Model     string       `json:"model"`
	MaxTokens int          `json:"max_tokens"`
	System    string       `json:"system"`
	Messages  []apiMessage `json:"messages"`
}

type apiMessage struct {
	Role    string       `json:"role"`
	Content []apiContent `json:"content"`
}

type apiContent struct {
	Type      string     `json:"type"`
	Text      string     `json:"text,omitempty"`
	Source    *apiSource `json:"source,omitempty"`
}

type apiSource struct {
	Type      string `json:"type"`
	MediaType string `json:"media_type"`
	Data      string `json:"data"`
}

type apiResponse struct {
	Content []struct {
		Type string `json:"type"`
		Text string `json:"text,omitempty"`
	} `json:"content"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func (c *Client) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	// Build content blocks
	var content []apiContent

	if req.ImageBase64 != "" {
		content = append(content, apiContent{
			Type: "image",
			Source: &apiSource{
				Type:      "base64",
				MediaType: req.MediaType,
				Data:      req.ImageBase64,
			},
		})
	}

	if req.UserMessage != "" {
		content = append(content, apiContent{
			Type: "text",
			Text: req.UserMessage,
		})
	}

	if len(content) == 0 {
		return nil, fmt.Errorf("message or image required")
	}

	body := apiRequest{
		Model:     c.model,
		MaxTokens: 2048,
		System:    req.SystemPrompt,
		Messages: []apiMessage{
			{Role: "user", Content: content},
		},
	}

	payload, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, apiURL, bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("x-api-key", c.apiKey)
	httpReq.Header.Set("anthropic-version", "2023-06-01")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("send request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("anthropic API %d: %s", resp.StatusCode, string(respBody))
	}

	var apiResp apiResponse
	if err := json.Unmarshal(respBody, &apiResp); err != nil {
		return nil, fmt.Errorf("unmarshal response: %w", err)
	}

	if apiResp.Error != nil {
		return nil, fmt.Errorf("anthropic error: %s", apiResp.Error.Message)
	}

	// Extract text from response
	var text string
	for _, block := range apiResp.Content {
		if block.Type == "text" {
			text = block.Text
			break
		}
	}

	if text == "" {
		return nil, fmt.Errorf("no text in response")
	}

	return parseResponse(text)
}

// parseResponse extracts the JSON block from Claude's response text.
func parseResponse(text string) (*ChatResponse, error) {
	// Look for JSON between ```json ... ``` or { ... }
	jsonStr := extractJSON(text)
	if jsonStr == "" {
		// No structured data found — return as plain reply
		return &ChatResponse{Reply: strings.TrimSpace(text)}, nil
	}

	var resp ChatResponse
	if err := json.Unmarshal([]byte(jsonStr), &resp); err != nil {
		// If JSON parse fails, return the whole text as the reply
		return &ChatResponse{Reply: strings.TrimSpace(text)}, nil
	}

	return &resp, nil
}

// extractJSON finds the first JSON object in the text.
func extractJSON(text string) string {
	// Try ```json ... ``` first
	if start := strings.Index(text, "```json"); start != -1 {
		start += len("```json")
		if end := strings.Index(text[start:], "```"); end != -1 {
			return strings.TrimSpace(text[start : start+end])
		}
	}

	// Try ``` ... ``` (without language tag)
	if start := strings.Index(text, "```"); start != -1 {
		start += len("```")
		if end := strings.Index(text[start:], "```"); end != -1 {
			candidate := strings.TrimSpace(text[start : start+end])
			if len(candidate) > 0 && candidate[0] == '{' {
				return candidate
			}
		}
	}

	// Try finding a raw JSON object
	braceStart := strings.Index(text, "{")
	if braceStart == -1 {
		return ""
	}

	// Find matching closing brace
	depth := 0
	for i := braceStart; i < len(text); i++ {
		switch text[i] {
		case '{':
			depth++
		case '}':
			depth--
			if depth == 0 {
				return text[braceStart : i+1]
			}
		}
	}

	return ""
}
