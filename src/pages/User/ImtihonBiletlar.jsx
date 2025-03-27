import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { cartActions } from "../../store";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const ImtihonBiletlar = () => {
  const [tables, setTables] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { selectedLanguage } = useLanguage();
  const userId = user ? user.user_id : null;

  console.log("Selected Language in ImtihonBiletlar:", selectedLanguage);

  const titleText = {
    UZ: "Imtihon biletlari",
    УЗ: "Имтиҳон билетлари",
    KK: "Imtixan biletları",
    RU: "Экзаменационные билеты",
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
    dispatch(cartActions.setCurrentBiletId(id));
    navigate("/user/bilet-test", { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!userId) {
        if (isMounted) {
          setError(
            errorMessages.userNotFound[selectedLanguage] ||
              errorMessages.userNotFound.UZ
          );
          setLoading(false);
        }
        return;
      }

      try {
        const tablesResponse = await api.get("/tables/");//1
        const sortedTables = Array.isArray(tablesResponse.data.tables)
          ? tablesResponse.data.tables.sort((a, b) => a.id - b.id)
          : [];

        const resultsResponse = await api.get(`/user-correct/${userId}/`).catch((err) => {//2
          if (err.response?.status === 404) return { data: [] }; // Handle 404 gracefully
          throw err;
        });
        const results = Array.isArray(resultsResponse.data) ? resultsResponse.data : [];
        console.log("User Correct Response:", resultsResponse.data); // Debug

        if (isMounted) {
          setUserResults(results);
          const tablesWithResults = sortedTables.map((table) => {
            const result = results.find((r) => r.table === table.id);
            return {
              ...table,
              correct: result ? result.correct : 0,
              incorrect: result ? result.incorrect : 0,
            };
          });
          setTables(tablesWithResults);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              errorMessages.unknownError[selectedLanguage] ||
              errorMessages.unknownError.UZ
          );
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
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
            : "Ошибка"}: {error}
        </p>
      </div>
    );
  }

  const getTableName = (table) => {
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
          <img src="/public/back.png" alt="" className="w-7 h-7" />
        </button>
        <h1 className="text-xl sm:text-3xl font-bold text-gray-800 text-center flex-1">
          {titleText[selectedLanguage] || titleText.UZ}
        </h1>
        <div className="w-[50px] sm:w-[60px]"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 w-full sm:max-w-4xl px-4 sm:px-0">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => handleBilet(table.id)}
            disabled={loading}
            className="flex flex-col items-center justify-center py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition duration-300 hover:opacity-90 bg-gradient-to-b from-[#B4DFEF] to-[#38BEEF] text-black font-semibold text-sm sm:text-base disabled:opacity-50"
          >
            <span>{getTableName(table)}</span>
            {table.correct !== 0 || table.incorrect !== 0 ? (
              <div className="flex space-x-2 sm:space-x-5 mt-1 sm:mt-0">
                <div className="flex items-center space-x-1">
                  <span className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full inline-block"></span>
                  <span>{table.correct}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full inline-block"></span>
                  <span>{table.incorrect}</span>
                </div>
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImtihonBiletlar;