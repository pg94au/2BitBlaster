var AWS = require('aws-sdk');

exports.handler = async (event) => {
    
    var s3 = new AWS.S3();

    async function retrieveHighScore() {
        var getObjectParams = {
            Bucket: process.env.bucket,
            Key: 'highscore.txt'
        }

        const getResponse = await s3.getObject(getObjectParams).promise();
        const previousHighScore = getResponse.Body.toString('utf-8');

        return previousHighScore;
    }
    
    async function storeHighScore(score) {
        // Make a call to put this object in S3 as the new high score.    
        var putObjectParams = {
            Bucket: process.env.bucket,
            Key: 'highscore.txt',
            Body: candidateHighScore
        };
        
        return await s3.putObject(putObjectParams).promise();
    }

    console.log('Checking posted score.');    
    var candidateHighScore;
    try {
        let body = JSON.parse(event.body);
        if (body.highScore && typeof body.highScore == "string" && !isNaN(body.highScore)) {
            candidateHighScore = body.highScore;
        }
        else {
            // Request did not contain a JSON body with highScore property.
            console.log('Post is missing highScore.');
            return {
                statusCode: 400,
                body: 'Malformed body'
            };
        }
    }
    catch (err) {
        console.log('Post body malformed or missing.');
        return {
            statusCode: 400,
            body: 'Malformed or missing body'
        };
    }

    console.log('Candidate high score: ' + candidateHighScore);

    // Fetch current high score to see if this one is greater.
    var previousHighScore;
    try {
        previousHighScore = await retrieveHighScore();
        console.log('Existing high score: ' + previousHighScore);

        if (candidateHighScore > previousHighScore) {
            console.log('Updating existing high score.');
            await storeHighScore(candidateHighScore);

            // Return the new current high score in the response.
            console.log('Returning new high score.');
            return {
                statusCode: 200,
                body: candidateHighScore
            };
        }
    }
    catch (err) {
        if (err.code == 'NoSuchKey') {
            console.log('Writing first high score ever.');
            await storeHighScore(candidateHighScore);
            
            return {
                statusCode: 200,
                body: candidateHighScore
            };
        }
    }
    
    // Return the already present high score (was already higher than candidate).
    console.log('Returning existing higher score.');
    return {
        statusCode: 200,
        body: previousHighScore
    };
};
