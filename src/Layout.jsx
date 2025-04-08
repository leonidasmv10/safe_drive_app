import React from "react";
import Navigation from "@/components/Navigation/Navigation";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="layout">
      <main>
        <Outlet /> {/* Aquí se inyectarán las rutas hijas */}
      </main>
      <Navigation />
    </div>
  );
}
