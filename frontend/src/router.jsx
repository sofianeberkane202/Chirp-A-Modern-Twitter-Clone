import { createBrowserRouter, Navigate } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import NotificationPage from "./pages/notification/NotificationPage";
import Profile from "./pages/profile/ProfilePage";
import AppLayout from "./components/common/AppLayout";
import ProtectRoutes from "./components/common/ProtectRoutes";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectRoutes>
        <AppLayout />
      </ProtectRoutes>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "notifications",
        element: <NotificationPage />,
      },
      {
        path: "profile/:username",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);

export default router;
