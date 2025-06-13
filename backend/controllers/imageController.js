const {
  getImages,
  insertImage,
  deleteImage,
  getImageById,
  streamImageFromS3,
} = require("../services/imageService");
const { AppError, IMAGE_ERRORS, handleDatabaseError, handleImageError } = require("../errors/errorHandler");

//^ Controller to handle fetching all image data
const getAllImageData = async (req, res) => {
  try {
    const images = await getImages();
    res.status(200).json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    if (error instanceof AppError) {
      return res.status(error.status).json({ error: error.message });
    }
    // database errors
    if (error.code) {
      const dbError = handleDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
    // other errors
    const imageError = handleImageError(error);
    return res.status(imageError.status).json({ error: imageError.message });
  }
};

//^ Controller to handle uploading an image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      throw new AppError(IMAGE_ERRORS.NO_FILE);
    }
    const image = await insertImage(req);
    res.status(201).json({
      message: "Image uploaded successfully",
      image,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    if (error instanceof AppError) {
      return res.status(error.status).json({ error: error.message });
    }
    // database errors
    if (error.code) {
      const dbError = handleDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
    // other errors
    const imageError = handleImageError(error);
    return res.status(imageError.status).json({ error: imageError.message });
  }
};

//^ Controller to handle fetching image data by ID
const getImagesById = async (req, res) => {
    const { id } = req.params;
    try {
        const image = await getImageById(id);
        if (!image) {
            throw new AppError(IMAGE_ERRORS.NOT_FOUND);
        }
        res.status(200).json(image);
    } catch (error) {
        console.error("Error fetching image by ID:", error);
        if (error instanceof AppError) {
            return res.status(error.status).json({ error: error.message });
        }
        // database errors
        if (error.code) {
            const dbError = handleDatabaseError(error);
            return res.status(dbError.status).json({ error: dbError.message });
        }
        // other errors
        const imageError = handleImageError(error);
        return res.status(imageError.status).json({ error: imageError.message });
    }
};

//^ Controller to handle deleting an image by ID
const deleteImageById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedImage = await deleteImage(id);
    if (!deletedImage) {
      throw new AppError(IMAGE_ERRORS.NOT_FOUND);
    }
    res.status(200).json({
      message: "Image deleted successfully",
      deletedImage, 
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    if (error instanceof AppError) {
      return res.status(error.status).json({ error: error.message });
    }
    // database errors
    if (error.code) {
      const dbError = handleDatabaseError(error);
      return res.status(dbError.status).json({ error: dbError.message });
    }
    // other errors
    const imageError = handleImageError(error);
    return res.status(imageError.status).json({ error: imageError.message });
  }
};

const streamImage = async (req, res) => {
  try {
    const { key } = req.params;
    const { stream, contentType } = await streamImageFromS3(key);
    res.setHeader("Content-Type", contentType);
    stream.pipe(res);
  } catch (error) {
    console.error("Error streaming image:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
    getAllImageData,
    uploadImage,
    deleteImageById,
    getImagesById,
    streamImage
};
