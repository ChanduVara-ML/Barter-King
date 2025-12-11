const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface Post {
  id: string;
  userId: string;
  category: "SKILLS" | "SERVICES" | "WORK" | "ITEMS";
  offeringDescription: string;
  seekingDescription: string;
  location: string;
  tradeValue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    profession?: string;
    skills?: string[];
  };
  _count?: {
    requests: number;
  };
}

export interface CreatePostRequest {
  category: "SKILLS" | "SERVICES" | "WORK" | "ITEMS";
  offeringDescription: string;
  seekingDescription: string;
  location: string;
  tradeValue: number;
}

export interface GetAllPostsResponse {
  status: number;
  message: string;
  posts: Post[];
  pagination: {
    total: number;
    skip: number;
    take: number;
  };
}

export interface GetPostResponse {
  status: number;
  message: string;
  post: Post;
}

export const getAllPosts = async (params?: {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  skip?: number;
  take?: number;
}): Promise<GetAllPostsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append("category", params.category);
  if (params?.location) queryParams.append("location", params.location);
  if (params?.minPrice !== undefined)
    queryParams.append("minPrice", params.minPrice.toString());
  if (params?.maxPrice !== undefined)
    queryParams.append("maxPrice", params.maxPrice.toString());
  if (params?.skip !== undefined)
    queryParams.append("skip", params.skip.toString());
  if (params?.take !== undefined)
    queryParams.append("take", params.take.toString());

  const response = await fetch(
    `${API_BASE_URL}/api/posts?${queryParams.toString()}`
  );

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to fetch posts");
  }

  return data;
};

export const getPostById = async (id: string): Promise<GetPostResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/${id}`);

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to fetch post");
  }

  return data;
};

export const createPost = async (
  postData: CreatePostRequest,
  token: string
): Promise<GetPostResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to create post");
  }

  return data;
};

export const getMyPosts = async (
  token: string
): Promise<GetAllPostsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/my/posts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to fetch your posts");
  }

  return data;
};

export const updatePost = async (
  id: string,
  postData: Partial<CreatePostRequest> & { isActive?: boolean },
  token: string
): Promise<GetPostResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to update post");
  }

  return data;
};

export const deletePost = async (
  id: string,
  token: string
): Promise<{ status: number; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === 0) {
    throw new Error(data.message || "Failed to delete post");
  }

  return data;
};
