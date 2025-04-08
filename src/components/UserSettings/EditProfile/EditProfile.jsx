import { useState, useEffect } from "react";

import "@/components/UserSettings/userSettings.css";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();
  const API_URL = "http://localhost:8000"; // Ajusta según tu entorno
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    preferred_alert_type: "",
    vehicle_type: "",
    suscription: false,
  });

  useEffect(() => {
    // Puedes cargar los datos del perfil actual aquí si quieres prellenar
    fetch(`${API_URL}/user/profile/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setForm({
          full_name: data.full_name || "",
          phone_number: data.phone_number || "",
          preferred_alert_type: data.preferred_alert_type || "",
          vehicle_type: data.vehicle_type || "",
          suscription: data.suscription || false,
        });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/user/profile/`, {
        method: "PUT", // o "PATCH" si solo quieres actualizar algunos campos
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Perfil actualizado correctamente");
        navigate('/settings');
      } else {
        const errorData = await res.json();
        console.error("Error al actualizar:", errorData);
      }
    } catch (err) {
      console.error("Error en la petición:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input className="input-background"
        name="full_name"
        value={form.full_name}
        onChange={handleChange}
        placeholder="Nombre completo"
      />
      <input className="input-background"
        name="phone_number"
        value={form.phone_number}
        onChange={handleChange}
        placeholder="Teléfono"
      />
      
      <div>
        <label htmlFor="preferred_alert_type">Tipo de alerta</label>
        <select className="input-background"
          name="preferred_alert_type"
          value={form.preferred_alert_type}
          onChange={handleChange}
        >
          <option value="visual">Visual</option>
          <option value="audio">Audio</option>
        </select>
      </div>
  
      <div>
        <label htmlFor="vehicle_type">Tipo de vehículo</label>
        <select className="input-background"
          name="vehicle_type"
          value={form.vehicle_type}
          onChange={handleChange}
        >
          <option value="coche">Coche</option>
          <option value="moto">Moto</option>
          <option value="camion">Camión</option>
          <option value="furgoneta">Furgoneta</option>
        </select>
      </div>
  
      <label>
        Suscripción:
        <input
          type="checkbox"
          name="suscription"
          checked={form.suscription}
          onChange={handleChange}
        />
      </label>
  
      <button type="submit">Guardar cambios</button>
    </form>
  );
  
}
