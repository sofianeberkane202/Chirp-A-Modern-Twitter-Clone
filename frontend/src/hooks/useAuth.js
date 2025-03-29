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
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    navigate("/");
  };

  // ✅ Improved error handling function
  const handleError = (error) => {
    console.log("Error:", error);
    toast.error(error.message || "Something went wrong. Please try again.");
  };

  const loginUserMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => handleAuthSuccess(data, "Login successful"),
    onError: handleError,
  });

  const signUpMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => handleAuthSuccess(data, "Sign up successful"),
    onError: handleError, // ✅ Proper error handling
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: async () => {
      logout();
      toast.success("Logout successful");
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/login");
    },
    onError: handleError,
  });

  return { loginUserMutation, signUpMutation, logoutMutation };
}

export default useAuth;
