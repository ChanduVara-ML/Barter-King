const express = require("express");
const {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { validatePost } = require("../validators/postValidator");

const router = express.Router();

// Public routes
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// Protected routes
router.use(authenticateToken);
router.post("/", validatePost, createPost);
router.get("/my/posts", getMyPosts);
router.put("/:id", validatePost, updatePost);
router.delete("/:id", deletePost);

module.exports = router;

