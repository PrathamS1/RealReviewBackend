require("dotenv").config();
import { S3Client, DeleteObjectCommand, GetObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

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

function getFileFromS3(filename) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `uploads/${filename}`,
  });
  return s3Client.send(command);
}

async function checkBucketExists() {
  const command = new HeadBucketCommand({
    Bucket: BUCKET_NAME,
  });
  await s3Client.send(command);
}

module.exports = { uploadBufferToS3, deleteFileFromS3, getFileFromS3, checkBucketExists };
