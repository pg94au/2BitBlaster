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
}


# High score
resource "aws_s3_bucket" "highscore-bucket" {
  bucket = "${local.bucket}-highscore"
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "example" {
  bucket = aws_s3_bucket.highscore-bucket.id

  block_public_acls   = true
  block_public_policy = true
}
