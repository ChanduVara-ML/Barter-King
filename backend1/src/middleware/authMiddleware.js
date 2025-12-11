const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Middleware to verify JWT token
const authenticateToken = catchAsync(async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    throw new AppError(
      "Access token required. Please provide a token in the Authorization header",
      401
    );
  }

  // Verify token
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-this-in-production"
  );

  // Attach user info to request object
  req.user = decoded;
  next();
});

module.exports = {
  authenticateToken,
};
