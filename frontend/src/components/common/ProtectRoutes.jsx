import React, { useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { useUserContext } from "../../context/userContext";
import { Navigate } from "react-router-dom";
import { useUserProfile } from "../../hooks/useUserProfile";

function ProtectRoutes({ children }) {
  const { loginOrSignup, isAuthenticated } = useUserContext();

  // Fetch user data
  const {
    meQuery: { data, isLoading, isError },
  } = useUserProfile();

  // Sync user context when data is available
  useEffect(() => {
    if (data?.data?.user) {
      loginOrSignup(data.data.user);
    }
  }, [data, loginOrSignup]);

  if (isAuthenticated) return children;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if the user is not authenticated
  if (isError || data.status === "fail") {
    return <Navigate to="/login" />;
  }
}

export default ProtectRoutes;
