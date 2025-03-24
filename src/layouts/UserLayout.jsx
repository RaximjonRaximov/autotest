import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const UserLayout = () => {
  const { getRole } = useAuth();
  const role = getRole();


  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;