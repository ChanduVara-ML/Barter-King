const { prisma } = require("../config/prisma");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Create a new post
const createPost = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const {
    category,
    offeringDescription,
    seekingDescription,
    location,
    tradeValue,
  } = req.body;

  const post = await prisma.post.create({
    data: {
      userId,
      category,
      offeringDescription,
      seekingDescription,
      location,
      tradeValue,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profession: true,
          skills: true,
        },
      },
    },
  });

  res.status(201).json({
    status: 1,
    message: "Post created successfully",
    post,
  });
});

// Get all active posts (for browse/marketplace)
const getAllPosts = catchAsync(async (req, res, next) => {
  const {
    category,
    location,
    minPrice,
    maxPrice,
    skip = 0,
    take = 20,
  } = req.query;

  const where = {
    isActive: true,
  };

  if (category) {
    where.category = category;
  }

  if (location) {
    where.location = {
      contains: location,
      mode: "insensitive",
    };
  }

  if (minPrice || maxPrice) {
    where.tradeValue = {};
    if (minPrice) {
      where.tradeValue.gte = parseInt(minPrice);
    }
    if (maxPrice) {
      where.tradeValue.lte = parseInt(maxPrice);
    }
  }

  const posts = await prisma.post.findMany({
    where,
    skip: parseInt(skip),
    take: parseInt(take),
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profession: true,
          skills: true,
        },
      },
      _count: {
        select: {
          requests: true,
        },
      },
    },
  });

  const total = await prisma.post.count({ where });

  res.status(200).json({
    status: 1,
    message: "Posts retrieved successfully",
    posts,
    pagination: {
      total,
      skip: parseInt(skip),
      take: parseInt(take),
    },
  });
});

// Get a single post by ID
const getPostById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profession: true,
          skills: true,
        },
      },
      requests: {
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              profession: true,
              skills: true,
            },
          },
        },
      },
    },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  res.status(200).json({
    status: 1,
    message: "Post retrieved successfully",
    post,
  });
});

// Get user's own posts
const getMyPosts = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          requests: true,
        },
      },
    },
  });

  res.status(200).json({
    status: 1,
    message: "Your posts retrieved successfully",
    posts,
  });
});

// Update a post
const updatePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const {
    category,
    offeringDescription,
    seekingDescription,
    location,
    tradeValue,
    isActive,
  } = req.body;

  // Check if post exists and belongs to user
  const existingPost = await prisma.post.findUnique({
    where: { id },
  });

  if (!existingPost) {
    throw new AppError("Post not found", 404);
  }

  if (existingPost.userId !== userId) {
    throw new AppError("You can only update your own posts", 403);
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      category,
      offeringDescription,
      seekingDescription,
      location,
      tradeValue,
      isActive,
    },
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
  });

  res.status(200).json({
    status: 1,
    message: "Post updated successfully",
    post,
  });
});

// Delete a post
const deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if post exists and belongs to user
  const existingPost = await prisma.post.findUnique({
    where: { id },
  });

  if (!existingPost) {
    throw new AppError("Post not found", 404);
  }

  if (existingPost.userId !== userId) {
    throw new AppError("You can only delete your own posts", 403);
  }

  await prisma.post.delete({
    where: { id },
  });

  res.status(200).json({
    status: 1,
    message: "Post deleted successfully",
  });
});

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
};
