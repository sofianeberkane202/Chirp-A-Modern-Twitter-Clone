const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export async function fetchNotifications() {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      credentials: "include", // Ensures cookies are sent
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "An unknown error occurred");
    }
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

export async function deleteNotifications() {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: "DELETE",
      credentials: "include", // Ensures cookies are sent
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "An unknown error occurred");
    }
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}
