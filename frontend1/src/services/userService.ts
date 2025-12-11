const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface User {
  id: string;
  name: string;
  email: string;
  profession?: string;
  skills?: string[];
  coins: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  profession?: string;
  skills?: string[];
}

export interface DashboardData {
  user: User;
  activePosts: any[];
  pendingRequests: any[];
  activeTrades: any[];
  stats: {
    totalPosts: number;
    activePosts: number;
    pendingRequests: number;
    completedTrades: number;
    activeTrades: number;
  };
}

export interface GetUserResponse {
  status: number;
  message: string;
  user: User;
}

export interface GetDashboardResponse {
  status: number;
  message: string;
  dashboard: DashboardData;
}

export const getUser = async (token: string): Promise<GetUserResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to fetch user");
  }

  return data;
};

export const updateProfile = async (
  profileData: UpdateProfileRequest,
  token: string
): Promise<GetUserResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
};

export const getDashboard = async (
  token: string
): Promise<GetDashboardResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to fetch dashboard");
  }

  return data;
};

