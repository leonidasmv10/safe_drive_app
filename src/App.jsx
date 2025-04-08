<<<<<<< HEAD
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Importamos React Router
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import RecoverPassword from "./components/RecoverPassword/RecoverPassword";
import Map from "@/components/Map/Map";
import CarView from "@/components/CarView/CarView";
import UserSettings from "@/components/UserSettings/userSettings";
import ResetPassword from "./components/ResetPassword/ResetPassword"; // Asegúrate de tener esta página
import Layout from "./Layout";
import Home from "./components/Home/Home";
// import Map from './pages/map';
// import UserSettings from './pages/userSettings';
import PoliceCarAlert from "./components/Alert"; // Asegúrate de tener esta página
=======
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
>>>>>>> d1a87680b3c8fe4f43c81d985ea1e4d2d2f519c5

function App() {
  return (
    <Router>
<<<<<<< HEAD
      {" "}
      {/* Envolvemos la app en Router */}
      <Layout>
        <div className="App">
          <header className="App-header">
            <h1>Mi aplicación</h1>

            <Routes>
              {" "}
              {/* Aquí definimos las rutas */}
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route
                path="/reset-password/:uidb64/:token"
                element={<ResetPassword />}
              />
              <Route path="/map" element={<PoliceCarAlert />} />
              <Route path="/car-view" element={<CarView />} />
              <Route path="/settings" element={<UserSettings />} />
            </Routes>
          </header>
        </div>
      </Layout>
=======
      <div className="App">
        <header className="App-header">
          <h1>Mi aplicación</h1>

          <Routes>
            {/* Rutas sin Layout */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recover-password" element={<RecoverPassword />} />
            <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />

            {/* Rutas con Layout */}
            <Route element={<Layout />}>
              <Route path="/map" element={<Map />} />
              <Route path="/car-view" element={<CarView />} />
              <Route path="/settings" element={<UserSettings />} />
            </Route>
          </Routes>
        </header>
      </div>
>>>>>>> d1a87680b3c8fe4f43c81d985ea1e4d2d2f519c5
    </Router>
  );
}

export default App;
