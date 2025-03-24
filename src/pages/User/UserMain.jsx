import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx'; // Fixed import

const UserMain = () => {
  const { selectedLanguage } = useLanguage();

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
        KPJ: 'Тақырыптық тестер',
      },
      imtihonBiletlar: {
        RU: 'Экзаменационные билеты',
        UZ: 'Imtihon Biletlar',
        KK: 'Емтихан билеттері',
        KPJ: 'Емтихан билеттері',
      },
      imtihon2050: {
        RU: 'Экзамен (20, 50)',
        UZ: 'Imtihon(20,50)',
        KK: 'Емтихан (20, 50)',
        KPJ: 'Емтихан (20, 50)',
      },
      blokTest: {
        RU: 'Блочный тест',
        UZ: 'Blok test',
        KK: 'Блоктық тест',
        KPJ: 'Блоктық тест',
      },
    };

    return translations[key][selectedLanguage] || translations[key]['UZ'];
  };

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
          <Link
            to="/user/imtihon-20-50"
            className="bg-gray-800 text-white text-center py-10 text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
          >
            {getButtonText('imtihon2050')}
          </Link>
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