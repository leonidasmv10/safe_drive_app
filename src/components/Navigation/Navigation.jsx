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

  return (
    <nav>
      <div className="navigationWrapper">
        <div
          className="navigationHighlight"
          style={{
            transform: `translateX(${navigationItems.findIndex(item => 
              item.path === location.pathname || 
              (item.path === "/settings" && 
                (location.pathname.includes('/edit-profile') || location.pathname.includes('/change-password'))
              )
            ) * 100}%)`,
          }}
        />
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className="iconWrapper"
            isActive={() => 
              location.pathname === item.path || 
              (item.path === "/settings" && 
                (location.pathname.includes('/edit-profile') || location.pathname.includes('/change-password'))
              )
            }
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
