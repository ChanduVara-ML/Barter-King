const { body } = require("express-validator");
const {
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

// Post validation rules
const validatePost = [
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["SKILLS", "SERVICES", "WORK", "ITEMS"])
    .withMessage("Category must be one of: SKILLS, SERVICES, WORK, ITEMS"),

  body("offeringDescription")
    .trim()
    .notEmpty()
    .withMessage("Offering description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Offering description must be between 10 and 2000 characters"),

  body("seekingDescription")
    .trim()
    .notEmpty()
    .withMessage("Seeking description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Seeking description must be between 10 and 2000 characters"),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Location must be between 2 and 200 characters"),

  body("tradeValue")
    .notEmpty()
    .withMessage("Trade value is required")
    .isInt({ min: 1, max: 10000 })
    .withMessage("Trade value must be a positive integer between 1 and 10000"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  handleValidationErrors,
];

module.exports = {
  validatePost,
};

