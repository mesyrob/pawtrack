output "api_url" {
  value = aws_apigatewayv2_api.api.api_endpoint
}

output "ecr_repository_url" {
  value = aws_ecr_repository.api.repository_url
}

output "photos_bucket" {
  value = aws_s3_bucket.photos.id
}
