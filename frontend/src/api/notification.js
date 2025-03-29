export async function fetchNotifications() {
  try {
    const response = await fetch("/api/notifications");
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
    const response = await fetch("/api/notifications", {
      method: "DELETE",
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
