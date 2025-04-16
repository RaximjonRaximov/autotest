import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Helmet } from "react-helmet";
import { Instagram, Send } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRedirect = () => {
    window.location.href = "https://test.premieravtotest.uz/admin/";
  };

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

      const decoded = jwtDecode(response.data.access);
      login({
        access: response.data.access,
        refresh: response.data.refresh,
        user_id: decoded.user_id,
        phone_number: trimmedUsername,
        email: decoded.email || null,
      });

      console.log("Token dekod qilindi:", decoded);
      const role = decoded.role.toLowerCase();
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
    <div>
      <Helmet>
        <title>Premier Avtotest - Foydalanuvchi Bosh Sahifasi</title>
        <meta
          name="description"
          content="Foydalanuvchilar uchun mavzulashtirilgan testlar va imtihon biletlariga kirish."
        />
      </Helmet>
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(loginBg.png)` }}
      >
        <div className="text-center">
          <div className="flex justify-center items-center space-x-4 mb-12">
            <img src="logo.png" alt="Primer Avtotest Logo" className="h-20" />
            <h1
              className="text-4xl font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(to right, white, #4B5563)" }}
            >
              Premier Avtotest
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-white text-lg font-semibold mb-2">
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
              <label htmlFor="password" className="block text-white text-lg font-semibold mb-2">
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
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="flex justify-center space-x-16">
              <button
                type="button"
                onClick={handleRedirect}
                className="w-32 py-2 bg-yellow-500 text-white font-semibold rounded-[0.5rem] hover:bg-yellow-600 transition-colors"
              >
                Admin
              </button>
              <button
                type="submit"
                className="w-32 py-2 bg-green-500 text-white font-semibold rounded-[0.5rem] hover:bg-green-600 transition-colors"
              >
                Kirish
              </button>
            </div>
          </form>
          <div className="mt-8 text-white text-sm">
            <p>Biz bilan 10 kunda prava imtixonlaridan muvaffaqiyatli oʻting</p>
            <div className="flex flex-col items-center space-y-2 mt-2">
              <a
                href="tel:+998904131100"
                className="text-lg font-semibold text-yellow-300 hover:text-yellow-400 transition-colors"
              >
                +998 (90) 413 11 00
              </a>
              <div className="flex space-x-6">
                <a href="https://t.me/premieravtotest" target="_blank" rel="noopener noreferrer">
                  <Send className="w-6 h-6 text-white hover:text-blue-400 transition-colors cursor-pointer" />
                </a>
                <a
                  href="https://www.instagram.com/premieravtotest.uz/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="w-6 h-6 text-white hover:text-pink-400 transition-colors cursor-pointer" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;