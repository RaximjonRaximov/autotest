import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminReports from "./pages/Admin/AdminReports";
import UserLayout from "./layouts/UserLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import SuperAdminUsers from "./pages/SuperAdmin/SuperAdminUsers";
import SuperAdminLogs from "./pages/SuperAdmin/SuperAdminLogs";
import SuperAdminAnalytics from "./pages/SuperAdmin/SuperAdminAnalytics";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MavzulashtirilganTest from "./pages/User/MavzulashtirilganTest";
import UserMain from "./pages/User/UserMain";
import { LanguageProvider } from "./context/LanguageContext";
import AynanMavzulashtirilganTestlar from "./pages/User/AynanMavzulashtirilganTestlar";
import Imtihon2050 from "./pages/User/Imtihon2050";
import Imtihon2050natija from "./pages/User/Imtihon2050natija";
import BlockTest from "./pages/User/BlockTest";
import ImtihonBiletlar from "./pages/User/ImtihonBiletlar";
import BiletTest from "./pages/User/BiletTest";
import ImtihonBiletlarJavoblari from "./pages/User/ImtihonBiletlarJavoblari";
import BiletAnswers from "./pages/User/BiletAnswers";

// Asosiy sahifa komponenti
const Home = () => {
  const { getRole } = useAuth();
  const role = getRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (role) {
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "user" || role.toLowerCase() === "online") {
        navigate("/user");
      } else if (role === "superadmin") {
        navigate("/superadmin");
      }
    }
  }, [role, navigate]);

  if (!role) {
    return <Navigate to="/login" />;
  }

  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="reports" element={<AdminReports />} />
              <Route index element={<AdminDashboard />} />
            </Route>

            {/* User Routes (for both user and online roles) */}
            <Route
              path="/user"
              element={
                <ProtectedRoute allowedRoles={["user", "online"]}>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path="mavzulashtirilganTestlar"
                element={<MavzulashtirilganTest />}
              />
              <Route
                path="mavzulashtirilganTestlar/aynanMavzulashtirilganTestlar"
                element={<AynanMavzulashtirilganTestlar />}
              />
              <Route path="imtihon2050" element={<Imtihon2050 />} />
              <Route
                path="imtihon2050natija"
                element={<Imtihon2050natija />}
              />
              <Route path="blocktest" element={<BlockTest />} />
              <Route path="imtihon-biletlar" element={<ImtihonBiletlar />} />
              <Route path="imtihon-biletlar-javoblar" element={<ImtihonBiletlarJavoblari />} />
              <Route path="bilet-answers" element={<BiletAnswers />} />
              <Route path="bilet-test" element={<BiletTest />} />
              <Route index element={<UserMain />} />
            </Route>

            {/* SuperAdmin Routes */}
            <Route
              path="/superadmin"
              element={
                <ProtectedRoute allowedRoles={["superadmin"]}>
                  <SuperAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="users" element={<SuperAdminUsers />} />
              <Route path="logs" element={<SuperAdminLogs />} />
              <Route path="analytics" element={<SuperAdminAnalytics />} />
              <Route index element={<SuperAdminUsers />} />
            </Route>

            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;