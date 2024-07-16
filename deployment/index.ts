import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as docker from "@pulumi/docker";


// Get current account ID
const callerIdentity = aws.getCallerIdentity({});
const accountId = callerIdentity.then(identity => identity.accountId);


// Define the Docker image
const highScoreLambdaImage = new docker.Image("highScoreLambdaImage", {
    build: {
        context: "../highScores",
    },
    imageName: "2-bit-blaster-high-score",
});


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
const highScoreLambdaRole = new aws.iam.Role("highScoreLambdaRole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "lambda.amazonaws.com" }),
});

// Attach the AWSLambdaBasicExecutionRole policy to the role
new aws.iam.RolePolicyAttachment("highScoreLambdaBasicExecutionRolePolicyAttachment", {
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
const highScoreLambdaSsmPolicy = new aws.iam.Policy("highScoreLambdSsmPolicy", {
    name: "highScore-lambda-ssm-policy",
    description: "Policy to allow 2-Bit Blaster high score lambda to access parameter store",
    policy: highScoreSsmPolicyDocument.then(policyDocument => policyDocument.json),
});
const highScoreLambdaSsmRolePolicyAttachment = new aws.iam.RolePolicyAttachment("highScoreLambdaSsmRolePolicyAttachment", {
    role: highScoreLambdaRole.name,
    policyArn: highScoreLambdaSsmPolicy.arn,
});


// Create the Lambda function
const lambda = new aws.lambda.Function("highScoreLambdaFunction", {
    packageType: "Image",
    imageUri: highScoreLambdaImage.imageName,
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
