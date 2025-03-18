import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, loginUser, logoutUser } from "../api/auth/user";
import { useUserContext } from "../context/userContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function useAuth() {
  const { loginOrSignup, logout } = useUserContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ Helper function to handle success cases
  const handleAuthSuccess = async (data, message) => {
    loginOrSignup(data.data.user);
    toast.success(message);
    await queryClient.invalidateQueries({ queryKey: ["me"] }); // Ensure it's awaited
    navigate("/");
  };

  // ✅ Helper function to handle errors
  const handleError = (error) => {
    console.error(error);
    toast.error(error.response?.data?.message || error.message);
  };

  const loginUserMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => handleAuthSuccess(data, "Login successful"),
    onError: handleError,
  });

  const signUpMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => handleAuthSuccess(data, "Sign up successful"),
    onError: handleError,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: async () => {
      logout();
      toast.success("Logout successful");
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/login"); // ✅ Redirect to login page after logout
    },
    onError: handleError,
  });

  return { loginUserMutation, signUpMutation, logoutMutation };
}

export default useAuth;
