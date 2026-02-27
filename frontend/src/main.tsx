import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import StoryPage from "./pages/StoryPage";
import "./index.css";

const router = createBrowserRouter([
  { path: "/stories", element: <StoryPage /> },
  { path: "/stories/:storyId", element: <StoryPage /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);