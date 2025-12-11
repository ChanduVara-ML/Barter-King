const { body } = require("express-validator");
const {
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

// Request validation rules
const validateRequest = [
  body("postId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Post ID is required"),

  body("offeredValue")
    .notEmpty()
    .withMessage("Offered value is required")
    .isInt({ min: 1, max: 10000 })
    .withMessage("Offered value must be a positive integer between 1 and 10000"),

  body("requestedValue")
    .notEmpty()
    .withMessage("Requested value is required")
    .isInt({ min: 1, max: 10000 })
    .withMessage(
      "Requested value must be a positive integer between 1 and 10000"
    ),

  body("message")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Message must not exceed 1000 characters"),

  handleValidationErrors,
];

module.exports = {
  validateRequest,
};

