import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Get existing certificate for https hosting
const existingCertificate = aws.acm.getCertificate({
    domain: "2bitblaster.blinkenlights.org",
    statuses: ["ISSUED"],
});

// Create an S3 bucket
const siteBucket = new aws.s3.Bucket("siteBucket", {
    acl: "private",
    website: {
        indexDocument: "index.html",
        errorDocument: "error.html",
    },
    versioning: {
        enabled: false
    }
});

// Create an Origin Access Identity to access the S3 bucket
const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity("originAccessIdentity", {
    comment: "Access identity for S3 bucket",
});

// Set the bucket policy to allow public read access
const siteBucketPolicy = new aws.s3.BucketPolicy("siteBucketPolicy", {
    bucket: siteBucket.bucket,
    policy: siteBucket.bucket.apply(publicReadPolicyForSiteBucket),
});

// Function to create a public read policy for the bucket
function publicReadPolicyForSiteBucket(bucketName: string): string {
    return JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: "*",
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${siteBucket.bucket}/*`],
            },
        ],
    });
}


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