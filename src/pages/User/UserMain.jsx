import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { cartActions } from '../../store';
import api from '../../services/api';

const UserMain = () => {
  const { selectedLanguage } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxState = useSelector((state) => state.cart); // Access Redux state for logging
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const buttonRef = useRef(null);
  const modalRef = useRef(null);

  const getHeaderText = () => {
    switch (selectedLanguage) {
      default:
        return 'Primer Avtotest';
    }
  };

  const getButtonText = (key) => {
    const translations = {
      mavzulashtirilganTestlar: {
        RU: 'Тематические тесты',
        UZ: 'Mavzulashitirilgan testlar',
        KK: 'Тақырыптық тестер',
        KPJ: 'Тақырыптық тестер', // Fixed "УЗ" to "KPJ"
      },
      imtihonBiletlar: {
        RU: 'Экзаменационные билеты',
        UZ: 'Imtihon Biletlar',
        KK: 'Емтихан билеттері',
        KPJ: 'Емтихан билеттері', // Fixed "УЗ" to "KPJ"
      },
      imtihon2050: {
        RU: 'Экзамен (20, 50)',
        UZ: 'Imtihon(20,50)',
        KK: 'Емтихан (20, 50)',
        KPJ: 'Емтихан (20, 50)', // Fixed "УЗ" to "KPJ"
      },
      blokTest: {
        RU: 'Блочный тест',
        UZ: 'Blok test',
        KK: 'Блоктық тест',
        KPJ: 'Блоктық тест', // Fixed "УЗ" to "KPJ"
      },
    };

    return translations[key][selectedLanguage] || translations[key]['UZ'];
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchQuestions = async (count) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[API Request] Fetching questions for count: ${count}`);
      console.log(`[API Request] URL: ${api.defaults.baseURL}/random-questions/${count}/`);
      console.log(`[API Request] Headers:`, {
        Authorization: api.defaults.headers.Authorization || 'No token',
      });

      const response = await api.get(`/random-questions/${count}/`);
      console.log('[API Response] Success:', response.data);

      const testIds = response.data.question_ids;
      if (!Array.isArray(testIds)) {
        throw new Error('API response does not contain a valid question_ids array');
      }

      console.log('[Redux] Before dispatch - Current state:', reduxState);
      dispatch(cartActions.addTest(testIds));
      console.log('[Redux] After dispatch - New state:', { test: testIds });

      navigate('/user/imtihon2050');
    } catch (err) {
      console.error('[API Error]:', err);
      if (err.response) {
        console.error('[API Error] Response:', err.response.data);
        console.error('[API Error] Status:', err.response.status);
        if (err.response.status === 401) {
          console.log('[API Error] Unauthorized - Redirecting to /login');
          navigate('/login');
        }
      }
      setError('Savollarni yuklashda xato yuz berdi');
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  const handleImtihonSelect = (type) => {
    fetchQuestions(type);
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(/userLayoutBg.jpg)` }}
    >
      <div className="flex flex-col items-center pt-8">
        <div className="flex items-center mb-8">
          <img src="/logo.png" alt="Primer Avtotest Logo" className="h-34" />
          <h1
            className="text-4xl font-extrabold bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(to right, black, #666666)",
            }}
          >
            {getHeaderText()}
          </h1>
        </div>
        {error && (
          <div className="text-red-500 text-center mb-4">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-6 max-w-2xl w-full px-4">
          <Link
            to="/user/mavzulashtirilganTestlar"
            className="bg-gray-800 text-white text-center py-10 text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
          >
            {getButtonText('mavzulashtirilganTestlar')}
          </Link>
          <Link
            to="/user/imtihon-biletlar"
            className="bg-gray-800 text-white text-center py-10 text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
          >
            {getButtonText('imtihonBiletlar')}
          </Link>
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={openModal}
              className="bg-gray-800 text-white text-center py-10 text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors w-full"
              disabled={loading}
            >
              {loading ? 'Yuklanmoqda...' : getButtonText('imtihon2050')}
            </button>
            {isModalOpen && (
              <div
                ref={modalRef}
                className="absolute top-[0rem] left-1/2 transform -translate-x-1/2 w-78 rounded-lg shadow-lg py-[3rem] px-[6rem] z-10"
                style={{
                  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(50, 50, 50, 0.8) 100%)',
                }}
              >
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 text-white hover:text-gray-300 text-xl"
                >
                  ✕
                </button>
                <div className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => handleImtihonSelect('20')}
                    className="bg-white text-black px-6 py-1 rounded-lg hover:bg-gray-200 transition-colors w-full mb-[1.5rem]"
                    disabled={loading}
                  >
                    20
                  </button>
                  <button
                    onClick={() => handleImtihonSelect('50')}
                    className="bg-white text-black px-6 py-1 rounded-lg hover:bg-gray-200 transition-colors w-full"
                    disabled={loading}
                  >
                    50
                  </button>
                </div>
              </div>
            )}
          </div>
          <Link
            to="/user/blok-test"
            className="bg-gray-800 text-white text-center py-10 text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
          >
            {getButtonText('blokTest')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserMain;