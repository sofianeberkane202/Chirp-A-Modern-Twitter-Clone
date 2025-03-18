export const createUser = async (userData) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
};

export const loginUser = async (userData) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorMessage = await response.json();
    throw new Error(errorMessage.message);
  }

  return response.json();
};

export const logoutUser = async () => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });
  return response.json();
};

export const getMe = async () => {
  const response = await fetch("/api/auth/me");
  return response.json();
};
