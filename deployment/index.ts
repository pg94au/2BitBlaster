import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as synced_folder from "@pulumi/synced-folder";
import * as url from 'url';
import { ManagedPolicies } from "@pulumi/aws/iam";

const domain = "scratch.blinkenlights.org";

export = async () => {

    const accountId = (await aws.getCallerIdentity({})).accountId;

    async function getSiteCertificate(): Promise<aws.acm.GetCertificateResult> {
        const domainCertificate = await aws.acm.getCertificate({
            domain: domain,
            statuses: ["ISSUED"],
        }, {
            provider: new aws.Provider("aws", { region: "us-east-1" })
        });
        return domainCertificate;
    };
    
    async function createHighScoreFunction(api: aws.apigateway.RestApi): Promise<aws.lambda.Function> {
        // Create a docker image repository
        const ecrRepository = new awsx.ecr.Repository(
            "2-bit-blaster-ecr-repository",
            { name: "2-bit-blaster-ecr-repository" }
        );
    
        const highScoreLambdaImage = new awsx.ecr.Image("2-bit-blaster-lambda-image", {
            imageName: "2-bit-blaster-high-score-lambda-image",
            repositoryUrl: ecrRepository.url,
            context: "../highScores/",
        });
    
        // Create role for highScore lambda
        const highScoreLambdaRole = new aws.iam.Role("2-bit-blaster-high-score-lambda-role", {
            name: "2-bit-blaster-high-score-lambda-role",
            assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "lambda.amazonaws.com" }),
        });
    
        // Attach the AWSLambdaBasicExecutionRole policy to the role
        new aws.iam.RolePolicyAttachment("2-bit-blaster-high-score-lambda-basic-execution-role-policy-attachment", {
            role: highScoreLambdaRole,
            policyArn: aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole,
        });
    
        // Attach a policy to allow access to SSM Parameter Store
        const highScoreSsmPolicyDocument = aws.iam.getPolicyDocument({
            statements: [{
                effect: "Allow",
                actions: ["ssm:GetParameter", "ssm:PutParameter"],
                resources: [`arn:aws:ssm:ca-central-1:${accountId}:parameter/2BitBlaster/HighScore`]
            }],
        });
        const highScoreLambdaSsmPolicy = new aws.iam.Policy("2-bit-blaster-high-score-lambda-ssm-policy", {
            name: "2-bit-blaster-high-scorelambda-ssm-policy",
            description: "Policy to allow 2-Bit Blaster high score lambda to access parameter store",
            policy: highScoreSsmPolicyDocument.then(policyDocument => policyDocument.json),
        });
        const highScoreLambdaSsmRolePolicyAttachment = new aws.iam.RolePolicyAttachment("2-bit-blaster-high-score-lambda-ssm-role-policy-attachment", {
            role: highScoreLambdaRole.name,
            policyArn: highScoreLambdaSsmPolicy.arn,
        });
    
        // Create the Lambda function
        const highScoreLambda = new aws.lambda.Function("2-bit-blaster-high-score-lambda-function", {
            name: "2-bit-blaster-high-score-lambda-function",
            packageType: "Image",
            imageUri: highScoreLambdaImage.imageUri,
            role: highScoreLambdaRole.arn,
        });
    
        // Grant API Gateway permission to invoke the high score lambda function
        const highScoreLambdaApiPermission = new aws.lambda.Permission("2-bit-blaster-api-gateway-invoke-high-score-permission", {
            action: "lambda:InvokeFunction",
            function: highScoreLambda.arn,
            principal: "apigateway.amazonaws.com",
            sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,
        });

        return highScoreLambda;
    }

    function createSiteBucket(): aws.s3.BucketV2 {
        // Create an S3 bucket
        const siteBucket = new aws.s3.BucketV2(
            "2-bit-blaster-site-bucket", {
            tags: { name: "2-bit-blaster-site-bucket" }
        });

        const siteBucketAclV2 = new aws.s3.BucketAclV2(
            "2-bit-blaster-site-bucket-acl-v2", {
            bucket: siteBucket.id,
            acl: "private"
        });

        // Configure website configuration for site bucket
        const siteBucketWebsiteConfiguration = new aws.s3.BucketWebsiteConfigurationV2(
            "2-bit-blaster-site-bucket-website-configuration", {
            bucket: siteBucket.id,
            indexDocument: {
                suffix: "index.html",
            },
            errorDocument: {
                key: "error.html",
            }
        });

        // Disable versioning for site bucket
        const siteBucketVersioning = new aws.s3.BucketVersioningV2(
            "2-bit-blaster-site-bucket-versioning", {
            bucket: siteBucket.id,
            versioningConfiguration: {
                status: "Disabled",
            },
        });

        // Synchronize files between our build output folder and the static site bucket
        const siteSyncedFolder = new synced_folder.S3BucketFolder(
            "2-bit-blaster-site-bucket-folder", {
            path: "../dist",
            bucketName: siteBucket.bucket,
            acl: aws.s3.PrivateAcl
        });

        return siteBucket;
    }

    function deployApi(api: aws.apigateway.RestApi, highScoreLambda: aws.lambda.Function): aws.apigateway.Deployment {
        // Create a resource for the high score endpoint
        const highScoreApiGatewayResource = new aws.apigateway.Resource("2-bit-blaster-api-gateway-high-score-resource", {
            restApi: api.id,
            parentId: api.rootResourceId,
            pathPart: "highScore",
        });

        // Create a method for the resource
        const highScoreApiGatewayMethod = new aws.apigateway.Method("2-bit-blaster-api-gateway-high-score-method", {
            restApi: api.id,
            resourceId: highScoreApiGatewayResource.id,
            httpMethod: "POST",
            authorization: "NONE",
        });

        // Integrate the method with the Lambda function
        const integration = new aws.apigateway.Integration("2-bit-blaster-api-gateway-high-score-integration", {
            restApi: api.id,
            resourceId: highScoreApiGatewayResource.id,
            httpMethod: highScoreApiGatewayMethod.httpMethod,
            integrationHttpMethod: "POST",
            type: "AWS_PROXY",
            uri: highScoreLambda.invokeArn,
        });

        // Deploy the REST API
        const deployment = new aws.apigateway.Deployment("2-bit-blaster-api-gateway-deployment", {
            restApi: api.id,
            stageName: "prod",
        }, { dependsOn: [integration] });

        return deployment;
    }


    // Get existing certificate for https hosting
    const siteCertificate = await getSiteCertificate();

    const siteBucket = createSiteBucket();

    // Create an API Gateway REST API
    const api = new aws.apigateway.RestApi("2-bit-blaster-api-gateway", {
        description: "API Gateway for 2-Bit Blaster",
    });

    const highScoreLambda = await createHighScoreFunction(api);

    const deployment = deployApi(api, highScoreLambda);


    const cloudFrontOriginAccessControl = new aws.cloudfront.OriginAccessControl("2-bit-blaster-origin-access-control", {
        name: siteBucket.bucketDomainName, // TODO: Is this really a good name?
        signingBehavior: "always",
        signingProtocol: "sigv4",
        originAccessControlOriginType: "s3"
    });

    // Create new Cloudfront deployment
    const distribution = new aws.cloudfront.Distribution("2-bit-blaster-distribution", {
        comment: "2-Bit Blaster distribution",
        enabled: true,
        isIpv6Enabled: true,
        defaultRootObject: "index.html",
        priceClass: "PriceClass_All",
        aliases: [domain],
        origins: [{
            originId: siteBucket.id,
            domainName: siteBucket.bucketDomainName,
            originAccessControlId: cloudFrontOriginAccessControl.id
        },{
            originId: api.id,
            domainName: deployment.invokeUrl.apply(u => url.parse(u).host!), // We just want the host portion of this URL.
            customOriginConfig: {
                httpPort: 80,
                httpsPort: 443,
                originProtocolPolicy: "https-only",
                originSslProtocols: ["TLSv1.2"]
            }
        }],
        defaultCacheBehavior: {
            targetOriginId: siteBucket.id,
            allowedMethods: ["GET", "HEAD"],
            cachedMethods: ["GET", "HEAD"],
            compress: true,
            viewerProtocolPolicy: "redirect-to-https",
            forwardedValues: {
                queryString: true,
                cookies: {
                    forward: "none"
                }
            }
        },
        orderedCacheBehaviors: [{
            pathPattern: "/highScore",
            allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
            cachedMethods: ["GET", "HEAD"],
            targetOriginId: api.id,
            cachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad", // AWS Managed CachingDisabled policy
            minTtl: 0,
            defaultTtl: 0,
            maxTtl: 0,
            compress: true,
            viewerProtocolPolicy: "https-only"
        }],
        restrictions: {
            geoRestriction: {
                restrictionType: "none"
            }
        },
        viewerCertificate: {
            acmCertificateArn: siteCertificate.arn,
            sslSupportMethod: "sni-only"
        }
    });

    const siteBucketPolicy = new aws.s3.BucketPolicy("2-bit-blaster-site-bucket-policy", {
        bucket: siteBucket.bucket,
        policy: pulumi.output({
            Version: "2008-10-17",
            Statement: [{
                Action: ["s3:GetObject"],
                Effect: "Allow",
                Resource: pulumi.interpolate`${siteBucket.arn}/*`,
                Principal: { "Service": "cloudfront.amazonaws.com" },
                Condition: {
                    StringEquals: {
                        "AWS:SourceArn": distribution.arn
                    }
                }
            }],
        }).apply(JSON.stringify),
    });


    // Export the URL of the API
    return { 
        apiUrl: deployment.invokeUrl,
        siteDomainName: distribution.domainName,
     };
}
