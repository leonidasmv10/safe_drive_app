import { NavLink, useLocation } from "react-router-dom";
import {
  CarIcon,
  NavigationIcon,
  SettingsIcon,
} from "@/components/Icons/Icons";
import "@/components/Navigation/navigation.css";

const navigationItems = [
  {
    name: "Map",
    icon: NavigationIcon,
    path: "/map",
    label: "Mapa",
  },
  {
    name: "Home",
    icon: CarIcon,
    path: "/car-view",
    label: "Vehículo",
  },
  {
    name: "Settings",
    icon: SettingsIcon,
    path: "/settings",
    label: "Ajustes",
  },
];

export default function Navigation() {
  const location = useLocation();

  const isActive = (item) => {
    return (
      location.pathname === item.path ||
      (item.path === "/settings" &&
        (location.pathname.includes("/edit-profile") ||
          location.pathname.includes("/change-password")))
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-purple-100">
      <div className="flex justify-around items-center relative">
        {/* Fondo del indicador con degradado */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300 ease-in-out"
          style={{
            width: `33.33%`,
            transform: `translateX(${
              navigationItems.findIndex((item) => isActive(item)) * 100
            }%)`,
          }}
        />

        {navigationItems.map((item) => {
          const active = isActive(item);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-3 px-4 w-full
                ${isActive ? "text-purple-600" : "text-gray-500"}
                hover:text-purple-500 transition-all duration-300
              `}
            >
              <div
                className={`
                relative 
                flex items-center justify-center 
                mb-1 
                transition-all duration-300
                ${active ? "scale-110" : "scale-100"}
              `}
              >
                {/* Efecto de resplandor para íconos activos */}
                {active && (
                  <span className="absolute inset-0 bg-purple-100 rounded-full opacity-30 animate-pulse"></span>
                )}
                <item.icon
                  className={`
                  w-6 h-6 
                  transition-all duration-300
                  ${active ? "text-purple-600 drop-shadow-sm" : "text-gray-500"}
                  relative z-10
                `}
                />
              </div>
              <span
                className={`
                text-xs font-medium 
                transition-all duration-300
                ${active ? "text-purple-600 font-semibold" : "text-gray-500"}
              `}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
