import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Importamos React Router
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import RecoverPassword from './components/RecoverPassword/RecoverPassword';
import Map from '@/components/Map/Map'
import CarView from '@/components/CarView/CarView';
import UserSettings from '@/components/UserSettings/userSettings';
import ResetPassword from './components/ResetPassword/ResetPassword'; // Asegúrate de tener esta página
import Layout from './Layout';

function App() {
  return (
    <Router> {/* Envolvemos la app en Router */}
      <Layout>
        <div className="App">
          <header className="App-header">
            <h1>Mi aplicación</h1>

            <Routes> {/* Aquí definimos las rutas */}
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
              <Route path="/map" element={<Map/>}/>
              <Route path='/car-view' element={<CarView/>}/>
              <Route path='/settings' element={<UserSettings/>}/>
            </Routes>
          </header>
        </div>
      </Layout>
    </Router>
  );
}

export default App;
