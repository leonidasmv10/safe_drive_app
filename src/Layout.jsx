import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Navigation from "@/components/Navigation/Navigation";
import NotificationLayout from "@/components/shared/NotificationLayout";

export default function Layout() {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" replace />;

  return (
    <div
      className="app-container"
      style={{
        height: "100vh",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <main className="flex-grow overflow-hidden">
        <Outlet />
      </main>
      <Navigation />
      <NotificationLayout />
    </div>
  );
}
