import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-gray-700 rounded"
                : "block p-2 hover:bg-gray-700 rounded"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-gray-700 rounded"
                : "block p-2 hover:bg-gray-700 rounded"
            }
          >
            Settings
          </NavLink>
          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-gray-700 rounded"
                : "block p-2 hover:bg-gray-700 rounded"
            }
          >
            Reports
          </NavLink>
          <button
            onClick={handleLogout}
            className="block p-2 mt-4 w-full text-left bg-red-600 hover:bg-red-700 rounded"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;