import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import RightPanel from "./RightPanel";

function AppLayout() {
  return (
    <div className="flex max-w-6xl mx-auto">
      <Sidebar />

      <Outlet />

      <RightPanel />
    </div>
  );
}

export default AppLayout;
