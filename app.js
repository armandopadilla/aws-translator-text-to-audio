const AWS = require('aws-sdk');
const _ = require('lodash');

const AWS_ACCESS_KEY = '';
const AWS_SECRET_KEY = '';
const AWS_REGION = 'us-west-2';

const connParams = {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
    region: AWS_REGION
}



const AWSPolly = new AWS.Polly(connParams);

AWSPolly
    .startSpeechSynthesisTask({
        OutputFormat: 'mp3',
        OutputS3BucketName: 'armando-aws-translator-text-to-audio-results',
        Text: 'Hola',
        LanguageCode: 'es-MX',
        VoiceId: 'Penelope'
    })
    .promise()
    .then((results) => {
        console.log(results)
    })
    .catch((error) => console.error(error))




