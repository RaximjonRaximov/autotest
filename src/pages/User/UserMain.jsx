import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { cartActions } from '../../store';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';

const UserMain = () => {
  const { selectedLanguage } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxState = useSelector((state) => state.cart); // Access Redux state for logging
  const { user, getRole } = useAuth(); // Get user and getRole from AuthContext
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imtihonLoading, setImtihonLoading] = useState(false); // Loading state for Imtihon 20/50
  const [blockTestLoading, setBlockTestLoading] = useState(false); // Loading state for Blok Test
  const [error, setError] = useState(null);
  const buttonRef = useRef(null);
  const modalRef = useRef(null);

  // Use user.role if user exists, otherwise fall back to getRole()
  const role = user ? user.role : getRole();

  const getHeaderText = () => {
    switch (selectedLanguage) {
      default:
        return 'Premier Avtotest';
    }
  };

  const getButtonText = (key) => {
    const translations = {
      mavzulashtirilganTestlar: {
        RU: 'Тематические тесты',
        UZ: 'Mavzulashitirilgan testlar',
        KK: 'Тақырыптық тестер',
        УЗ: 'Тақырыптық тестер',
      },
      imtihonBiletlar: {
        RU: 'Экзаменационные билеты',
        UZ: 'Imtihon Biletlar',
        KK: 'Емтихан билеттері',
        УЗ: 'Емтихан билеттері',
      },
      imtihon2050: {
        RU: 'Экзамен (20, 50)',
        UZ: 'Imtihon(20,50)',
        KK: 'Емтихан (20, 50)',
        УЗ: 'Емтихан (20, 50)',
      },
      blokTest: {
        RU: 'Блочный тест',
        UZ: 'Blok test',
        KK: 'Блоктық тест',
        УЗ: 'Блоктық тест',
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

  const fetchQuestions = async (count, redirectPath, setLoading) => {
    setLoading(true); // Set the specific loading state
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

      navigate(redirectPath);
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
      setLoading(false); // Reset the specific loading state
      closeModal();
    }
  };

  const handleImtihonSelect = (type) => {
    fetchQuestions(type, '/user/imtihon2050', setImtihonLoading);
  };

  const handleBlockTestSelect = () => {
    fetchQuestions('20', '/user/blocktest', setBlockTestLoading); // Use blockTestLoading
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

  // If user is null and role is null (e.g., user is not authenticated), redirect to login
  if (user === null && role === null) {
    navigate('/login');
    return null;
  }

  // If user is still being fetched (initial load), show a loading state
  if (user === null) {
    return <div className="p-6 text-white">Yuklanmoqda...</div>;
  }

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
        <div className={`grid ${role === 'online' ? 'grid-cols-1' : 'grid-cols-2'} gap-6 max-w-2xl w-full px-4`}>
          {role === 'online' ? (
            // Only show Imtihon Biletlar for 'online' role
            <Link
              to="/user/imtihon-biletlar"
              className="bg-gray-800 text-white text-center py-10 text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
            >
              {getButtonText('imtihonBiletlar')}
            </Link>
          ) : (
            // Show all buttons for other roles
            <>
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
                  disabled={imtihonLoading}
                >
                  {imtihonLoading ? 'Yuklanmoqda...' : getButtonText('imtihon2050')}
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
                        disabled={imtihonLoading}
                      >
                        20
                      </button>
                      <button
                        onClick={() => handleImtihonSelect('50')}
                        className="bg-white text-black px-6 py-1 rounded-lg hover:bg-gray-200 transition-colors w-full"
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
                className="bg-gray-800 text-white text-center py-10 text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors w-full"
                disabled={blockTestLoading}
              >
                {blockTestLoading ? 'Yuklanmoqda...' : getButtonText('blokTest')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMain;