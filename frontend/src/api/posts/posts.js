async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`/api/posts${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "An unknown error occurred");
    }

    return data || [];
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Fetch posts for a specific user (with pagination)
export const getUserPosts = (userName, page = 1) =>
  fetchAPI(`/user/${userName}?page=${page}`);
// Fetch all posts (with pagination)
export const fetchAllPosts = ({ page = 1 }) => fetchAPI(`?page=${page}`);

// Share a new post
export const shareNewPost = (post) =>
  fetchAPI("/create", { method: "POST", body: post });

// Delete a post
export const deletePost = (postId) =>
  fetchAPI(`/delete-post/${postId}`, { method: "DELETE" });

// Comment on a post
export const commentOnPost = ({ postId, text }) =>
  fetchAPI(`/comment/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

// Like or unlike a post
export const likeOrUnlikePost = (postId) =>
  fetchAPI(`/like/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

// Get liked posts (with pagination)
export const getLikedPosts = ({ userId, page = 1 }) =>
  fetchAPI(`/user-liked-posts/${userId}?page=${page}`);

// Get posts from users the logged-in user follows (with pagination)
export const getAllUsersFollowingPosts = ({ page = 1 }) =>
  fetchAPI(`/following?page=${page}`);
