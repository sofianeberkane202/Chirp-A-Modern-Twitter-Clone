import AppError from "./AppError.js";
const validationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(" ")}`;
  return new AppError(message, 400);
};

const errorE11000 = (err) => {
  const field = Object.keys(err.keyValue)[0]; // Get the field causing the error
  const value = err.keyValue[field]; // Get the duplicate value

  const message = `Duplicate field value: "${value}" for field "${field}". Please use a different value.`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || "error",
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

export default (err, req, res, next) => {
  let error = { ...err, message: err.message };

  if (err.name === "ValidationError") error = validationError(error);

  if (err.code === 11000) error = errorE11000(error);

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(error, res);
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
