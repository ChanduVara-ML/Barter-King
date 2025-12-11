const { prisma } = require("../config/prisma");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// Helper to find or create a conversation between current user and post owner
const getOrCreateConversationForPost = async (userId, postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      userId: true,
      category: true,
      offeringDescription: true,
      seekingDescription: true,
      location: true,
      tradeValue: true,
      user: {
        select: {
          id: true,
          name: true,
          profession: true,
        },
      },
    },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const otherUserId = post.userId;

  if (otherUserId === userId) {
    throw new AppError("You cannot start a chat with yourself", 400);
  }

  // Stable ordering of participants so we don't create duplicate conversations
  const [participantAId, participantBId] =
    userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];

  let conversation = await prisma.conversation.findFirst({
    where: {
      postId,
      participantAId,
      participantBId,
    },
    include: {
      post: {
        select: {
          id: true,
          userId: true,
          category: true,
          offeringDescription: true,
          seekingDescription: true,
          location: true,
          tradeValue: true,
          user: {
            select: {
              id: true,
              name: true,
              profession: true,
            },
          },
        },
      },
      participantA: {
        select: { id: true, name: true },
      },
      participantB: {
        select: { id: true, name: true },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        postId,
        participantAId,
        participantBId,
      },
      include: {
        post: {
          select: {
            id: true,
            userId: true,
            category: true,
            offeringDescription: true,
            seekingDescription: true,
            location: true,
            tradeValue: true,
            user: {
              select: {
                id: true,
                name: true,
                profession: true,
              },
            },
          },
        },
        participantA: {
          select: { id: true, name: true },
        },
        participantB: {
          select: { id: true, name: true },
        },
      },
    });
  }

  return conversation;
};

// Get all conversations for the current user
const getConversations = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participantAId: userId }, { participantBId: userId }],
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      post: {
        select: {
          id: true,
          userId: true,
          category: true,
          offeringDescription: true,
          seekingDescription: true,
          location: true,
          tradeValue: true,
          user: {
            select: {
              id: true,
              name: true,
              profession: true,
            },
          },
        },
      },
      participantA: {
        select: { id: true, name: true },
      },
      participantB: {
        select: { id: true, name: true },
      },
    },
  });

  const mapped = conversations.map((c) => {
    const otherUser =
      c.participantAId === userId ? c.participantB : c.participantA;

    return {
      id: c.id,
      post: c.post,
      otherUser,
      lastMessageAt: c.updatedAt,
    };
  });

  res.status(200).json({
    status: 1,
    message: "Conversations retrieved successfully",
    conversations: mapped,
  });
});

// Get or create a conversation for a given post and return it with messages
const getConversationFromPost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { postId, limit = 100 } = req.query;

  if (!postId) {
    throw new AppError("postId is required", 400);
  }

  const conversation = await getOrCreateConversationForPost(userId, postId);

  const messages = await prisma.chatMessage.findMany({
    where: {
      conversationId: conversation.id,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: parseInt(limit, 10),
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(200).json({
    status: 1,
    message: "Conversation retrieved successfully",
    conversation: {
      id: conversation.id,
      post: conversation.post,
      otherUser:
        conversation.participantAId === userId
          ? conversation.participantB
          : conversation.participantA,
      lastMessageAt: conversation.updatedAt,
    },
    messages: messages.map((m) => ({
      id: m.id,
      text: m.text,
      senderId: m.senderId,
      senderName: m.sender?.name || "User",
      conversationId: m.conversationId,
      createdAt: m.createdAt,
    })),
  });
});

// Get chat messages for a specific conversation
const getMessagesByConversation = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { conversationId, limit = 100 } = req.query;

  if (!conversationId) {
    throw new AppError("conversationId is required", 400);
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (
    !conversation ||
    (conversation.participantAId !== userId &&
      conversation.participantBId !== userId)
  ) {
    throw new AppError("Conversation not found", 404);
  }

  const messages = await prisma.chatMessage.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: parseInt(limit, 10),
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(200).json({
    status: 1,
    message: "Messages retrieved successfully",
    messages: messages.map((m) => ({
      id: m.id,
      text: m.text,
      senderId: m.senderId,
      senderName: m.sender?.name || "User",
      conversationId: m.conversationId,
      createdAt: m.createdAt,
    })),
  });
});

// Search users by name or email
const searchUsers = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { query: searchQuery, limit = 20 } = req.query;

  if (!searchQuery || searchQuery.trim().length === 0) {
    return res.status(200).json({
      status: 1,
      message: "Users retrieved successfully",
      users: [],
    });
  }

  const searchLimit = Math.min(parseInt(limit, 10), 50); // Max 50 results

  const users = await prisma.user.findMany({
    where: {
      id: { not: userId }, // Exclude current user
      OR: [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      profession: true,
    },
    take: searchLimit,
    orderBy: {
      name: "asc",
    },
  });

  res.status(200).json({
    status: 1,
    message: "Users retrieved successfully",
    users,
  });
});

// Helper to find or create a conversation between two users (without post)
const getOrCreateConversationForUser = async (userId, otherUserId) => {
  if (otherUserId === userId) {
    throw new AppError("You cannot start a chat with yourself", 400);
  }

  // Check if other user exists
  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, name: true },
  });

  if (!otherUser) {
    throw new AppError("User not found", 404);
  }

  // Stable ordering of participants so we don't create duplicate conversations
  const [participantAId, participantBId] =
    userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];

  // Look for existing conversation without a post
  let conversation = await prisma.conversation.findFirst({
    where: {
      postId: null,
      participantAId,
      participantBId,
    },
    include: {
      post: {
        select: {
          id: true,
          userId: true,
          category: true,
          offeringDescription: true,
          seekingDescription: true,
          location: true,
          tradeValue: true,
          user: {
            select: {
              id: true,
              name: true,
              profession: true,
            },
          },
        },
      },
      participantA: {
        select: { id: true, name: true },
      },
      participantB: {
        select: { id: true, name: true },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        postId: null,
        participantAId,
        participantBId,
      },
      include: {
        post: {
          select: {
            id: true,
            userId: true,
            category: true,
            offeringDescription: true,
            seekingDescription: true,
            location: true,
            tradeValue: true,
            user: {
              select: {
                id: true,
                name: true,
                profession: true,
              },
            },
          },
        },
        participantA: {
          select: { id: true, name: true },
        },
        participantB: {
          select: { id: true, name: true },
        },
      },
    });
  }

  return conversation;
};

// Get or create a conversation with a specific user and return it with messages
const getConversationFromUser = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { userId: otherUserId, limit = 100 } = req.query;

  if (!otherUserId) {
    throw new AppError("userId is required", 400);
  }

  const conversation = await getOrCreateConversationForUser(
    userId,
    otherUserId
  );

  const messages = await prisma.chatMessage.findMany({
    where: {
      conversationId: conversation.id,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: parseInt(limit, 10),
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(200).json({
    status: 1,
    message: "Conversation retrieved successfully",
    conversation: {
      id: conversation.id,
      post: conversation.post,
      otherUser:
        conversation.participantAId === userId
          ? conversation.participantB
          : conversation.participantA,
      lastMessageAt: conversation.updatedAt,
    },
    messages: messages.map((m) => ({
      id: m.id,
      text: m.text,
      senderId: m.senderId,
      senderName: m.sender?.name || "User",
      conversationId: m.conversationId,
      createdAt: m.createdAt,
    })),
  });
});

module.exports = {
  getConversations,
  getConversationFromPost,
  getMessagesByConversation,
  searchUsers,
  getConversationFromUser,
};
