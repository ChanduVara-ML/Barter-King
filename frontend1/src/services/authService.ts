const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  token?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  status: number;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export interface GetUserResponse {
  status: number;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const signup = async (
  credentials: SignupRequest
): Promise<SignupResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
};

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
