import AppError from "../utils/errorHandler.js";

const handleDuplicateFieldsDB = err => {
  const value = err.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(400, message);
};

const handleMulterError = err => {
  if (err.code === "MISSING_FIELD_NAME") {
    return new AppError(400, "Please send files with field name 'images'");
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE" || err.message === "Unexpected field") {
    return new AppError(
      400,
      "Unexpected field name. Please use 'images' as the field name for file uploads"
    );
  }
  return new AppError(400, err.message || "File upload error");
};

// Send error in development
const sendErrorDev = (err, res) => {
  console.log(err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// Send error in production
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or unknown errors
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

// Main error handler
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Different error responses for development and production
  if (process.env.NODE_ENV === "development") {
    let error = { ...err, message: err.message };

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "MulterError") error = handleMulterError(error);

    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "MulterError") error = handleMulterError(error);
    sendErrorProd(error, res);
  }
};

export default errorHandler;
