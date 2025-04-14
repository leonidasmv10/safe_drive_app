import React from "react";
import Navigation from "@/components/Navigation/Navigation";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow pb-20">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
}
