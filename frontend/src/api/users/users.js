export async function getUserProfile(username) {
  const response = await fetch(`/api/users/profile/${username}`);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getSuggestedUsers() {
  const response = await fetch("/api/users/suggested");

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function followUnfollowUser(userId) {
  try {
    const response = await fetch(`/api/users/follow/${userId}`, {
      method: "POST",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unknown erorr occured");
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
    const response = await fetch(`/api/users/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProfileData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unknown erorr occured");
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
    const response = await fetch(`/api/users/update`, {
      method: "PUT",
      body: newProfileData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unknown erorr occured");
    }
    console.log("data", data);
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}
