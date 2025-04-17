import { useEffect, useState } from "react";
import WarningAlert from "@/components/shared/WarningAlert";
import AnimatedBorder from "@/components/shared/AnimatedBorder";

const NotificationLayout = () => {
  const [alerts, setAlerts] = useState([]);
  const API_URL = "http://localhost:8000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/detection/api/notifications/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return;
        console.log(data)
      
        const alertsWithId = data.map((item) => ({
          ...item,
          id: Date.now() + Math.random(),
        }));

        setAlerts(alertsWithId);

        // Oculta todas las alertas después de 5 segundos
        setTimeout(() => {
          setAlerts([]);
        }, 5000);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <>
    {alerts.map((alert) => (
      <AnimatedBorder    key={alert.id}
      direction={(alert.direction)} />
    ))}

    <div className="fixed top-4 right-4 z-50 w-80">
      
      {alerts.map((alert) => (
        <WarningAlert
          key={alert.id}
          type={alert.type}
          direction={alert.direction}
          onClose={() =>
            setAlerts((prev) => prev.filter((a) => a.id !== alert.id))
          }
        />
      ))}
    </div>
    </>
  );
};

export default NotificationLayout;
