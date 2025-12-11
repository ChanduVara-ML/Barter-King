const { prisma } = require("../config/prisma");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Get all trades for the current user
const getMyTrades = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { status } = req.query;

  const where = {
    OR: [{ providerId: userId }, { seekerId: userId }],
  };

  if (status) {
    where.status = status;
  }

  const trades = await prisma.trade.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          profession: true,
          skills: true,
        },
      },
      seeker: {
        select: {
          id: true,
          name: true,
          profession: true,
          skills: true,
        },
      },
      request: {
        include: {
          post: {
            select: {
              id: true,
              category: true,
              offeringDescription: true,
              seekingDescription: true,
              location: true,
            },
          },
        },
      },
    },
  });

  res.status(200).json({
    status: 1,
    message: "Trades retrieved successfully",
    trades,
  });
});

// Get a single trade by ID
const getTradeById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const trade = await prisma.trade.findUnique({
    where: { id },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          profession: true,
          skills: true,
        },
      },
      seeker: {
        select: {
          id: true,
          name: true,
          email: true,
          profession: true,
          skills: true,
        },
      },
      request: {
        include: {
          post: true,
        },
      },
    },
  });

  if (!trade) {
    throw new AppError("Trade not found", 404);
  }

  // Check if user is part of this trade
  if (trade.providerId !== userId && trade.seekerId !== userId) {
    throw new AppError("You do not have access to this trade", 403);
  }

  res.status(200).json({
    status: 1,
    message: "Trade retrieved successfully",
    trade,
  });
});

// Mark task as completed by user
const markTaskComplete = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const trade = await prisma.trade.findUnique({
    where: { id },
    include: {
      provider: true,
      seeker: true,
    },
  });

  if (!trade) {
    throw new AppError("Trade not found", 404);
  }

  // Check if user is part of this trade
  if (trade.providerId !== userId && trade.seekerId !== userId) {
    throw new AppError("You do not have access to this trade", 403);
  }

  if (trade.status === "COMPLETED" || trade.status === "CANCELLED") {
    throw new AppError("This trade has already been finalized", 400);
  }

  // Determine which role the user has
  const isProvider = trade.providerId === userId;
  const isSeeker = trade.seekerId === userId;

  // Check if user already marked as complete
  if ((isProvider && trade.providerCompleted) || (isSeeker && trade.seekerCompleted)) {
    throw new AppError("You have already marked this task as complete", 400);
  }

  // Update completion status
  const updateData = {};
  if (isProvider) {
    updateData.providerCompleted = true;
  } else {
    updateData.seekerCompleted = true;
  }

  // Check if both will be completed after this update
  const bothCompleted =
    (isProvider ? true : trade.providerCompleted) &&
    (isSeeker ? true : trade.seekerCompleted);

  if (bothCompleted) {
    updateData.status = "COMPLETED";
    updateData.completedAt = new Date();
  } else if (isProvider) {
    updateData.status = "PROVIDER_COMPLETED";
  } else {
    updateData.status = "SEEKER_COMPLETED";
  }

  // Update trade and user coins in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const updatedTrade = await tx.trade.update({
      where: { id },
      data: updateData,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            coins: true,
          },
        },
        seeker: {
          select: {
            id: true,
            name: true,
            coins: true,
          },
        },
      },
    });

    // If both completed, update coins
    if (bothCompleted) {
      // Provider gives providerValue coins and receives seekerValue coins
      await tx.user.update({
        where: { id: trade.providerId },
        data: {
          coins: {
            increment: trade.seekerValue - trade.providerValue,
          },
        },
      });

      // Seeker gives seekerValue coins and receives providerValue coins
      await tx.user.update({
        where: { id: trade.seekerId },
        data: {
          coins: {
            increment: trade.providerValue - trade.seekerValue,
          },
        },
      });
    }

    return updatedTrade;
  });

  res.status(200).json({
    status: 1,
    message: bothCompleted
      ? "Trade completed! Coins have been exchanged."
      : "Task marked as complete. Waiting for the other party.",
    trade: result,
  });
});

// Cancel a trade (both parties can cancel)
const cancelTrade = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const trade = await prisma.trade.findUnique({
    where: { id },
    include: {
      request: {
        include: {
          post: true,
        },
      },
    },
  });

  if (!trade) {
    throw new AppError("Trade not found", 404);
  }

  // Check if user is part of this trade
  if (trade.providerId !== userId && trade.seekerId !== userId) {
    throw new AppError("You do not have access to this trade", 403);
  }

  if (trade.status === "COMPLETED") {
    throw new AppError("Cannot cancel a completed trade", 400);
  }

  if (trade.status === "CANCELLED") {
    throw new AppError("This trade has already been cancelled", 400);
  }

  // Update trade status and reactivate post
  const result = await prisma.$transaction(async (tx) => {
    const updatedTrade = await tx.trade.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // Reactivate the post
    await tx.post.update({
      where: { id: trade.request.postId },
      data: { isActive: true },
    });

    return updatedTrade;
  });

  res.status(200).json({
    status: 1,
    message: "Trade cancelled successfully. The post has been reactivated.",
    trade: result,
  });
});

module.exports = {
  getMyTrades,
  getTradeById,
  markTaskComplete,
  cancelTrade,
};

