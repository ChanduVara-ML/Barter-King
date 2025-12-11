const express = require("express");
const {
  createRequest,
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  updateRequest,
} = require("../controllers/requestController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { validateRequest } = require("../validators/requestValidator");

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.post("/", validateRequest, createRequest);
router.get("/received", getReceivedRequests);
router.get("/sent", getSentRequests);
router.post("/:id/accept", acceptRequest);
router.post("/:id/reject", rejectRequest);
router.put("/:id", validateRequest, updateRequest);

module.exports = router;

