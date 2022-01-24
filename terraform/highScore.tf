# Bucket in which to store the high score
resource "aws_s3_bucket" "highscore-bucket" {
  bucket = local.highscore
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "highscore-bucket-access" {
  bucket = aws_s3_bucket.highscore-bucket.id

  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}

# Role for lambda
resource "aws_iam_role" "highscore-lambda-role" {
 name   = "${local.highscore}-lambda-role"
 assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

data "aws_iam_policy" "AmazonS3FullAccess" {
  arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

# Consider limiting the policy to specify only the related high score bucket.
resource "aws_iam_role_policy_attachment" "highscore-lambda-role-s3-full-access-policy-attachment" {
  role       = aws_iam_role.highscore-lambda-role.name
  policy_arn = data.aws_iam_policy.AmazonS3FullAccess.arn
}

# Consider narrowing the resource ARN for this policy (not *:*:*).
resource "aws_iam_policy" "highscore-lambda-logging-policy" {
  name         = "${local.highscore}-lambda-logging-policy"
  path         = "/"
  description  = "IAM policy for logging from high score lambda"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "highscore-lambda-role-logging-policy-attachment" {
  role        = aws_iam_role.highscore-lambda-role.name
  policy_arn  = aws_iam_policy.highscore-lambda-logging-policy.arn
}

# Create a zip archive containing the lambda sources.
data "archive_file" "highscore-lambda-zip" {
    type        = "zip"
    source_dir  = "../aws/lambda/highScore"
    output_path = "highscore-lambda.zip"
}

# The lambda function
resource "aws_lambda_function" "highscore-lambda-function" {
  filename = "highscore-lambda.zip"
  function_name = local.highscore
  role = aws_iam_role.highscore-lambda-role.arn
  handler = "index.handler"
  source_code_hash = "${data.archive_file.highscore-lambda-zip.output_base64sha256}"
  runtime = "nodejs14.x"
  environment {
    variables = {
      bucket = local.highscore
    }
  }
}

# Logging for the lambda
resource "aws_cloudwatch_log_group" "highscore-lambda-cloudwatch-log-group" {
  name              = "/aws/lambda/${aws_lambda_function.highscore-lambda-function.function_name}"
  retention_in_days = 14
}


### API Gateway
resource "aws_apigatewayv2_api" "highscore-api-gateway" {
  name          = local.highscore
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "highscore-api-gateway-stage" {
  api_id = aws_apigatewayv2_api.highscore-api-gateway.id

  name        = local.api_gateway_stage
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "highscore-api-gateway-integration" {
  api_id = aws_apigatewayv2_api.highscore-api-gateway.id

  integration_uri    = aws_lambda_function.highscore-lambda-function.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "highscore-api-gateway-route" {
  api_id = aws_apigatewayv2_api.highscore-api-gateway.id

  route_key = "POST ${local.high_score_path}"
  target    = "integrations/${aws_apigatewayv2_integration.highscore-api-gateway-integration.id}"
}

resource "aws_lambda_permission" "highscore-allow-api-gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.highscore-lambda-function.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.highscore-api-gateway.execution_arn}/*/*"
}
