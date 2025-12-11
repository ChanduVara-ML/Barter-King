const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface Trade {
  id: string;
  requestId: string;
  providerId: string;
  seekerId: string;
  providerValue: number;
  seekerValue: number;
  status:
    | "IN_PROGRESS"
    | "PROVIDER_COMPLETED"
    | "SEEKER_COMPLETED"
    | "COMPLETED"
    | "CANCELLED";
  providerCompleted: boolean;
  seekerCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  provider?: {
    id: string;
    name: string;
    profession?: string;
    skills?: string[];
    coins?: number;
  };
  seeker?: {
    id: string;
    name: string;
    profession?: string;
    skills?: string[];
    coins?: number;
  };
  request?: any;
}

export interface GetTradesResponse {
  status: number;
  message: string;
  trades: Trade[];
}

export interface GetTradeResponse {
  status: number;
  message: string;
  trade: Trade;
}

export const getMyTrades = async (
  token: string,
  status?: string
): Promise<GetTradesResponse> => {
  const queryParams = status ? `?status=${status}` : "";
  const response = await fetch(
    `${API_BASE_URL}/api/trades${queryParams}`,
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
    throw new Error(data.message || "Failed to fetch trades");
  }

  return data;
};

export const getTradeById = async (
  id: string,
  token: string
): Promise<GetTradeResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/trades/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to fetch trade");
  }

  return data;
};

export const markTaskComplete = async (
  id: string,
  token: string
): Promise<GetTradeResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/trades/${id}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to mark task as complete");
  }

  return data;
};

export const cancelTrade = async (
  id: string,
  token: string
): Promise<GetTradeResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/trades/${id}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to cancel trade");
  }

  return data;
};

