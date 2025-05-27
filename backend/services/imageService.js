const fs = require("fs");
const path = require("path");
const {
  getAllImageData,
  insertImageData,
  getImagesById,
  deleteImageData,
} = require("../repository/imageRepo");
const Image = require("../models/imageModel");
const { AppError, IMAGE_ERRORS, handleDatabaseError, handleImageError } = require("../errors/errorHandler");
const { uploadBufferToS3, deleteFileFromS3, getFileFromS3 } = require("../middleware/s3Uploader");

//^ This function calls the repository function to get image data from the database
const getImages = async () => {
  try {
    const images = await getAllImageData();
    return images.map(image => {
      const imageObj = new Image(
        image.filename,
        image.location,
        image.submitted_by,
        image.rating
      );
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
    
    const imageObj = new Image(
      image.filename,
      image.location,
      image.submitted_by,
      image.rating
    );
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

  const uniqueName = Date.now() + "-" + file.originalname;
  const imageInstance = new Image(
    uniqueName,
    location,
    submitted_by,
    rating
  );

  try {
    const uploadSuccess = await uploadBufferToS3(file.buffer, uniqueName, file.mimetype);
    if (!uploadSuccess) {
      throw new AppError(IMAGE_ERRORS.UPLOAD_FAILED);
    }
    
    imageInstance.filename = uniqueName;
    const image = await insertImageData(imageInstance);

    const imageObj = new Image(
      image.filename,
      image.location,
      image.submitted_by,
      image.rating
    );
    imageObj.id = image.id;
    imageObj.timestamp = image.timestamp;
    return imageObj;
  } catch (error) {
    console.error("Error inserting image in image repo:", error);
    try {
      await deleteFileFromS3(uniqueName);
    } catch (s3err) {
      console.error("Failed to clean up image from S3:", s3err);
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

    const imageObj = new Image(
      image.filename,
      image.location,
      image.submitted_by,
      image.rating
    );
    imageObj.id = image.id;
    imageObj.timestamp = image.timestamp;

    try {
      await deleteFileFromS3(image.filename);
    } catch (s3err) {
      console.error("Failed to clean up image from S3:", s3err);
    }

    await deleteImageData(id);
    return imageObj;
  } catch (error) {
    console.error("Error deleting image in image repo:", error);
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
    const streamImage = getFileFromS3(key);
    return streamImage;
  } catch (error) {
    console.error("Error streaming image from S3:", error);
    if (error.code === 'NoSuchKey') {
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
