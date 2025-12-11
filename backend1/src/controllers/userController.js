const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/prisma");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendWelcomeEmail } = require("../utils/emailService");

// Sign up controller
const signup = catchAsync(async (req, res, next) => {
  // Check if Prisma client is properly initialized
  if (!prisma || !prisma.user) {
    throw new AppError(
      "Database client not initialized. Please run 'npm run prisma:generate' and restart the server",
      500
    );
  }

  const { name, email, password } = req.body;

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  // Send welcome email (don't block response if email fails)
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (emailError) {
    // Log error but don't fail the signup process
    console.error("Failed to send welcome email:", emailError);
  }

  res.status(201).json({
    status: 1,
    message: "User created successfully",
    user,
  });
});

// Login controller
const login = catchAsync(async (req, res, next) => {
  // Check if Prisma client is properly initialized
  if (!prisma || !prisma.user) {
    throw new AppError(
      "Database client not initialized. Please run 'npm run prisma:generate' and restart the server",
      500
    );
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Return user data (excluding password)
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-this-in-production",
    { expiresIn: "7d" } // Token expires in 7 days
  );

  res.status(200).json({
    status: 1,
    message: "Login successful",
    user: userData,
    token,
  });
});

// Get current user profile (protected route)
const getMe = catchAsync(async (req, res, next) => {
  // Check if Prisma client is properly initialized
  if (!prisma || !prisma.user) {
    throw new AppError(
      "Database client not initialized. Please run 'npm run prisma:generate' and restart the server",
      500
    );
  }

  // Get user ID from JWT token (set by authenticateToken middleware)
  const userId = req.user.id;

  // Find user by ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      profession: true,
      skills: true,
      coins: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    status: 1,
    message: "User retrieved successfully",
    user,
  });
});

// Update user profile
const updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { name, profession, skills } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (profession !== undefined) updateData.profession = profession;
  if (skills !== undefined) updateData.skills = skills;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      profession: true,
      skills: true,
      coins: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    status: 1,
    message: "Profile updated successfully",
    user,
  });
});

// Get user dashboard data
const getDashboard = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      profession: true,
      skills: true,
      coins: true,
    },
  });

  // Get user's active posts
  const activePosts = await prisma.post.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      _count: {
        select: { requests: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Get pending received requests
  const pendingRequests = await prisma.request.findMany({
    where: {
      postOwnerId: userId,
      status: "PENDING",
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          profession: true,
          skills: true,
        },
      },
      post: {
        select: {
          id: true,
          category: true,
          offeringDescription: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Get active trades
  const activeTrades = await prisma.trade.findMany({
    where: {
      OR: [{ providerId: userId }, { seekerId: userId }],
      status: {
        in: ["IN_PROGRESS", "PROVIDER_COMPLETED", "SEEKER_COMPLETED"],
      },
    },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
      seeker: {
        select: {
          id: true,
          name: true,
        },
      },
      request: {
        include: {
          post: {
            select: {
              category: true,
              offeringDescription: true,
              seekingDescription: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get statistics
  const stats = {
    totalPosts: await prisma.post.count({ where: { userId } }),
    activePosts: await prisma.post.count({ where: { userId, isActive: true } }),
    pendingRequests: await prisma.request.count({
      where: { postOwnerId: userId, status: "PENDING" },
    }),
    completedTrades: await prisma.trade.count({
      where: {
        OR: [{ providerId: userId }, { seekerId: userId }],
        status: "COMPLETED",
      },
    }),
    activeTrades: await prisma.trade.count({
      where: {
        OR: [{ providerId: userId }, { seekerId: userId }],
        status: {
          in: ["IN_PROGRESS", "PROVIDER_COMPLETED", "SEEKER_COMPLETED"],
        },
      },
    }),
  };

  res.status(200).json({
    status: 1,
    message: "Dashboard data retrieved successfully",
    dashboard: {
      user,
      activePosts,
      pendingRequests,
      activeTrades,
      stats,
    },
  });
});

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  getDashboard,
};
