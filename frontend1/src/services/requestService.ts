const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface Request {
  id: string;
  postId: string;
  requesterId: string;
  postOwnerId: string;
  offeredValue: number;
  requestedValue: number;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  requester?: {
    id: string;
    name: string;
    profession?: string;
    skills?: string[];
    coins?: number;
  };
  post?: any;
  trade?: any;
}

export interface CreateRequestData {
  postId: string;
  offeredValue: number;
  requestedValue: number;
  message?: string;
}

export interface GetRequestsResponse {
  status: number;
  message: string;
  requests: Request[];
}

export interface GetRequestResponse {
  status: number;
  message: string;
  request: Request;
  trade?: any;
}

export const createRequest = async (
  requestData: CreateRequestData,
  token: string
): Promise<GetRequestResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to create request");
  }

  return data;
};

export const getReceivedRequests = async (
  token: string,
  status?: string
): Promise<GetRequestsResponse> => {
  const queryParams = status ? `?status=${status}` : "";
  const response = await fetch(
    `${API_BASE_URL}/api/requests/received${queryParams}`,
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
    throw new Error(data.message || "Failed to fetch received requests");
  }

  return data;
};

export const getSentRequests = async (
  token: string,
  status?: string
): Promise<GetRequestsResponse> => {
  const queryParams = status ? `?status=${status}` : "";
  const response = await fetch(
    `${API_BASE_URL}/api/requests/sent${queryParams}`,
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
    throw new Error(data.message || "Failed to fetch sent requests");
  }

  return data;
};

export const acceptRequest = async (
  id: string,
  token: string
): Promise<GetRequestResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/requests/${id}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to accept request");
  }

  return data;
};

export const rejectRequest = async (
  id: string,
  token: string
): Promise<GetRequestResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/requests/${id}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to reject request");
  }

  return data;
};

export const updateRequest = async (
  id: string,
  requestData: Omit<CreateRequestData, "postId">,
  token: string
): Promise<GetRequestResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to update request");
  }

  return data;
};

