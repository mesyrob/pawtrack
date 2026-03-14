variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "image_tag" {
  type        = string
  description = "Container image tag for Lambda (typically git SHA)"
  default     = "latest"
}

variable "anthropic_api_key" {
  type        = string
  description = "Anthropic API key for Claude-powered features (breed detection, log parsing, health insights)"
  sensitive   = true
  default     = ""
}
