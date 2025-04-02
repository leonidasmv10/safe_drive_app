import { CarIcon, NavigationIcon, SettingsIcon } from "@/components/Icons/Icons";
import "@/components/Navigation/navigation.css"
const navigationItems = [
  { name: "Map", icon: NavigationIcon, path: "/map" },
  { name: "Home", icon: CarIcon, path: "/" },
  { name: "Settings", icon: SettingsIcon, path: "/settings" },
];

export default function Navigation() {
  return (
    
      <nav>
        <div className="navigationWrapper">
        {navigationItems.map((item) => (
          <div className="iconWrapper iconWrapperActive">
          <a
            key={item.name}
            href={item.path}
             >
            <item.icon className="iconActive"/>
          </a>
          </div>
        ))}
        </div>
      </nav>
  );
}
