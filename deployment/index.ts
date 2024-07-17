import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker";


// Get current account ID
const callerIdentity = aws.getCallerIdentity({});
const accountId = callerIdentity.then(identity => identity.accountId);


// Create a docker image repository
const ecrRepository = new awsx.ecr.Repository(
    "2-bit-blaster-ecr-repository",
    { name: "2-bit-blaster-ecr-repository" }
);

const highScoreLambdaImage = new awsx.ecr.Image("2-bit-blaster-lambda-image", {
    repositoryUrl: ecrRepository.url,
    context: "../highScores/",
    dockerfile: "Dockerfile"
});


// const authToken = aws.ecr.getAuthorizationTokenOutput({
//     registryId: ecrRepository.repository.registryId,
// });

// const highScoreLambdaImage = new docker.Image("2-bit-blaster-lambda-image", {
//     build: {
//         args: {
//             BUILDKIT_INLINE_CACHE: "1",
//         },
//         cacheFrom: {
//             images: [pulumi.interpolate`${ecrRepository.repository.repositoryUrl}:latest`],
//         },
//         context: "../highScores/",
//         dockerfile: "Dockerfile",
//     },
//     imageName: pulumi.interpolate`${ecrRepository.repository.repositoryUrl}:latest`,
//     registry: {
//         password: pulumi.secret(authToken.apply(authToken => authToken.password)),
//         server: ecrRepository.repository.repositoryUrl,
//     },
// });


// const highScoreLambdaImage = ecrRepository.buildAndPushImage({
//     context: ".../highScores",
// });

// // Define the Docker image
// const highScoreLambdaImage = new docker.Image("highScoreLambdaImage", {
//     build: {
//         context: "../highScores",
//     },
//     imageName: "2-bit-blaster-high-score",
// });


// // Create an IAM role for the Lambda function
// const role = new aws.iam.Role("lambdaRole", {
//     assumeRolePolicy: {
//         Version: "2012-10-17",
//         Statement: [{
//             Action: "sts:AssumeRole",
//             Principal: {
//                 Service: "lambda.amazonaws.com",
//             },
//             Effect: "Allow",
//         }],
//     },
// });


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
//TODO: Narrow this down
// new aws.iam.RolePolicyAttachment("highScoreLambdaSsmRolePolicyAttachment", {
//     role: highScoreLambdaRole,
//     policyArn: aws.iam.ManagedPolicies.AmazonSSMFullAccess,
// });

// Attach a policy to allow access to SSM Parameter Store
const highScoreSsmPolicyDocument = aws.iam.getPolicyDocument({
    statements: [{
        effect: "Allow",
        actions: ["ssm:GetParameter", "ssm:PutParameter"],
        resources: [`arn:aws:ssm:ca-central-1:${accountId}:parameter/2BitBlaster/highScore`],
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
const lambda = new aws.lambda.Function("2-bit-blaster-high-score-lambda-function", {
    name: "2-bit-blaster-high-score-lambda-function",
    packageType: "Image",
    imageUri: highScoreLambdaImage.imageUri,
    role: highScoreLambdaRole.arn,
});




// // Create lambda function
// const lambdaFunction = new aws.lambda.Function("highScoreLambda", {
//     runtime: aws.lambda.NodeJS12dXRuntime,
//     role: highScoreLambdaRole.arn,
//     handler: "index.handler",
//     code: new pulumi.asset.AssetArchive({
//         ".": new pulumi.asset.FileArchive("./lambda"), // Assumes your Lambda code is in the 'lambda' directory
//     }),
// });
