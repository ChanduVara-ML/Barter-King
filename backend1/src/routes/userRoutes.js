const express = require("express");
const {
  signup,
  login,
  getMe,
  updateProfile,
  getDashboard,
} = require("../controllers/userController");
const {
  validateSignup,
  validateLogin,
  validateProfileUpdate,
} = require("../validators/userValidator");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);

// Protected routes
router.use(authenticateToken);
router.get("/me", getMe);
router.put("/profile", validateProfileUpdate, updateProfile);
router.get("/dashboard", getDashboard);

module.exports = router;
