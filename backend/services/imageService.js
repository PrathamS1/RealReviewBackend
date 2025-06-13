const {
  getAllImageData,
  insertImageData,
  getImagesById,
  deleteImageData,
} = require("../repository/imageRepo");
const Image = require("../models/imageModel");
const {
  AppError,
  IMAGE_ERRORS,
  handleDatabaseError,
  handleImageError,
} = require("../errors/errorHandler");
const {
  uploadBufferToS3,
  deleteFileFromS3,
  getFileFromS3,
  checkBucketExists,
} = require("./s3Uploader");
const { S3_ERRORS } = require("../errors/errorTypes");

//^ This function calls the repository function to get image data from the database
const getImages = async () => {
  try {
    const images = await getAllImageData();
    return images.map((image) => {
      const imageObj = new Image({
        filename: image.filename,
        location: image.location,
        submitted_by: image.submitted_by,
        rating: image.rating
      });
      imageObj.id = image.id;
      imageObj.timestamp = image.timestamp;
      return imageObj;
    });
  } catch (error) {
    console.error("Error fetching images from image repo:", error);
    if (error instanceof AppError) {
      throw error;
    }
    // database errors
    if (error.code) {
      throw handleDatabaseError(error);
    }
    // other errors
    throw handleImageError(error);
  }
};

//^ This function calls the repository function to get image data by ID from the database
const getImageById = async (id) => {
  try {
    const image = await getImagesById(id);
    if (!image) {
      throw new AppError(IMAGE_ERRORS.NOT_FOUND);
    }

    const imageObj = new Image({
      filename: image.filename,
      location: image.location,
      submitted_by: image.submitted_by,
      rating: image.rating
    });
    imageObj.id = image.id;
    imageObj.timestamp = image.timestamp;
    return imageObj;
  } catch (error) {
    console.error("Error fetching image data by ID from image repo:", error);
    if (error instanceof AppError) {
      throw error;
    }
    // database errors
    if (error.code) {
      throw handleDatabaseError(error);
    }
    // other errors
    throw handleImageError(error);
  }
};

//^ This function calls the repository function to insert image data into the database
const insertImage = async (req) => {
  const { location, rating, submitted_by } = req.body;
  const file = req.file;
  if (!file) {
    throw new AppError(IMAGE_ERRORS.NO_FILE);
  }

  // Convert rating to number and validate
  const ratingValue = rating ? Number(rating) : null;
  if (ratingValue !== null && (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5)) {
    throw new AppError({
      message: 'Rating must be a number between 1 and 5',
      status: 400
    });
  }

  try {
    await checkBucketExists();
  } catch (error) {
    console.error("S3 bucket does not exist or is inaccessible:", error);
    throw new AppError(S3_ERRORS.BUCKET_NOT_FOUND);
  }
  const uniqueName = Date.now() + "-" + file.originalname;
  const imageInstance = new Image({
    filename: uniqueName,
    location: location,
    submitted_by: submitted_by,
    rating: ratingValue,
    timestamp: new Date()
  });

  try {
    try {
      await uploadBufferToS3(file.buffer, uniqueName, file.mimetype);
    } catch (err) {
      console.error("Upload failed:", err);
      throw new AppError(S3_ERRORS.UPLOAD_FAILED);
    }

    const image = await insertImageData(imageInstance);

    const imageObj = new Image({
      filename: image.filename,
      location: image.location,
      submitted_by: image.submitted_by,
      rating: image.rating
    });
    imageObj.id = image.id;
    imageObj.timestamp = image.timestamp;
    return imageObj;
  } catch (error) {
    console.error("Error inserting image in image repo:", error);
    try {
      await deleteFileFromS3(uniqueName);
    } catch (s3err) {
      console.error("Failed to clean up image from S3:", s3err);
      throw new AppError(S3_ERRORS.DELETE_FAILED);
    }

    if (error instanceof AppError) {
      throw error;
    }
    // database errors
    if (error.code) {
      throw handleDatabaseError(error);
    }
    // other errors
    throw handleImageError(error);
  }
};

//^ This function calls the repository function to delete image data by ID from the database
const deleteImage = async (id) => {
  try {
    const image = await getImagesById(id);
    if (!image) {
      throw new AppError(IMAGE_ERRORS.NOT_FOUND);
    }

    // First delete from S3
    try {
      await deleteFileFromS3(image.filename);
    } catch (s3err) {
      console.error("Failed to delete image from S3:", s3err);
      throw new AppError(S3_ERRORS.DELETE_FAILED);
    }

    // Then delete from database
    const deletedImage = await deleteImageData(id);
    if (!deletedImage) {
      throw new AppError(IMAGE_ERRORS.DELETE_FAILED);
    }

    return deletedImage;
  } catch (error) {
    console.error("Error deleting image:", error);
    if (error instanceof AppError) {
      throw error;
    }
    // database errors
    if (error.code) {
      throw handleDatabaseError(error);
    }
    // other errors
    throw handleImageError(error);
  }
};

const streamImageFromS3 = async (key) => {
  try {
    const { stream, contentType } = await getFileFromS3(key);
    return { stream, contentType };
  } catch (error) {
    console.error("Error streaming image from S3:", error);
    if (error.message === 'FILE_NOT_FOUND') {
      throw new AppError(IMAGE_ERRORS.FILE_STREAM_NOT_FOUND);
    }
    throw new AppError(IMAGE_ERRORS.FILE_STREAM_FAILED);
  }
};

module.exports = {
  getImages,
  insertImage,
  deleteImage,
  getImageById,
  streamImageFromS3,
};
