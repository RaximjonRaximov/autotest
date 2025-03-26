import { Undo2 } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { selectedLanguage, setSelectedLanguage } = useLanguage();

  const languages = [
    { code: "RU", flag: "/ru.png", label: "RU" },
    { code: "UZ", flag: "/uz.png", label: "UZ" },
    { code: "KK", flag: "/kk.png", label: "KK" },
    { code: "УЗ", flag: "/kpj.png", label: "УЗ" },
  ];

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    setIsDropdownOpen(false);
    console.log(`Language changed to: ${lang}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-4 sm:px-16 flex justify-between items-center sticky top-0 z-20">
      <div className="flex items-center w-full sm:w-auto space-x-2 sm:space-x-4">
        <img src="/logo.png" alt="Primer Avtotest" className="h-14 sm:h-16" />
        <h1
          className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(to right, black, #808080)" }}
        >
          Premier Avtotest
        </h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="relative">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center border border-gray-400 rounded px-2 py-1 cursor-pointer hover:bg-gray-100"
          >
            <img
              src={languages.find((lang) => lang.code === selectedLanguage)?.flag}
              alt={`${selectedLanguage} Flag`}
              className="h-5 w-5 mr-1"
            />
            <span className="text-sm font-medium mr-4.5 sm:mr-1">{selectedLanguage}</span>
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-24 bg-white rounded shadow-lg z-10">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.label)}
                  className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  <img
                    src={lang.flag}
                    alt={`${lang.label} Flag`}
                    className="h-5 w-5 mr-2"
                  />
                  <span className="text-sm font-medium">{lang.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-800 sm:px-2 px-1 py-1"
        >
          <Undo2 />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
