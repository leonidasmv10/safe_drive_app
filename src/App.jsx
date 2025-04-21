import "./App.css";
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import { DetectionProvider } from "./context/DetectionContext";
import { ROUTES, PUBLIC_ROUTES, PRIVATE_ROUTES } from "./config/routes";

import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import RecoverPassword from "./components/RecoverPassword/RecoverPassword";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import Map from "@/components/Map/Map";
import CarView from "@/components/CarView/CarView";
import UserSettings from "@/components/UserSettings/userSettings";
import EditProfile from "@/components/UserSettings/EditProfile/EditProfile";
import ChangePassword from "@/components/UserSettings/ChangePassword/ChangePassword";
import Layout from "./Layout";
import Test from "./components/TestAudio";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <DetectionProvider>
          <Router>
            <Routes>
              {/* Rutas públicas */}
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route
                path={ROUTES.RECOVER_PASSWORD}
                element={<RecoverPassword />}
              />
              <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

              {/* Rutas privadas */}
              <Route element={<Layout />}>
                <Route
                  path={ROUTES.MAP}
                  element={
                    <PrivateRoute>
                      <Map />
                    </PrivateRoute>
                  }
                />
                <Route
                  path={ROUTES.TEST_AUDIO}
                  element={
                    <PrivateRoute>
                      <Test />
                    </PrivateRoute>
                  }
                />
                <Route
                  path={ROUTES.CAR_VIEW}
                  element={
                    <PrivateRoute>
                      <CarView />
                    </PrivateRoute>
                  }
                />
                <Route
                  path={ROUTES.SETTINGS}
                  element={
                    <PrivateRoute>
                      <UserSettings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path={ROUTES.EDIT_PROFILE}
                  element={
                    <PrivateRoute>
                      <EditProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path={ROUTES.CHANGE_PASSWORD}
                  element={
                    <PrivateRoute>
                      <ChangePassword />
                    </PrivateRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </DetectionProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
