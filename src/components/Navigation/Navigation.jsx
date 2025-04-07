import { NavLink, useLocation } from "react-router-dom";
import {
  CarIcon,
  NavigationIcon,
  SettingsIcon,
} from "@/components/Icons/Icons";
import "@/components/Navigation/navigation.css";

const navigationItems = [
  { name: "Map", icon: NavigationIcon, path: "/map" },
  { name: "Home", icon: CarIcon, path: "/car-view" },
  { name: "Settings", icon: SettingsIcon, path: "/settings" },
];

export default function Navigation() {
  const location = useLocation();
  const activeIndex = navigationItems.findIndex(item => item.path === location.pathname);

  return (
    <nav>
      <div className="navigationWrapper">
        <div
          className="navigationHighlight"
          style={{
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className="iconWrapper"
          >
            {({ isActive }) => (
              <item.icon className={isActive ? "iconActive" : "icon"} />
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
