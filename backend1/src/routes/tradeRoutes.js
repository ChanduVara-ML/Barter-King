const express = require("express");
const {
  getMyTrades,
  getTradeById,
  markTaskComplete,
  cancelTrade,
} = require("../controllers/tradeController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get("/", getMyTrades);
router.get("/:id", getTradeById);
router.post("/:id/complete", markTaskComplete);
router.post("/:id/cancel", cancelTrade);

module.exports = router;

