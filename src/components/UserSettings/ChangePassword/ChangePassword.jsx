import { useState } from "react";
import "@/components/UserSettings/userSettings.css";

export default function ChangePassword() {
  const API_URL = "http://localhost:8000"; // Ajusta según tu entorno
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
  });    

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form)   
    try {
      const res = await fetch(`${API_URL}/user/change-password/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Contraseña cambiada correctamente");
      } else {
        const errorData = await res.json();
        console.error("Error al cambiar contraseña:", errorData);
      }
    } catch (err) {
      console.error("Error en la petición:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input className="input-background" name="old_password" value={form.old_password} onChange={handleChange}  type="password" placeholder="Contraseña actual" />
      <input className="input-background" name="new_password" value={form.new_password} onChange={handleChange}  type="password" placeholder="Nueva contraseña" />
      <button type="submit">Cambiar contraseña</button>
    </form>
  );
}