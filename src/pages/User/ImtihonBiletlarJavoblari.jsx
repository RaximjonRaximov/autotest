import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { cartActions } from "../../store";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const ImtihonBiletlarJavoblari = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { selectedLanguage } = useLanguage();
  const userId = user ? user.user_id : null;

  // Debug the selectedLanguage value
  console.log(
    "Selected Language in ImtihonBiletlarJavoblari:",
    selectedLanguage
  );

  // Define translations for static text
  const titleText = {
    UZ: "Imtihon biletlari javoblari",
    УЗ: "Имтиҳон билетлари жавоблари",
    KK: "Imtixan biletları jawapları",
    RU: "Ответы на экзаменационные билеты",
  };

  const loadingText = {
    UZ: "Yuklanmoqda...",
    УЗ: "Юкланмоқда...",
    KK: "Júkleniwde...",
    RU: "Загрузка...",
  };

  const errorMessages = {
    userNotFound: {
      UZ: "Foydalanuvchi topilmadi. Iltimos, tizimga kiring.",
      УЗ: "Фойдаланувчи топилмади. Илтимос, тизимга киринг.",
      KK: "Paydalanıwshı tabılmadı. Ótinish, sistemaǵa kiriń.",
      RU: "Пользователь не найден. Пожалуйста, войдите в систему.",
    },
    unknownError: {
      UZ: "Noma'lum xato yuz berdi",
      УЗ: "Номаълум хато юз берди",
      KK: "Belgisiz qate payda boldı",
      RU: "Произошла неизвестная ошибка",
    },
  };

  const handleBilet = (id) => {
    navigate("/user/bilet-answers", { state: { tableId: id } });
    dispatch(cartActions.setCurrentBiletId(id));
  };

  const handleGoBack = () => {
    navigate(-1); // Navigates back one step in the browser history
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError(
          errorMessages.userNotFound[selectedLanguage] ||
            errorMessages.userNotFound.UZ
        );
        setLoading(false);
        return;
      }

      try {
        const tablesResponse = await api.get("/tables/");
        const sortedTables = Array.isArray(tablesResponse.data.tables)
          ? tablesResponse.data.tables.sort((a, b) => a.id - b.id)
          : [];

        setTables(sortedTables);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            errorMessages.unknownError[selectedLanguage] ||
            errorMessages.unknownError.UZ
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, selectedLanguage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-base sm:text-lg text-gray-600">
          {loadingText[selectedLanguage] || loadingText.UZ}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-base sm:text-lg text-red-600">
          {selectedLanguage === "UZ"
            ? "Xato"
            : selectedLanguage === "УЗ"
            ? "Хато"
            : selectedLanguage === "KK"
            ? "Qate"
            : "Ошибка"}
          : {error}
        </p>
      </div>
    );
  }

  // Function to get the table name based on the selected language
  const getTableName = (table) => {
    // Assuming the API returns table names in multiple languages
    // Adjust these field names based on your actual API response
    return selectedLanguage === "UZ"
      ? table.name || table.name
      : selectedLanguage === "УЗ"
      ? table.nameLanKrill || table.name
      : selectedLanguage === "KK"
      ? table.nameLanKarakalpak || table.name
      : table.nameLanRu || table.name;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-4 sm:py-8">
      <div className="w-full sm:max-w-4xl px-4 sm:px-0 flex items-center justify-between mb-4 sm:mb-8">
        <button onClick={handleGoBack}>
          <img
            src="/public/back.png"
            alt=""
            className="w-7 h-7"
          />
        </button>
        <h1 className="text-xl sm:text-3xl font-bold text-gray-800 text-center flex-1">
          {titleText[selectedLanguage] || titleText.UZ}
        </h1>
        {/* Empty div to balance the flex layout */}
        <div className="w-[50px] sm:w-[60px]"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 w-full sm:max-w-4xl px-4 sm:px-0">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => handleBilet(table.id)}
            className="py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition duration-300 hover:opacity-90 bg-gradient-to-b from-[#B4DFEF] to-[#38BEEF] text-black font-semibold text-sm sm:text-base"
          >
            <span>{getTableName(table)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImtihonBiletlarJavoblari;
