import { useState, useEffect } from "react";
import api from "../../services/api";
import MavzuTest from "../../components/MavzuTest";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const MavzulashtirilganTest = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedLanguage } = useLanguage(); // Get the selected language from context
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories/");
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // Token is invalid or expired, redirect to login
          navigate("/login");
        } else {
          setError("Kategoriyalarni yuklashda xato yuz berdi");
          setLoading(false);
        }
        console.error("API xatosi:", err);
      }
    };

    fetchCategories();
  }, [navigate]);

  const getTitleByLanguage = (category) => {
    switch (selectedLanguage) {
      case "RU":
        return category.typeLanRu;
      case "KK":
        return category.typeLanKarakalpak;
      case "УЗ":
        return category.typeLanKrill;
      default:
        return category.type; // Fallback to default type alllllllllllllllllllloooooo
    }
  };

  // Translate the header based on the selected language
  const getHeaderText = () => {
    switch (selectedLanguage) {
      case "RU":
        return "ТЕСТЫ ПО ТЕМАМ";
      case "UZ":
        return "MAVZULASHTIRILGAN TESTLAR";
      case "KK":
        return "ТАҚЫРЫПТЫҚ ТЕСТТЕР";
      case "УЗ":
        return "МАВЗУЛАШТИРИЛГАН ТЕСТЛАР";
      default:
        return "MAVZULASHTIRILGAN TESTLAR";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-white text-lg">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundImage: `url('/loginBg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      
      {/* Header */}
      <h1
        className="text-2xl font-bold text-white text-center mb-6"
        style={{
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        {getHeaderText()}
      </h1>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <MavzuTest
            onClick={() =>
              navigate(
                `/user/mavzulashtirilganTestlar/aynanMavzulashtirilganTestlar`
              )
            }
            key={category.id}
            title={getTitleByLanguage(category)}
          />
        ))}
      </div>
    </div>
    
  );
};

export default MavzulashtirilganTest;
