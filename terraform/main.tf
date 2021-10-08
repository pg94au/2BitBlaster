resource "aws_s3_bucket" "bucket" {
  bucket = "2bitblaster"
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
          "Resource": "arn:aws:s3:::2bitblaster/*"
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
  aliases = [ "2bitblaster.blinkenlights.org" ]
  viewer_certificate {
    // Find this by name 2bitblaster.blinkenlights.org in case it changes?
    acm_certificate_arn = "arn:aws:acm:us-east-1:663866322745:certificate/418d0ffb-7408-4154-85e2-1ad7fd147a02"
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
