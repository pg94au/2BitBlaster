output "bucket_website_endpoint" {
    description = "Public HTTP endpoint of S3 bucket"
    value       = aws_s3_bucket.bucket.website_endpoint
}

output "distribution_domain_name" {
    description = "Public HTTP endpoint of distribution"
    value = aws_cloudfront_distribution.distribution.domain_name
}

output "distribution_id" {
    description = "ID of Cloudfront distribution"
    value = aws_cloudfront_distribution.distribution.id
}
