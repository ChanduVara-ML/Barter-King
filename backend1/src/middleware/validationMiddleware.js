const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new AppError(errorMessages.join(", "), 400);
  }
  next();
};

module.exports = {
  handleValidationErrors,
};
