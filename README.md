# RealReview Backend - Setup & Deployment (Branch: `backend-setup`)

A robust backend service for **RealReview**, a real estate platform that allows users to upload and manage property images with metadata. The service is built with Node.js, Express, and uses AWS services for storage and database management.

## 🚀 Features

- **Image Management**
  - Upload images with metadata (location, submitted_by, timestamp, rating)
  - View all uploaded images with their metadata
  - Delete images (removes both S3 file and database records)
  - Stream images directly from S3

- **Rating System**
  - Submit ratings for images (1-5 scale)
  - View rating summaries for each image
  - Calculate and store average ratings

- **AWS Integration**
  - S3 for image storage
  - S3 Lifecycle event for auto deletion after 5 days
  - DynamoDB for data persistence
  - Lambda functions for automated cleanup
  - EventBridge for event handling

- **Automated Cleanup**
  - S3 lifecycle rules for automatic image deletion
  - Lambda functions to handle database updates (i.e. marking records as archived)
  - Failed event handling and retry mechanism

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3
- **Serverless**: AWS Lambda
- **Event Handling**: Amazon EventBridge
- **Error Handling**: Custom error middleware
- **File Upload**: Multer middleware

## 🔧 Available API Endpoints

Postman Collection is included in the `Resoure` folder for testing the APIs.
Following are the API endpoints with their purpose

| Method | Route | Description |
|--------|-------|-------------|
| POST | `{{base_url}}/api/images/` | Upload a new image |
| GET | `{{base_url}}/api/images/` | Retrieve all images |
| GET | `{{base_url}}/api/images/:id` | Retrieve a specific image |
| DELETE | `{{base_url}}/api/images/:id` | Delete an image |
| POST | `{{base_url}}/api/images/:id/rate` | Submit a rating |
| GET | `{{base_url}}/api/images/:id/ratings` | Get image rating summary |
| GET | `{{base_url}}/api/images/image/:filename` | View the uploaded image |

> Note: Replace `:id` with the actual image ID received from POST or GET responses.
> Replace `:filename` with the actual filename of the image from the GET responses.

## 📦 Project Structure

```
backend/
├── controllers/         # Request handlers
├── models/             # DynamoDB models
├── database/             # DynamoDB initialization
├── repository/         # Database operations
├── services/          # Business logic
├── middleware/        # Custom middleware
├── errors/            # Error handling
├── resources/            # Postman API Endpoint Collection and Environment
└── routes/            # API routes
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=SERVER_PORT
AWS_REGION=YOUR_AWS_REGION
S3_BUCKET_NAME=YOUR_S3_BUCKET_NAME
```

## 📚 API Documentation

A Postman collection is available in the `resources` folder for testing the API endpoints.

## 🔄 Automated Cleanup Process

1. **S3 Lifecycle**
   - Images are automatically deleted after 5 days
   - Triggers EventBridge event

2. **Database Update**
   - Lambda function updates DynamoDB records
   - Marks images as archived

3. **Failed Event Handling**
   - Hourly check for failed events
   - Updates database with error information
