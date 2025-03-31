const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export async function getUserProfile(username) {
  const response = await fetch(`${API_BASE_URL}/users/profile/${username}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getSuggestedUsers() {
  const response = await fetch(`${API_BASE_URL}/users/suggested`, {
    credentials: "include",
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function followUnfollowUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/follow/${userId}`, {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unknown error occurred");
    }
    console.log("data", data);
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

export async function editProfile(newProfileData) {
  console.log("newProfileData", newProfileData.coverImg);
  try {
    const response = await fetch(`${API_BASE_URL}/users/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProfileData),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unknown error occurred");
    }
    console.log("data", data);
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

export async function editImgProfile(newProfileData) {
  console.log(
    "newProfileDataImg",
    newProfileData.get("coverImg"),
    newProfileData.get("profileImg")
  );
  try {
    const response = await fetch(`${API_BASE_URL}/users/update`, {
      method: "PUT",
      body: newProfileData,
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unknown error occurred");
    }
    console.log("data", data);
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}
