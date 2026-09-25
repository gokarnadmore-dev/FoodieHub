// middleware/errorMiddleware.js

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Handle invalid MongoDB ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err.path}`;
    err = {
      statusCode: 400,
      message
    };
  }

  // Handle duplicate MongoDB fields
  if (err.code === 11000) {
    const message = `Duplicate field value entered: ${Object.keys(
      err.keyValue
    )}`;
    err = {
      statusCode: 400,
      message
    };
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    err = {
      statusCode: 401,
      message: "Invalid token. Please login again"
    };
  }

  if (err.name === "TokenExpiredError") {
    err = {
      statusCode: 401,
      message: "Token expired. Please login again"
    };
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
};

module.exports = errorMiddleware;