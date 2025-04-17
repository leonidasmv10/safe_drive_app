import React, { useEffect, useState } from "react";

export default function AnimatedBorder({ direction }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true); // fade-in

    const timer = setTimeout(() => {
      setVisible(false); // fade-out después de 3s
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const classMap = {
    left: "beam beam-left",
    right: "beam beam-right",
  };

  return (
    <div className={`${classMap[direction] || ""} ${visible ? "fade-in" : "fade-out"}`} />
  );
}
