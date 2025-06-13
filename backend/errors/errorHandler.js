const { DB_ERRORS, IMAGE_ERRORS, RATING_ERRORS, GENERIC_ERRORS } = require('./errorTypes');

class AppError extends Error {
    constructor(errorType, details = null) {
        super(errorType.message);
        this.status = errorType.status;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

//& Error handling for database operations
const handleDatabaseError = (error) => {
    // Check for known database error codes
    if (error.code === DB_ERRORS.INVALID_ID_FORMAT.code) {
        return new AppError(DB_ERRORS.INVALID_ID_FORMAT);
    }
    if (error.code === DB_ERRORS.UNIQUE_VIOLATION.code) {
        return new AppError(DB_ERRORS.UNIQUE_VIOLATION);
    }
    if (error.code === DB_ERRORS.FOREIGN_KEY_VIOLATION.code) {
        return new AppError(DB_ERRORS.FOREIGN_KEY_VIOLATION);
    }
    // If no specific error is found, return generic server error
    return new AppError(GENERIC_ERRORS.SERVER_ERROR);
};

//& Error handling for image operations
const handleImageError = (error) => {
    if (error instanceof AppError) {
        return error;
    }
    // Handle specific image errors
    if (error.message === IMAGE_ERRORS.NOT_FOUND.message) {
        return new AppError(IMAGE_ERRORS.NOT_FOUND);
    }
    if (error.message === IMAGE_ERRORS.NO_FILE.message) {
        return new AppError(IMAGE_ERRORS.NO_FILE);
    }
    // Handle file system errors
    if (error.code === 'ENOENT') {
        return new AppError(IMAGE_ERRORS.NOT_FOUND);
    }
    // If no specific error is found, return generic server error
    return new AppError(GENERIC_ERRORS.SERVER_ERROR);
};

//& Error handling for rating operations
const handleRatingError = (error) => {
    if (error instanceof AppError) {
        return error;
    }
    // Handle specific rating errors
    if (error.message === RATING_ERRORS.INVALID_RATING.message) {
        return new AppError(RATING_ERRORS.INVALID_RATING);
    }
    if (error.message === RATING_ERRORS.NOT_FOUND.message) {
        return new AppError(RATING_ERRORS.NOT_FOUND);
    }
    // If no specific error is found, return generic server error
    return new AppError(GENERIC_ERRORS.SERVER_ERROR);
};

module.exports = {
    AppError,
    handleDatabaseError,
    handleImageError,
    handleRatingError,
    IMAGE_ERRORS,
    RATING_ERRORS,
    GENERIC_ERRORS
}; 