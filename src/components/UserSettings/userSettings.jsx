import React from "react";
import { useNavigate } from "react-router-dom";
import "@/components/UserSettings/userSettings.css";
import { API_URL } from '@/api/config';

export default function UserSettings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/user/logout/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          refresh: localStorage.getItem("refresh_token"),
        }),
      });

      if (res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        alert("Sesión cerrada");
        navigate("/");
      }
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  const handleEditProfile = async () => {
    navigate("/edit-profile");
  };

  const handleChangePassword = async () => {
    navigate("/change-password");
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
      )
    )
      return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("No estás autenticado. Por favor, inicia sesión de nuevo.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/user/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(
          `Error: ${
            errorData.message || "Hubo un problema al eliminar la cuenta."
          }`
        );
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      alert("Cuenta eliminada correctamente");
      navigate("/");
    } catch (error) {
      console.error("Error eliminando cuenta:", error);
      alert(
        "Hubo un error al intentar eliminar la cuenta. Inténtalo nuevamente más tarde."
      );
    }
  };

  // Opciones de configuración agrupadas por categorías
  const settingsOptions = [
    {
      category: "Cuenta",
      options: [
        {
          id: "edit-profile",
          label: "Editar perfil",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                clipRule="evenodd"
              />
            </svg>
          ),
          onClick: handleEditProfile,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          id: "change-password",
          label: "Cambiar contraseña",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          ),
          onClick: handleChangePassword,
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
      ],
    },
    {
      category: "Sesión",
      options: [
        {
          id: "logout",
          label: "Cerrar sesión",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2V1.414l5 5H11a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
              <path d="M4 12a1 1 0 011-1h3a1 1 0 110 2H5a1 1 0 01-1-1zM4 8a1 1 0 011-1h5a1 1 0 110 2H5a1 1 0 01-1-1z" />
            </svg>
          ),
          onClick: handleLogout,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
      ],
    },
    {
      category: "Peligro",
      options: [
        {
          id: "delete-account",
          label: "Eliminar cuenta",
          description:
            "Esta acción eliminará permanentemente tu cuenta y todos tus datos",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
          onClick: handleDeleteAccount,
          color: "text-red-600",
          bgColor: "bg-red-100",
          danger: true,
        },
      ],
    },
  ];

  return (
    <div className="pb-20 pt-6 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ajustes</h1>
          <p className="text-gray-600">Gestiona tu cuenta y preferencias</p>
        </header>

        {settingsOptions.map((category) => (
          <div key={category.category} className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              {category.category}
            </h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {category.options.map((option, index) => (
                <button
                  key={option.id}
                  onClick={option.onClick}
                  className={`w-full text-left px-4 py-4 flex items-center space-x-3 border-b last:border-b-0 border-gray-100 focus:outline-none focus:bg-gray-50 hover:bg-gray-50 transition-colors duration-150 ${
                    option.danger ? "hover:bg-red-50" : ""
                  }`}
                >
                  <div
                    className={`flex-shrink-0 p-2 rounded-full ${option.bgColor}`}
                  >
                    <span className={option.color}>{option.icon}</span>
                  </div>
                  <div>
                    <div
                      className={`font-medium ${
                        option.danger ? "text-red-600" : "text-gray-800"
                      }`}
                    >
                      {option.label}
                    </div>
                    {option.description && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {option.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center text-gray-500 text-xs mt-10">
          <p>SafeDrive v1.0.0</p>
          <p className="mt-1">
            © 2025 SafeDrive. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
