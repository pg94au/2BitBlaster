import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { SSMClient, GetParameterCommand, PutParameterCommand } from "@aws-sdk/client-ssm";

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const ssmClient = new SSMClient({ region: process.env.AWS_REGION });
 
    console.log('Checking posted score.');    
    var candidateHighScore;
    let highScore = parseInt(event.body ?? '');
    if (!isNaN(highScore)) {
        candidateHighScore = highScore;
    }
    else {
        // Request did not contain a highScore value.
        console.log('Post is missing highScore.');
        return {
            statusCode: 400,
            body: 'Malformed body'
        };
    }
    console.log(`Candidate high score: ${candidateHighScore}`);

    // Fetch current high score to see if this one is greater.
    var previousHighScore;
    try {
        const getCommand = new GetParameterCommand({ Name: '2BitBlaster/HighScore' }); //TODO: uniqueness from environment variable?
        const getResponse = await ssmClient.send(getCommand);
        previousHighScore = parseInt(getResponse.Parameter?.Value ?? '');
        if (isNaN(previousHighScore)) previousHighScore = 0;

        if (candidateHighScore > previousHighScore) {
            console.log('Updating existing high score.');
            const putCommand = new PutParameterCommand({
                 Name: '2BitBlaster/HighScore',
                 Overwrite: true,
                 Type: 'String',
                 Value: candidateHighScore.toString()
                });
            const putResponse = await ssmClient.send(putCommand);

            // Return the new current high score in the response.
            console.log('Returning new high score.');
            return {
                statusCode: 200,
                body: candidateHighScore.toString()
            };
        }
    }
    catch (error) {
        console.error(`Error retrieving high score: ${error}`);
        return {
            statusCode: 200,
            body: candidateHighScore.toString()
        };
    }
};
