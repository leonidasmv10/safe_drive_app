import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@/components/UserSettings/userSettings.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const API_URL = "http://localhost:8000";
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    preferred_alert_type: "",
    vehicle_type: "",
    suscription: false,
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}/user/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("No se pudo cargar el perfil");
        }

        const data = await res.json();
        setForm({
          full_name: data.full_name || "",
          phone_number: data.phone_number || "",
          preferred_alert_type: data.preferred_alert_type || "",
          vehicle_type: data.vehicle_type || "",
          suscription: data.suscription || false,
        });
      } catch (err) {
        setError("Error al cargar el perfil. Inténtalo de nuevo más tarde.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [API_URL, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/user/profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        navigate("/settings");
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Error al actualizar el perfil");
        console.error("Error al actualizar:", errorData);
      }
    } catch (err) {
      setError("Error de conexión. Inténtalo de nuevo más tarde.");
      console.error("Error en la petición:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen pb-20 bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-purple-200 mb-3"></div>
          <div className="text-purple-500">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-6 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto">
        <header className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate("/settings")}
              className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Editar perfil</h1>
          </div>
          <p className="text-gray-600">Actualiza tu información personal</p>
        </header>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Información personal
            </h2>

            <div className="space-y-4">
              {/* Nombre completo */}
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre completo
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
                  required
                />
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="phone_number"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Número de teléfono
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="Tu número de teléfono"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Preferencias
            </h2>

            <div className="space-y-5">
              {/* Tipo de alerta */}
              <div>
                <label
                  htmlFor="preferred_alert_type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tipo de alerta
                </label>
                <div className="relative">
                  <select
                    id="preferred_alert_type"
                    name="preferred_alert_type"
                    value={form.preferred_alert_type}
                    onChange={handleChange}
                    className="appearance-none w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors pr-8"
                    required
                  >
                    <option value="visual">Visual</option>
                    <option value="audio">Audio</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Tipo de vehículo */}
              <div>
                <label
                  htmlFor="vehicle_type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tipo de vehículo
                </label>
                <div className="relative">
                  <select
                    id="vehicle_type"
                    name="vehicle_type"
                    value={form.vehicle_type}
                    onChange={handleChange}
                    className="appearance-none w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors pr-8"
                    required
                  >
                    <option value="coche">Coche</option>
                    <option value="moto">Moto</option>
                    <option value="camion">Camión</option>
                    <option value="furgoneta">Furgoneta</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Suscripción */}
              <div className="flex items-center">
                <input
                  id="suscription"
                  name="suscription"
                  type="checkbox"
                  checked={form.suscription}
                  onChange={handleChange}
                  className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300 transition-colors cursor-pointer"
                />
                <label
                  htmlFor="suscription"
                  className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Suscripción premium
                </label>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-white font-medium rounded-lg transition-colors flex justify-center items-center"
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
