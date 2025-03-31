const API_URL = import.meta.env.VITE_API_URL;

export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
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
};

export const loginUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
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
};

export const logoutUser = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include", // Ensures cookies are sent
  });
  return response.json();
};

export const getMe = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: "include", // Ensures cookies are sent
  });
  return response.json();
};
