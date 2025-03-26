import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import { cartActions } from "../../store";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext.jsx";

const UserMain = () => {
  const { selectedLanguage } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxState = useSelector((state) => state.cart);
  const { user, getRole } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [imtihonLoading, setImtihonLoading] = useState(false);
  const [blockTestLoading, setBlockTestLoading] = useState(false);
  const [error, setError] = useState(null);
  const buttonRef = useRef(null);
  const buttonRef2 = useRef(null);
  const modalRef = useRef(null);
  const modalRef2 = useRef(null);

  const role = user ? user.role : getRole();

  const getHeaderText = () => {
    switch (selectedLanguage) {
      default:
        return "Premier Avtotest";
    }
  };

  const getButtonText = (key) => {
    const translations = {
      mavzulashtirilganTestlar: {
        RU: "Тематические тесты",
        UZ: "Mavzulashitirilgan testlar",
        KK: "Тақырыптық тестер",
        УЗ: "Тақырыптық тестер",
      },
      imtihonBiletlar: {
        RU: "Экзаменационные билеты",
        UZ: "Imtihon Biletlar",
        KK: "Емтихан билеттері",
        УЗ: "Емтихан билеттері",
      },
      imtihon2050: {
        RU: "Экзамен (20, 50)",
        UZ: "Imtihon(20,50)",
        KK: "Емтихан (20, 50)",
        УЗ: "Емтихан (20, 50)",
      },
      blokTest: {
        RU: "Блочный тест",
        UZ: "Blok test",
        KK: "Блоктық тест",
        УЗ: "Блоктық тест",
      },
    };
    return translations[key][selectedLanguage] || translations[key]["UZ"];
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openModal2 = () => setIsModalOpen2(true);
  const closeModal2 = () => setIsModalOpen2(false);

  const fetchQuestions = async (count, redirectPath, setLoading) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/random-questions/${count}/`);
      const testIds = response.data.question_ids;
      if (!Array.isArray(testIds)) {
        throw new Error("API response does not contain a valid question_ids array");
      }
      dispatch(cartActions.addTest(testIds));
      navigate(redirectPath);
    } catch (err) {
      setError("Savollarni yuklashda xato yuz berdi");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  const handleImtihonSelect = (type) => {
    fetchQuestions(type, "/user/imtihon2050", setImtihonLoading);
  };

  const handleBlockTestSelect = () => {
    fetchQuestions("20", "/user/blocktest", setBlockTestLoading);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeModal();
      }
      if (
        isModalOpen2 &&
        modalRef2.current &&
        !modalRef2.current.contains(event.target) &&
        buttonRef2.current &&
        !buttonRef2.current.contains(event.target)
      ) {
        closeModal2();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen, isModalOpen2]);

  if (user === null && role === null) {
    navigate("/login");
    return null;
  }

  if (user === null) {
    return (
      <div className="p-4 sm:p-6 text-white">
        {selectedLanguage === "UZ"
          ? "Yuklanmoqda..."
          : selectedLanguage === "KK"
          ? "Jükteleu..."
          : selectedLanguage === "УЗ"
          ? "Юкланмоқда..."
          : "Загрузка..."}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(/userLayoutBg.jpg)` }}
    >
      <div className="flex flex-col items-center pt-4 sm:pt-8">
        <div className="flex items-center mb-4 sm:mb-8">
          <img
            src="/logo.png"
            alt="Primer Avtotest Logo"
            className="h-20 sm:h-34"
          />
          <h1
            className="text-2xl sm:text-4xl font-extrabold bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(to right, black, #666666)",
            }}
          >
            {getHeaderText()}
          </h1>
        </div>
        {error && (
          <div className="text-red-500 text-center mb-2 sm:mb-4">{error}</div>
        )}
        <div
          className={`grid ${
            role === "online" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
          } gap-4 sm:gap-6 max-w-full sm:max-w-2xl w-full px-4`}
        >
          {role === "online" ? (
            <div className="relative">
              <button
                ref={buttonRef2}
                onClick={openModal2}
                className="bg-gray-800 text-white text-center py-6 sm:py-10 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors w-full"
              >
                {getButtonText("imtihonBiletlar")}
              </button>
              {isModalOpen2 && (
                <div
                  ref={modalRef2}
                  className="absolute top-0 left-0 w-full rounded-lg shadow-lg py-6 sm:py-[3rem] px-4 sm:px-6 z-10"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(50, 50, 50, 0.8) 100%)",
                  }}
                >
                  <button
                    onClick={closeModal2}
                    className="absolute top-1 sm:top-2 right-1 sm:right-2 text-white hover:text-gray-300 text-lg sm:text-xl"
                  >
                    ✕
                  </button>
                  <div className="flex flex-col items-center space-y-2">
                    <Link
                      to="/user/imtihon-biletlar"
                      className="bg-white text-black px-4 sm:px-6 py-1 rounded-lg hover:bg-gray-200 transition-colors w-full mb-2 sm:mb-[1.5rem]"
                    >
                      {selectedLanguage === "UZ"
                        ? "Test"
                        : selectedLanguage === "KK"
                        ? "Test"
                        : selectedLanguage === "УЗ"
                        ? "Тест"
                        : "Тест"}
                    </Link>
                    <Link
                      to="/user/imtihon-biletlar-javoblar"
                      className="bg-white text-black px-4 sm:px-6 py-1 rounded-lg hover:bg-gray-200 transition-colors w-full"
                    >
                      {selectedLanguage === "UZ"
                        ? "Test javoblari"
                        : selectedLanguage === "KK"
                        ? "Test jawapları"
                        : selectedLanguage === "УЗ"
                        ? "Тест жавоблари"
                        : "Ответы теста"}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/user/mavzulashtirilganTestlar"
                className="bg-gray-800 text-white text-center py-6 sm:py-10 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
              >
                {getButtonText("mavzulashtirilganTestlar")}
              </Link>
              <div className="relative">
                <button
                  ref={buttonRef2}
                  onClick={openModal2}
                  className="bg-gray-800 text-white text-center py-6 sm:py-10 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors w-full"
                >
                  {getButtonText("imtihonBiletlar")}
                </button>
                {isModalOpen2 && (
                  <div
                    ref={modalRef2}
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full sm:w-78 rounded-lg shadow-lg py-6 sm:py-[3rem] px-4 sm:px-[6rem] z-10"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(50, 50, 50, 0.8) 100%)",
                    }}
                  >
                    <button
                      onClick={closeModal2}
                      className="absolute top-1 sm:top-2 right-1 sm:right-2 text-white hover:text-gray-300 text-lg sm:text-xl"
                    >
                      ✕
                    </button>
                    <div className="flex flex-col items-center space-y-2">
                      <Link
                        to="/user/imtihon-biletlar"
                        className="bg-white text-black px-4 sm:px-6 py-1 rounded-lg hover:bg-gray-200 transition-colors w-full mb-2 sm:mb-[1.5rem]"
                      >
                        {selectedLanguage === "UZ"
                          ? "Test"
                          : selectedLanguage === "KK"
                          ? "Test"
                          : selectedLanguage === "УЗ"
                          ? "Тест"
                          : "Тест"}
                      </Link>
                      <Link
                        to="/user/imtihon-biletlar-javoblar"
                        className="bg-white text-black px-4 sm:px-6 py-1 rounded-lg hover:bg-gray-200 transition-colors w-full"
                      >
                        {selectedLanguage === "UZ"
                          ? "Test javoblari"
                          : selectedLanguage === "KK"
                          ? "Test jawapları"
                          : selectedLanguage === "УЗ"
                          ? "Тест жавоблари"
                          : "Ответы теста"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={openModal}
                  className="bg-gray-800 text-white text-center py-6 sm:py-10 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors w-full"
                  disabled={imtihonLoading}
                >
                  {imtihonLoading
                    ? selectedLanguage === "UZ"
                      ? "Yuklanmoqda..."
                      : selectedLanguage === "KK"
                      ? "Jükteleu..."
                      : selectedLanguage === "УЗ"
                      ? "Юкланмоқда..."
                      : "Загрузка..."
                    : getButtonText("imtihon2050")}
                </button>
                {isModalOpen && (
                  <div
                    ref={modalRef}
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full sm:w-78 rounded-lg shadow-lg py-6 sm:py-[3rem] px-4 sm:px-[6rem] z-10I"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(50, 50, 50, 0.8) 100%)",
                    }}
                  >
                    <button
                      onClick={closeModal}
                      className="absolute top-1 sm:top-2 right-1 sm:right-2 text-white hover:text-gray-300 text-lg sm:text-xl"
                    >
                      ✕
                    </button>
                    <div className="flex flex-col items-center space-y-2">
                      <button
                        onClick={() => handleImtihonSelect("20")}
                        className="bg-white text-black px-4 sm:px-6 py-1 rounded-lg hover:bg-gray-200 transition-colors w-full mb-2 sm:mb-[1.5rem]"
                        disabled={imtihonLoading}
                      >
                        20
                      </button>
                      <button
                        onClick={() => handleImtihonSelect("50")}
                        className="bg-white text-black px-4 sm:px-6 py-1 rounded-lg hover:bg-gray-200 transition-colors w-full"
                        disabled={imtihonLoading}
                      >
                        50
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleBlockTestSelect}
                className="bg-gray-800 text-white text-center py-6 sm:py-10 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors w-full"
                disabled={blockTestLoading}
              >
                {blockTestLoading
                  ? selectedLanguage === "UZ"
                    ? "Yuklanmoqda..."
                    : selectedLanguage === "KK"
                    ? "Jükteleu..."
                    : selectedLanguage === "УЗ"
                    ? "Юкланмоқда..."
                    : "Загрузка..."
                  : getButtonText("blokTest")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMain;