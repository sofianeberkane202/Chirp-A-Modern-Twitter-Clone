import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectRoutes from "./components/common/ProtectRoutes";
import AppLayout from "./components/common/AppLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Lazy Load Pages
const HomePage = lazy(() => import("./pages/home/HomePage"));
const SignUpPage = lazy(() => import("./pages/auth/signup/SignUpPage"));
const LoginPage = lazy(() => import("./pages/auth/login/LoginPage"));
const NotificationPage = lazy(() =>
  import("./pages/notification/NotificationPage")
);
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));

// const Loading = <div>Loading...</div>; // Replace with a better loader if needed

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
        element: (
          <Suspense
            fallback={
              <div className="flex items-center justify-center">
                <LoadingSpinner />
              </div>
            }
          >
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "notifications",
        element: (
          <Suspense
            fallback={
              <div className="flex items-center justify-center">
                <LoadingSpinner />
              </div>
            }
          >
            <NotificationPage />
          </Suspense>
        ),
      },
      {
        path: "profile/:username",
        element: (
          <Suspense
            fallback={
              <div className="flex items-center justify-center">
                <LoadingSpinner />
              </div>
            }
          >
            <ProfilePage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/signup",
    element: (
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <SignUpPage />
      </Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);

export default router;
