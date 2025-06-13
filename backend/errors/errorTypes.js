//! Database related errors
const DB_ERRORS = {
    INVALID_ID_FORMAT: {
        code: '22P02',
        message: 'Invalid ID format',
        status: 400
    },
    UNIQUE_VIOLATION: {
        code: '23505',
        message: 'Resource already exists',
        status: 409
    },
    FOREIGN_KEY_VIOLATION: {
        code: '23503',
        message: 'Invalid reference',
        status: 400
    }
};

//! Image related errors
const IMAGE_ERRORS = {
    NOT_FOUND: {
        message: 'Image not found',
        status: 404
    },
    UPLOAD_FAILED: {
        message: 'Failed to upload image',
        status: 500
    },
    DELETE_FAILED: {
        message: 'Failed to delete image',
        status: 500
    },
    FILE_DELETE_FAILED: {
        message: 'Failed to delete image file',
        status: 500
    },
    NO_FILE: {
        message: 'No image file uploaded',
        status: 400
    },
    DUPLICATE_FILENAME: {
        message: 'Image with this filename already exists',
        status: 409
    },
    FETCH_FAILED: {
        message: 'Failed to fetch images',
        status: 500
    },
    FILE_STREAM_FAILED: {
        message: 'Failed to stream image file',
        status: 500
    },
    FILE_STREAM_NOT_FOUND: {
        message: 'Image file not found',
        status: 404
    }
};

//! Rating related errors
const RATING_ERRORS = {
    NOT_FOUND: {
        message: 'Image not found',
        status: 404
    },
    INVALID_RATING: {
        message: 'Rating must be between 1 and 5',
        status: 400
    },
    ADD_FAILED: {
        message: 'Failed to add rating',
        status: 500
    },
    FETCH_FAILED: {
        message: 'Failed to fetch ratings',
        status: 500
    },
    DUPLICATE_RATING: {
        message: 'Rating already exists',
        status: 409
    }
};

//! Generic errors
const GENERIC_ERRORS = {
    SERVER_ERROR: {
        message: 'Internal server error',
        status: 500
    },
    VALIDATION_ERROR: {
        message: 'Validation failed',
        status: 400
    }
};

//! S3 Bucket related errors
const S3_ERRORS = {
    BUCKET_NOT_FOUND: {
        message: 'S3 bucket not found',
        status: 404
    },
    UPLOAD_FAILED: {
        message: 'Failed to upload image file',
        status: 500
    },
    DELETE_FAILED: {
        message: 'Failed to delete image file',
        status: 500
    },
    FILE_NOT_FOUND: {
        message: 'Image File not found',
        status: 404
    }
};

module.exports = {
    DB_ERRORS,
    IMAGE_ERRORS,
    RATING_ERRORS,
    GENERIC_ERRORS,
    S3_ERRORS
}; 