require("dotenv").config();
const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.AWS_REGION });

const s3 = new AWS.S3();

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function uploadBufferToS3(buffer, filename, mimeType = "image/jpeg") {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `uploads/${filename}`,
    Body: buffer,
    ContentType: mimeType,
  };
  await s3.upload(params).promise();
}

async function deleteFileFromS3(key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `uploads/${key}`,
  };
  return s3.deleteObject(params).promise();
}
function getFileFromS3(filename) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `uploads/${filename}`,
  };

  return s3.getObject(params).createReadStream();
}

async function checkBucketExists() {
    await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
}

module.exports = { uploadBufferToS3, deleteFileFromS3, getFileFromS3, checkBucketExists };
