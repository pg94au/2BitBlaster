locals {
  api_gateway_stage = "default"
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

data "aws_cloudfront_cache_policy" "managed-cachingdisabled" {
  name = "Managed-CachingDisabled"
}
