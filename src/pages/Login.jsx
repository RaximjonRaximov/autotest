import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      console.log("Yuborilayotgan ma'lumotlar:", {
        username: trimmedUsername,
        password: trimmedPassword,
      });
      const response = await api.post("/token/", {
        phone_number: trimmedUsername,
        password: trimmedPassword,
      });
      console.log("Backend javobi:", response.data);

      login({
        access: response.data.access,
        refresh: response.data.refresh,
      });

      const decoded = jwtDecode(response.data.access);
      console.log("Token dekod qilindi:", decoded);

      const role = decoded.role;
      console.log("Navigating with role:", role);
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "user") {
        navigate("/user");
      } else if (role === "superadmin") {
        navigate("/superadmin/users");
      } else if (role === "online") {
        navigate("/user");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Login yoki parol xato!");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(loginBg.png)` }}
    >
      <div className="text-center">
        {/* Logo and Text */}
        <div className="flex justify-center items-center space-x-4 mb-12">
          <img src="logo.png" alt="Primer Avtotest Logo" className="h-20" />
          <h1
            className="text-4xl font-extrabold bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(to right, white, #4B5563)",
            }}
          >
            Primer Avtotest
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-white text-lg font-semibold mb-2"
            >
              Login
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder=""
              className="w-80 p-3 bg-white text-gray-700 border border-gray-300 rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-white text-lg font-semibold mb-2"
            >
              Parol
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              className="w-80 p-3 bg-white text-gray-700 border border-gray-300 rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <div className="flex justify-center space-x-16">
            <button
              type="button"
              onClick={() => {
                setUsername("");
                setPassword("");
                setError(null);
              }}
              className="w-32 py-2 bg-yellow-500 text-white font-semibold rounded-[0.5rem] hover:bg-yellow-600 transition-colors"
            >
              Chiqish
            </button>
            <button
              type="submit"
              className="w-32 py-2 bg-green-500 text-white font-semibold rounded-[0.5rem] hover:bg-green-600 transition-colors"
            >
              Kirish
            </button>
          </div>
        </form>

        {/* Footer Text */}
        <div className="mt-8 text-white text-sm">
          <p>
            TIZIMDAN FOYDALANISH UCHUN <span className=" font-bold">"PRIMER AVTOTEST"</span>  O'QUV <br /> MARKAZIDA O'TGAN BO'LISHINGIZ KERAK!
          </p>
          <p className="mt-2">+998(93) 333 33 33</p>
        </div>
      </div>
    </div>
  );
};

export default Login;