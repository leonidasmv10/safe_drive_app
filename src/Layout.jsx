import React from "react";
import Navigation from "@/components/Navigation/Navigation";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-gray-50">
      <main className="flex-grow overflow-hidden">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
}
