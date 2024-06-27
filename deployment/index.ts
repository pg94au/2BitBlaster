import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Resource } from "resource-loader";


const domain = "2bitblaster.blinkenlights.org";
const highScorePath = "/highScore";


// Get existing certificate for https hosting
const domainCertificate = aws.acm.getCertificate({
    domain: domain,
    statuses: ["ISSUED"],
});

// Create an S3 bucket
const siteBucket = new aws.s3.BucketV2("siteBucket", {
    acl: "private",
    website: {
        indexDocument: "index.html",
        errorDocument: "error.html",
    },
    versioning: {
        enabled: false
    }
});

const siteBucketAcl = new aws.s3.BucketAclV2("siteBucketAcl", {
    bucket: siteBucket.id,
    acl: "private",
});

const siteS3OriginId = "siteS3Origin";

// Create an Origin Access Identity to access the S3 bucket
const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity("originAccessIdentity", {
    comment: "Access identity for S3 bucket",
});

const siteS3Distribution = new aws.cloudfront.Distribution("siteS3Distribution", {
    origins: [
        {
            domainName: siteBucket.bucketRegionalDomainName,
            originId: siteS3OriginId,
            originAccessIdentity: {
                originAccessIdentity.cloudfront_access_identity_path
            }
        },
        {
            originId: "highScore",
            originPath: "default",
            custom_origin_config: {
                httpPort: 80,
                httpsPort: 443,
                originProtocolPolicy: "https-only",
                originSslProtocols: ["TLSv1.2"]
            }
        }
    ],
    enabled: true,
    isIpv6Enabled: true,
    comment: "Distribution for 2-Bit Blaster",
    defaultRootObject: "index.html",
    loggingConfig: {
        includeCookies: false,
        bucket: "mylogs.s3.amazonaws.com",
        prefix: "myprefix",
    },
    aliases: [domain],
    defaultCacheBehavior: {
        allowedMethods: ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"],
        cachedMethods: ["GET", "HEAD"],
        targetOriginId: siteBucket.bucket.id,
        forwardedValues: {
            queryString: true,
            cookies: {
                forward: "none",
            },
        },
        viewerProtocolPolicy: "allow-all",
        minTtl: 0,
        defaultTtl: 3600,
        maxTtl: 86400,
    },
    orderedCacheBehaviors: [
        {
            pathPattern: highScorePath,
            allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
            cachedMethods: ["GET", "HEAD", "OPTIONS"],
            targetOriginId: "highScore",
            minTtl: 0,
            defaultTtl: 0,
            maxTtl: 0,
            compress: true,
            viewerProtocolPolicy: "https-only",
        }
    ],
    priceClass: "PriceClass_100",
    restrictions: {
        geoRestriction: {
            restrictionType: "none"
        }
    },
    viewerCertificate: {
        acmCertificateArn: domainCertificate.arn,
        sslSupportMethod: "sni-only"
    },
});




// Set the bucket policy to allow public read access
const siteBucketPolicy = new aws.s3.BucketPolicy("siteBucketPolicy", {
    bucket: siteBucket.bucket,
    policy: siteBucket.bucket.apply(policyForSiteBucket),
});

// Function to create a public read policy for the bucket
function policyForSiteBucket(bucketName: string): string {
    return JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: {
                    "AWS": originAccessIdentity.originAccessIdentity.iam_arn
                },
                Action: ["s3:GetObject"],
                Resource: [`{siteBucket.bucket.arn}/*`]
            },
        ],
    });
}

const siteBucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock("siteBucketPublicAccessBlock", {
    bucket: siteBucket.id,
    blockPublicAcls: true,
    blockPublicPolicy: true,
    ignorePublicAcls: true,
    restrictPublicBuckets: true
});

const siteOriginAccessPolicy = new aws.s3.OriginAccessIdentity("siteOriginAccessPolicy", {
    Comment: "2-Bit Blaster"
});

const siteDistribution = new aws.cloudfront.Distribution()



// # Cloudfront distribution for site
// resource "aws_cloudfront_distribution" "distribution" {
//   enabled = true
//   origin {
//     origin_id = aws_s3_bucket.bucket.id
//     domain_name = aws_s3_bucket.bucket.bucket_domain_name
//     s3_origin_config {
//       origin_access_identity = aws_cloudfront_origin_access_identity.origin-access-identity.cloudfront_access_identity_path
//     }
//   }
//   origin {
//     origin_id = "highScore"
//     origin_path = "/${local.api_gateway_stage}"
//     custom_origin_config {
//       http_port = 80
//       https_port = 443
//       origin_protocol_policy = "https-only"
//       origin_ssl_protocols = ["TLSv1.2"]
//     }
//     domain_name = replace(replace(aws_apigatewayv2_api.highscore-api-gateway.api_endpoint, "/^https?:\\/\\//", ""), "/\\/.*$/", "")
//   }
//   default_root_object = "index.html"
//   price_class = "PriceClass_All"
//   aliases = [ local.domain ]
//   viewer_certificate {
//     acm_certificate_arn = data.aws_acm_certificate.certificate.arn
//     ssl_support_method = "sni-only"
//   }
//   is_ipv6_enabled = true
//   restrictions {
//     geo_restriction {
//       restriction_type = "none"
//     }
//   }
//   default_cache_behavior {
//     allowed_methods = [ "GET", "HEAD" ]
//     compress = true
//     target_origin_id = aws_s3_bucket.bucket.id
//     cached_methods = [ "GET", "HEAD" ]
//     viewer_protocol_policy = "redirect-to-https"
//     forwarded_values {
//       query_string = true
//       cookies {
//         forward = "none"
//       }
//     }
//   }
//   ordered_cache_behavior {
//     path_pattern     = local.high_score_path
//     allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
//     cached_methods   = ["GET", "HEAD"]
//     target_origin_id = "highScore"
//     cache_policy_id = data.aws_cloudfront_cache_policy.managed-cachingdisabled.id

//     min_ttl                = 0
//     default_ttl            = 0
//     max_ttl                = 0
//     compress               = true
//     viewer_protocol_policy = "https-only"
//   }
// }







// Export the name of the bucket
export const bucketName = bucket.id;


/*
// Replace with your existing ACM certificate ARN
const existingCertificateArn = "arn:aws:acm:region:account-id:certificate/certificate-id";

// Get the existing ACM certificate
const existingCertificate = aws.acm.getCertificate({
    arn: existingCertificateArn,
});
*/