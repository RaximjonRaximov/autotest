import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SuperAdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-red-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">SuperAdmin Panel</h2>
        <nav className="space-y-2">
          <NavLink
            to="/superadmin/users"
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-red-700 rounded"
                : "block p-2 hover:bg-red-700 rounded"
            }
          >
            Users
          </NavLink>
          <NavLink
            to="/superadmin/logs"
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-red-700 rounded"
                : "block p-2 hover:bg-red-700 rounded"
            }
          >
            Logs
          </NavLink>
          <NavLink
            to="/superadmin/analytics"
            className={({ isActive }) =>
              isActive
                ? "block p-2 bg-red-700 rounded"
                : "block p-2 hover:bg-red-700 rounded"
            }
          >
            Analytics
          </NavLink>
          <button
            onClick={handleLogout}
            className="block p-2 mt-4 w-full text-left bg-gray-600 hover:bg-gray-700 rounded"
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

export default SuperAdminLayout;