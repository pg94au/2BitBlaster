locals {
  high_score_path = "/highScore"
}

data "aws_acm_certificate" "certificate" {
  domain      = local.domain
  types       = ["AMAZON_ISSUED"]
  # certificates for CloudFront must be in us-east-1
  provider    = aws.us-east-1
  most_recent = true
}

resource "aws_s3_bucket" "bucket" {
  bucket = local.bucket
  acl    = "public-read"
  website {
    index_document = "index.html"
  }
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Sid": "PublicReadGetObject",
          "Effect": "Allow",
          "Principal": "*",
          "Action": "s3:GetObject",
          "Resource": "arn:aws:s3:::${local.bucket}/*"
      }
  ]
}
POLICY
}

resource "aws_cloudfront_distribution" "distribution" {
  enabled = true
  origin {
    origin_id = aws_s3_bucket.bucket.id
    domain_name = aws_s3_bucket.bucket.bucket_domain_name
  }
  origin {
    origin_id = "highScore"
    origin_path = "/default"
    custom_origin_config {
      http_port = 80
      https_port = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = ["TLSv1.2"]
    }
    domain_name = replace(replace(aws_apigatewayv2_api.highscore-api-gateway.api_endpoint, "/^https?:\\/\\//", ""), "/\\/.*$/", "")
  }
  default_root_object = "index.html"
  price_class = "PriceClass_All"
  aliases = [ local.domain ]
  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.certificate.arn
    ssl_support_method = "sni-only"
  }
  is_ipv6_enabled = true
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  default_cache_behavior {
    allowed_methods = [ "GET", "HEAD" ]
    compress = true
    target_origin_id = aws_s3_bucket.bucket.id
    cached_methods = [ "GET", "HEAD" ]
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }
  }
  ordered_cache_behavior {
    path_pattern     = local.high_score_path
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "highScore"
    cache_policy_id = data.aws_cloudfront_cache_policy.managed-cachingdisabled.id

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "https-only"
  }
}

data "aws_cloudfront_cache_policy" "managed-cachingdisabled" {
  name = "Managed-CachingDisabled"
}


### High score

# Bucket for lambda
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

data "archive_file" "highscore-lambda-zip" {
    type        = "zip"
    source_dir  = "../aws/lambda/highScore"
    output_path = "highscore-lambda.zip"
}

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


### API Gateway
resource "aws_apigatewayv2_api" "highscore-api-gateway" {
  name          = local.highscore
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "highscore-api-gateway-stage" {
  api_id = aws_apigatewayv2_api.highscore-api-gateway.id

  name        = "default"
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
