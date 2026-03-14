resource "aws_dynamodb_table" "pets" {
  name         = "pawtrack-pets-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "deviceId"
  range_key    = "id"

  attribute {
    name = "deviceId"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "logs" {
  name         = "pawtrack-logs-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "petId"
  range_key    = "id"

  attribute {
    name = "petId"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }
}
