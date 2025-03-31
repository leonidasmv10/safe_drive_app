import './App.css';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import { useState } from 'react';
import RecoverPassword from './components/RecoverPassword/RecoverPassword'; // Asegúrate de tener este componente creado

function App() {
  // Estado para controlar si se muestra el login, registro o recuperación de contraseña
  const [showRegister, setShowRegister] = useState(false);
  const [showRecover, setShowRecover] = useState(false);

  // Función para manejar la navegación al registro
  const handleNavigateToRegister = () => {
    setShowRegister(true); // Muestra el componente de registro
    setShowRecover(false); // Asegurarse de que la pantalla de recuperación de contraseña no se muestre
  };

  const handleNavigateToLogin = () => {
    setShowRegister(false);
    setShowRecover(false);
  };

  // Función para manejar la navegación a la recuperación de contraseña
  const navigateToRecover = () => {
    setShowRecover(true);
    setShowRegister(false); // Asegurarse de que la pantalla de registro no se muestre
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mi aplicación</h1>

        {showRecover ? (
          <RecoverPassword />
        ) : showRegister ? (
          <Register onNavigateToLogin={handleNavigateToLogin} />
        ) : (
          <Login onNavigateToRegister={handleNavigateToRegister} onNavigateToRecover={navigateToRecover} />
        )}
      </header>
    </div>
  );
}

export default App;
