resource "aws_lambda_function" "api" {
  function_name = "pawtrack-api-${var.environment}"
  role          = aws_iam_role.lambda.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.api.repository_url}:${var.image_tag}"
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      PETS_TABLE    = aws_dynamodb_table.pets.name
      LOGS_TABLE    = aws_dynamodb_table.logs.name
      PHOTOS_BUCKET = aws_s3_bucket.photos.id
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda]
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/pawtrack-api-${var.environment}"
  retention_in_days = 14
}
