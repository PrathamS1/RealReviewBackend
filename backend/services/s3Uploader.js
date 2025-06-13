const { S3Client, DeleteObjectCommand, GetObjectCommand, HeadBucketCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { Readable } = require('stream');
require("dotenv").config();

const s3Client = new S3Client({ region: process.env.AWS_REGION });

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function uploadBufferToS3(buffer, filename, mimeType = "image/jpeg") {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: `uploads/${filename}`,
      Body: buffer,
      ContentType: mimeType,
    },
  });
  await upload.done();
}

async function deleteFileFromS3(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `uploads/${key}`,
  });
  return s3Client.send(command);
}

async function getFileFromS3(filename) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `uploads/${filename}`,
    });
    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('No body in response');
    }

    // Convert the response body to a readable stream
    const stream = response.Body instanceof Readable 
      ? response.Body 
      : Readable.from(response.Body);

    return {
      stream,
      contentType: response.ContentType || 'image/jpeg'
    };
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      throw new Error('FILE_NOT_FOUND');
    }
    throw error;
  }
}

async function checkBucketExists() {
  const command = new HeadBucketCommand({
    Bucket: BUCKET_NAME,
  });
  await s3Client.send(command);
}

module.exports = { uploadBufferToS3, deleteFileFromS3, getFileFromS3, checkBucketExists };
