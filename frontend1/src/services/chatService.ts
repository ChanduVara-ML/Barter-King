const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  conversationId?: string;
  createdAt?: string;
}

export interface GetMessagesResponse {
  status: number;
  message: string;
  messages: ChatMessage[];
}

export interface Conversation {
  id: string;
  post?: {
    id: string;
    userId: string;
    category: string;
    offeringDescription: string;
    seekingDescription: string;
    location: string;
    tradeValue: number;
    user?: {
      id: string;
      name: string;
      profession?: string;
    };
  } | null;
  otherUser: {
    id: string;
    name: string;
  };
  lastMessageAt?: string;
}

export interface GetConversationsResponse {
  status: number;
  message: string;
  conversations: Conversation[];
}

export interface GetConversationFromPostResponse {
  status: number;
  message: string;
  conversation: Conversation;
  messages: ChatMessage[];
}

export const getMessages = async (
  token: string,
  params: { conversationId: string; limit?: number }
): Promise<GetMessagesResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append("conversationId", params.conversationId);
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const response = await fetch(
    `${API_BASE_URL}/api/chat/messages?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to fetch messages");
  }

  return data;
};

export const getConversations = async (
  token: string
): Promise<GetConversationsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to fetch conversations");
  }

  return data;
};

export const getConversationFromPost = async (
  token: string,
  postId: string,
  limit = 100
): Promise<GetConversationFromPostResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append("postId", postId);
  queryParams.append("limit", limit.toString());

  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversation-from-post?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to fetch conversation");
  }

  return data;
};

export interface User {
  id: string;
  name: string;
  email: string;
  profession?: string;
}

export interface SearchUsersResponse {
  status: number;
  message: string;
  users: User[];
}

export const searchUsers = async (
  token: string,
  query: string,
  limit = 20
): Promise<SearchUsersResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append("query", query);
  queryParams.append("limit", limit.toString());

  const response = await fetch(
    `${API_BASE_URL}/api/chat/search-users?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to search users");
  }

  return data;
};

export const getConversationFromUser = async (
  token: string,
  userId: string,
  limit = 100
): Promise<GetConversationFromPostResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append("userId", userId);
  queryParams.append("limit", limit.toString());

  const response = await fetch(
    `${API_BASE_URL}/api/chat/conversation-from-user?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to fetch conversation");
  }

  return data;
};


