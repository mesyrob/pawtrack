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
