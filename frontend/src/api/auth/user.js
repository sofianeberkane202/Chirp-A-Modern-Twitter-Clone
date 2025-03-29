export const createUser = async (userData) => {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json(); // Parse JSON response

    if (!response.ok) {
      throw new Error(data.message || "An unknown error occurred");
    }

    return data; // Return successful response data
  } catch (error) {
    throw new Error(error.message || "Network error"); // Ensure error is always a string
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An unkown occured");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
};

export const logoutUser = async () => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });
  return response.json();
};

export const getMe = async () => {
  const response = await fetch("/api/auth/me");
  const data = await response.json();
  return data;
};
