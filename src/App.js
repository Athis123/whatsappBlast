import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import QRCodePage from "./pages/QRCodePage";
import MessagePage from "./pages/MessagePage";
import KontakPage from "./pages/KontakPage";
import TemplateMessagePage from "./pages/TemplateMessagePage";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { PrivateRoute, PublicRoute } from "./components/RouteGuards";
import { WhatsAppProvider } from "./contexts/WhatsAppContext";
import Layout from "./layouts/Layout";

const App = () => {
  return (
    <WhatsAppProvider>
      <Router>
        <Routes>
          {/* Auth Routes(Login & Register) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterForm />
              </PublicRoute>
            }
          />

          {/* Private Routes Wrapped with Layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <QRCodePage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/send-message"
            element={
              <PrivateRoute>
                <Layout>
                  <MessagePage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/kontak"
            element={
              <PrivateRoute>
                <Layout>
                  <KontakPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/template"
            element={
              <PrivateRoute>
                <Layout>
                  <TemplateMessagePage />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </WhatsAppProvider>
  );
};

export default App;
