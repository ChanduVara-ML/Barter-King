const { prisma } = require("../config/prisma");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Create a request (bargain) for a post
const createRequest = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { postId, offeredValue, requestedValue, message } = req.body;

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { user: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (!post.isActive) {
    throw new AppError("This post is no longer active", 400);
  }

  // Can't create request for own post
  if (post.userId === userId) {
    throw new AppError("You cannot create a request for your own post", 400);
  }

  // Check if requester has enough coins for the offered value
  const requester = await prisma.user.findUnique({
    where: { id: userId },
    select: { coins: true },
  });

  if (!requester) {
    throw new AppError("User not found", 404);
  }

  if (offeredValue > requester.coins + requestedValue) {
    throw new AppError(
      `You are offering ${requestedValue} coins. Requester need ${
        offeredValue - requester.coins
      } coins.`,
      400
    );
  }

  // Check if user already has a pending request for this post
  const existingRequest = await prisma.request.findFirst({
    where: {
      postId,
      requesterId: userId,
      status: "PENDING",
    },
  });

  if (existingRequest) {
    throw new AppError("You already have a pending request for this post", 400);
  }

  const request = await prisma.request.create({
    data: {
      postId,
      requesterId: userId,
      postOwnerId: post.userId,
      offeredValue,
      requestedValue,
      message,
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          profession: true,
          skills: true,
        },
      },
      post: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  res.status(201).json({
    status: 1,
    message: "Request created successfully",
    request,
  });
});

// Get requests for user's posts (received requests)
const getReceivedRequests = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { status } = req.query;

  const where = {
    postOwnerId: userId,
  };

  if (status) {
    where.status = status;
  }

  const requests = await prisma.request.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          profession: true,
          skills: true,
          coins: true,
        },
      },
      post: {
        select: {
          id: true,
          category: true,
          offeringDescription: true,
          seekingDescription: true,
          location: true,
          tradeValue: true,
        },
      },
    },
  });

  res.status(200).json({
    status: 1,
    message: "Received requests retrieved successfully",
    requests,
  });
});

// Get user's sent requests
const getSentRequests = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { status } = req.query;

  const where = {
    requesterId: userId,
  };

  if (status) {
    where.status = status;
  }

  const requests = await prisma.request.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profession: true,
              skills: true,
            },
          },
        },
      },
      trade: true,
    },
  });

  res.status(200).json({
    status: 1,
    message: "Sent requests retrieved successfully",
    requests,
  });
});

// Accept a request (creates a trade)
const acceptRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Find the request
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      post: true,
      requester: true,
    },
  });

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  // Check if user is the post owner
  if (request.post.userId !== userId) {
    throw new AppError("You can only accept requests for your own posts", 403);
  }

  if (request.status !== "PENDING") {
    throw new AppError("This request has already been processed", 400);
  }

  // Update request status and create trade in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update request
    const updatedRequest = await tx.request.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });

    // Create trade
    const trade = await tx.trade.create({
      data: {
        requestId: id,
        providerId: request.post.userId, // Post owner provides what they offered
        seekerId: request.requesterId, // Requester seeks what they requested
        providerValue: request.requestedValue, // What provider will give
        seekerValue: request.offeredValue, // What seeker will give
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
      },
    });

    // Deactivate the post since a deal was made
    await tx.post.update({
      where: { id: request.postId },
      data: { isActive: false },
    });

    return { updatedRequest, trade };
  });

  res.status(200).json({
    status: 1,
    message: "Request accepted and trade created successfully",
    request: result.updatedRequest,
    trade: result.trade,
  });
});

// Reject a request
const rejectRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Find the request
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      post: true,
    },
  });

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  // Check if user is the post owner
  if (request.post.userId !== userId) {
    throw new AppError("You can only reject requests for your own posts", 403);
  }

  if (request.status !== "PENDING") {
    throw new AppError("This request has already been processed", 400);
  }

  // Update request status
  const updatedRequest = await prisma.request.update({
    where: { id },
    data: { status: "REJECTED" },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
        },
      },
      post: {
        select: {
          id: true,
          offeringDescription: true,
        },
      },
    },
  });

  res.status(200).json({
    status: 1,
    message: "Request rejected successfully",
    request: updatedRequest,
  });
});

// Update request (for bargaining)
const updateRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { offeredValue, requestedValue, message } = req.body;

  // Find the request
  const request = await prisma.request.findUnique({
    where: { id },
  });

  if (!request) {
    throw new AppError("Request not found", 404);
  }

  // Check if user is the requester
  if (request.requesterId !== userId) {
    throw new AppError("You can only update your own requests", 403);
  }

  if (request.status !== "PENDING") {
    throw new AppError("You can only update pending requests", 400);
  }

  // Update request
  const updatedRequest = await prisma.request.update({
    where: { id },
    data: {
      offeredValue,
      requestedValue,
      message,
    },
    include: {
      post: {
        select: {
          id: true,
          offeringDescription: true,
          seekingDescription: true,
        },
      },
    },
  });

  res.status(200).json({
    status: 1,
    message: "Request updated successfully",
    request: updatedRequest,
  });
});

module.exports = {
  createRequest,
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  updateRequest,
};
