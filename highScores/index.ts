import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

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
    try {
        const command = new GetParameterCommand({ Name: '2BitBlaster/HighScore' });
        const response = await ssmClient.send(command);
        let previousHighScore = response.Parameter?.Value;
    }
    catch (error) {
        console.error(`Error retrieving high score: ${error}`);
        return {
            statusCode: 200,
            body: candidateHighScore
        };
    }




    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'hello world',
        }),
    };
};
