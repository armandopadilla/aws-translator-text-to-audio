const AWS = require('aws-sdk');
const _ = require('lodash');

const AWS_ACCESS_KEY = '';
const AWS_SECRET_KEY = '';
const AWS_REGION = '';

const connParams = {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
    region: AWS_REGION
}

const AWSPolly = new AWS.Polly(connParams);

exports.handler = async (event) => {

    if (!event) return {
        statusCode: 400,
        body: JSON.stringify('Error. No payload.')
    }

    const record = _.get(event, 'Records[0]');
    if (!record)  return {
        statusCode: 400,
        body: JSON.stringify('Error. Not Record provided.')
    }

    const { bucket, object } = _.get(record, 's3');
    const inputBucketName = bucket.name;
    const fileName = object.key;

    console.log("bucketName", inputBucketName);
    console.log("fileName", fileName);

    // Pull data from S3 translation_results bucket and create the audio file.
    const S3 = new AWS.S3(connParams);

    return S3.getObject({
            Bucket: inputBucketName,
            Key: fileName
        })
        .promise()
        .then((results) => {
            const data = _.get(results, 'Body');
            const dataAsString = new Buffer(data).toString();
            const dataAsJSON = JSON.parse(dataAsString);

            return _.get(dataAsJSON, 'text');
        })
        .then((textToVoice) => {
            console.log("Text to apply voice to", textToVoice);

            const outputBucketName = 'armando-aws-translator-translated-text-to-audio-results';
            const languageCode = 'es-MX';
            const voiceId = 'Penelope';

            return AWSPolly
                .startSpeechSynthesisTask({
                    OutputFormat: 'mp3',
                    OutputS3BucketName: outputBucketName,
                    Text: textToVoice,
                    LanguageCode: languageCode,
                    VoiceId: voiceId,
                })
                .promise()
        })
        .then((results) => {
            console.log("Scheduled Task Status", results);

            return {
               statusCode: 200,
               body: JSON.stringify(`Voice being applied to translation - ${fileName}...`)
            }
        })
        .catch((error) => {
            console.error(error);

            return {
              statusCode: 400,
              body: JSON.stringify(`Error - ${error.message}`)
            }
        })
};


