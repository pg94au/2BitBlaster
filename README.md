# 2BitBlaster
2-Bit Blaster written in TypeScript

The history of this game is that it originally started off written in JavaScript as part of a personal goal to learn more about JavaScript, gulp and Browerserify, and also to fulfill a long-held goal of writing a classic arcade shoot'em up style game.  When the XBox One was initially opened to individual developers, I stopped working on that project and decided to entirely rewrite it in C# to run as a UWP application.  Then came my desire to learn more about TypeScript and Webpack, and so I went back to the original JavaScript version to port it, and this is the result.  It's been a fun learning experience with all of the technologies that have been involved!

This is a work in progress...
<br>
<br>

<img src=/docs/screenshot.jpg width=800/>
<br>

Latest build hosted at https://2bitblaster.blinkenlights.org
<br>
<br>

## Building and Running Locally

**How to Run Locally**

```git clone ...
cd 2BitBlaster

npm install
npm run build
npm run test (optional)
npm run lint (optional)

cd host
node app.js
```

*Now visit http://localhost:3000 in your browser!*

## Cloud Deployment

This project uses GitHub Actions to deploy to AWS using Pulumi.  The following diagram depicts deployed stack.

![AWS Deployment Diagram](/docs/2-Bit-Blaster-AWS-Deployment.svg)

As depicted, all of the static files related to the site are hosted from an S3 bucket.  High scores are managed by an AWS Lambda function which maintains the high score as a parameter value in Parameter Store, and is triggered via an HTTP API Gateway.  Both the static site and high score endpoint are exposed as origins defined in a CloudFront CDN.
