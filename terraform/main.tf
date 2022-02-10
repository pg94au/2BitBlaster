locals {
  api_gateway_stage = "default"
  high_score_path = "/highScore"
}

# Certificate for hosting public site through Cloudfront
data "aws_acm_certificate" "certificate" {
  domain      = local.domain
  types       = ["AMAZON_ISSUED"]
  # certificates for CloudFront must be in us-east-1
  provider    = aws.us-east-1
  most_recent = true
}

# S3 Bucket to store static files for site
resource "aws_s3_bucket" "bucket" {
  bucket = local.bucket
  acl    = "private"
  website {
    index_document = "index.html"
  }
  versioning {
    enabled = false
  }
}

# Associate policy to allow Cloudfront to access S3 bucket
resource "aws_s3_bucket_policy" "bucket-policy" {
  bucket = aws_s3_bucket.bucket.id
  policy = data.aws_iam_policy_document.allow-access-from-cloudfront.json
}

# Policy which allows Cloudfront distribution to access static site S3 bucket
data "aws_iam_policy_document" "allow-access-from-cloudfront" {
  statement {
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.origin-access-identity.iam_arn]
    }
    actions = [
      "s3:GetObject"
    ]
    resources = [
      "${aws_s3_bucket.bucket.arn}/*"
    ]
  }
}

# Restrict public access to site S3 bucket
resource "aws_s3_bucket_public_access_block" "bucket-access" {
  bucket = aws_s3_bucket.bucket.id

  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}

# Identity for site Cloudfront distribution
resource "aws_cloudfront_origin_access_identity" "origin-access-identity" {
  comment = "s3-my-webapp.example.com"
}

# Cloudfront distribution for site
resource "aws_cloudfront_distribution" "distribution" {
  enabled = true
  origin {
    origin_id = aws_s3_bucket.bucket.id
    domain_name = aws_s3_bucket.bucket.bucket_domain_name
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.origin-access-identity.cloudfront_access_identity_path
    }
  }
  origin {
    origin_id = "highScore"
    origin_path = "/${local.api_gateway_stage}"
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

# Cloudfront cache policy to disable caching
data "aws_cloudfront_cache_policy" "managed-cachingdisabled" {
  name = "Managed-CachingDisabled"
}
