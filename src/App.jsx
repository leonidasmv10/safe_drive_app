import './App.css';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import { useState } from 'react';
import RecoverPassword from './components/RecoverPassword/RecoverPassword'; // Asegúrate de tener este componente creado
import Layout from "./Layout";
function App() {
  // Estado para controlar si se muestra el login, registro o recuperación de contraseña
  const [showRegister, setShowRegister] = useState(false);
  const [showRecover, setShowRecover] = useState(false);

  // Función para manejar la navegación al registro
  const handleNavigateToRegister = () => {
    setShowRegister(true); // Muestra el componente de registro
    setShowRecover(false); // Asegurarse de que la pantalla de recuperación de contraseña no se muestre
  };

  // Función para manejar la navegación a la recuperación de contraseña
  const navigateToRecover = () => {
    setShowRecover(true);
    setShowRegister(false); // Asegurarse de que la pantalla de registro no se muestre
  };

  return (
  <Layout>
    <div className="App">
      <header className="App-header">
        <h1>Mi aplicación</h1>

        {/* Si showRecover es true, mostramos el componente de recuperación de contraseña */}
        {showRecover ? (
          <RecoverPassword />
        ) : (
          // Si showRegister es true, mostramos el componente Register, si no, mostramos Login
          !showRegister ? (
            <Login onNavigateToRegister={handleNavigateToRegister} onNavigateToRecover={navigateToRecover} />
          ) : (
            <Register />
          )
        )}
      </header>
    </div>
    </Layout>
  );
}

export default App;
