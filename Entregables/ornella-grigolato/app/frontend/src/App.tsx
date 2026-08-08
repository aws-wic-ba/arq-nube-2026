import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./views/landing";
import LoginPage from "./views/login";
import DashboardPage from "./views/dashboard";
import RefugioPage from "./views/refugio";
import RequireAuth from "./components/RequireAuth";
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID, // Tu Pool ID
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID, // Tu App Client ID
    },
  },
});

function App() {
  return (
    <Router>
      <Routes>
        {/* Sitio Comercial */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Panel de Administración (Privado) */}
        <Route
          path="/dashboard/*"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />

        {/* Portal Público */}
        <Route path="/refugio/:slug" element={<RefugioPage />} />
      </Routes>
    </Router>
  );
}

export default App;
