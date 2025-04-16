import { useState, useEffect } from "react";
import api from "../../services/api";
import MavzuTest from "../../components/MavzuTest";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useDispatch } from "react-redux";
import { cartActions } from "../../store";

const MavzulashtirilganTest = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedLanguage } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = (id) => {
    dispatch(cartActions.setCategoryId(id));
    navigate(`/user/mavzulashtirilganTestlar/aynanMavzulashtirilganTestlar`);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories/");
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
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
        return category.type;
    }
  };

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

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundImage: `url('/loginBg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex justify-start mb-2">
        <button onClick={handleGoBack} >
          <img
            src="/back.png"
            alt="Go Back"
            className="w-5 h-5 sm:w-8 sm:h-8 invert cursor-pointer"
          />
        </button>
      </div>
      <h1
        className="flex items-center justify-center text-2xl font-bold text-white text-center mb-6"
        style={{
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        {getHeaderText()}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <MavzuTest
            onClick={() => handleClick(category.id)}
            key={category.id}
            title={getTitleByLanguage(category)}
          />
        ))}
      </div>
    </div>
  );
};

export default MavzulashtirilganTest;