import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const Imtihon2050natija = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage();

  const { correct, incorrect, questionIds, answerCorrectness, timeTaken } = state || {};
  const totalQuestions = questionIds?.length || 0;
  const passingThreshold = 0.9;
  const passed = correct >= totalQuestions * passingThreshold;

  const minutes = Math.floor(timeTaken / 60);
  const seconds = (timeTaken % 60).toString().padStart(2, '0');
  const formattedTimeTaken = `${minutes}:${seconds}`;

  const titleText = {
    UZ: "Test javoblari",
    УЗ: "Тест жавоблари",
    KK: "Тест жауаплары",
    RU: "Результаты теста",
  };

  const resultText = {
    UZ: "Test natijasi",
    УЗ: "Тест натижаси",
    KK: "Тест нәтижеси",
    RU: "Результат теста",
  };

  const passMessage = {
    UZ: "Siz testdan muvaffaqiyatli o'tdingiz",
    УЗ: "Сиз тестдан муваффақиятли ўтдингиз",
    KK: "Сиз тесттен сәтті өттіңіз",
    RU: "Вы успешно прошли тест",
  };

  const failMessage = {
    UZ: "Afsuski, siz testdan o'ta olmadingiz",
    УЗ: "Афсуски, сиз тестдан ўта олмадингиз",
    KK: "Өкінішке орай, сіз тесттен өте алмадыңыз",
    RU: "К сожалению, вы не прошли тест",
  };

  const exitButtonText = {
    UZ: "Chiqish",
    УЗ: "Чиқиш",
    KK: "Шығу",
    RU: "Выход",
  };

  const handleExit = () => {
    navigate('/user');
  };

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen bg-[url(/loginBg.png)] bg-cover flex flex-col items-center">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 w-full max-w-full sm:max-w-4xl">
        <div className="flex flex-wrap px-2 py-1 gap-1 sm:gap-2">
          {questionIds?.map((_, index) => {
            const questionId = state.questions[index]?.question?.id;
            const isCorrect = answerCorrectness[questionId];
            const buttonColorClass = isCorrect
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white';

            return (
              <button
                key={index}
                className={`w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center ${buttonColorClass} text-sm sm:text-base`}
                disabled
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-2 sm:mt-0 sm:absolute sm:right-8 sm:top-6 bg-green-700 text-white rounded-full w-16 sm:w-18 h-16 sm:h-17 flex items-center justify-center border-2 border-green-500 text-sm sm:text-base">
          {formattedTimeTaken}
        </div>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
        {titleText[selectedLanguage]}
      </h1>

      <p className="text-lg sm:text-xl mb-2 sm:mb-4">
        {resultText[selectedLanguage]}: {correct}/{totalQuestions}
      </p>

      <p
        className={`text-base sm:text-lg mb-4 sm:mb-6 ${
          passed ? 'text-green-500' : 'text-red-500'
        }`}
      >
        {passed ? passMessage[selectedLanguage] : failMessage[selectedLanguage]}
      </p>

      <button
        onClick={handleExit}
        className="px-3 sm:px-4 py-1 sm:py-2 bg-white text-black rounded-lg hover:bg-gray-200 text-sm sm:text-base"
      >
        {exitButtonText[selectedLanguage]}
      </button>
    </div>
  );
};

export default Imtihon2050natija;