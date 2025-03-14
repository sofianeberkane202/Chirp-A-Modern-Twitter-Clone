import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import SideBar from "./components/common/Sidebar";
import NotificationPage from "./pages/notification/NotificationPage";
import Profile from "./pages/profile/ProfilePage";
import RightPanel from "./components/common/RightPanel";

function App() {
  return (
    <div className="flex max-w-6xl mx-auto">
      <SideBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/profile/:username" element={<Profile />} />
      </Routes>
      <RightPanel />
    </div>
  );
}

export default App;
