const express = require("express");
const { query } = require("express-validator");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  handleValidationErrors,
} = require("../middleware/validationMiddleware");
const {
  getConversations,
  getConversationFromPost,
  getMessagesByConversation,
  searchUsers,
  getConversationFromUser,
} = require("../controllers/chatController");

const router = express.Router();

// All chat routes are protected
router.use(authenticateToken);

router.get("/conversations", getConversations);

router.get(
  "/conversation-from-post",
  query("postId").isString().withMessage("postId is required"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("limit must be between 1 and 200"),
  handleValidationErrors,
  getConversationFromPost
);

router.get(
  "/messages",
  query("conversationId").isString().withMessage("conversationId is required"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("limit must be between 1 and 200"),
  handleValidationErrors,
  getMessagesByConversation
);

router.get(
  "/search-users",
  query("query").optional().isString().withMessage("query must be a string"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be between 1 and 50"),
  handleValidationErrors,
  searchUsers
);

router.get(
  "/conversation-from-user",
  query("userId").isString().withMessage("userId is required"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("limit must be between 1 and 200"),
  handleValidationErrors,
  getConversationFromUser
);

module.exports = router;
