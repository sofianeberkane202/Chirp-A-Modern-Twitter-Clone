import React from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import router from "./router.jsx"; // Import the new router

function App() {
  return (
    <div>
      <RouterProvider router={router} /> {/* ✅ Use RouterProvider */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerStyle={{
          minWidth: "350px",
          width: "100%",
        }}
      />
    </div>
  );
}

export default App;
