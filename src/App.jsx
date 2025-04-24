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
import { AudioProvider } from "./context/AudioContext";
import { ROUTES } from "./config/routes";

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
import Landing from "./components/Landing";

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

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (user) {
    return <Navigate to={ROUTES.MAP} />;
  }

  return children;
};

const ProtectedProviders = ({ children }) => {
  return (
    <LocationProvider>
      <DetectionProvider>
        <AudioProvider>{children}</AudioProvider>
      </DetectionProvider>
    </LocationProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path={ROUTES.LANDING}
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            }
          />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.RECOVER_PASSWORD} element={<RecoverPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

          {/* Rutas privadas */}
          <Route element={<Layout />}>
            <Route
              path={ROUTES.MAP}
              element={
                <PrivateRoute>
                  <ProtectedProviders>
                    <Map />
                  </ProtectedProviders>
                </PrivateRoute>
              }
            />
            <Route
              path={ROUTES.CAR_VIEW}
              element={
                <PrivateRoute>
                  <ProtectedProviders>
                    <CarView />
                  </ProtectedProviders>
                </PrivateRoute>
              }
            />
            <Route
              path={ROUTES.SETTINGS}
              element={
                <PrivateRoute>
                  <ProtectedProviders>
                    <UserSettings />
                  </ProtectedProviders>
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
    </AuthProvider>
  );
}

export default App;
