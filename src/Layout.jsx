import React from "react";
import Navigation from "@/components/Navigation/Navigation";
export default function Layout({ children }) {
  return (
    <div className="layout">
      <main>{children}</main>
      <Navigation/>
    </div>
  );
}
