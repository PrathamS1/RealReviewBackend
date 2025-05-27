const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const s3 = new AWS.S3();

const BUCKET_NAME = 'image-uploads-data';

async function uploadBufferToS3(buffer, filename, mimeType = 'image/jpeg') {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `uploads/${filename}`,
    Body: buffer,
    ContentType: mimeType,
  };

  try {
    await s3.upload(params).promise();
    return true; // Return true on successful upload
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return false; // Return false on upload failure
  }
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

module.exports = { uploadBufferToS3, deleteFileFromS3, getFileFromS3 };