import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext'; // Import the language context

const Imtihon2050natija = () => {
  const { state } = useLocation(); // Get the state passed from Imtihon2050
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage(); // Get the selected language from context

  // Extract data from state
  const { correct, incorrect, questionIds, answerCorrectness, timeTaken } = state || {};
  const totalQuestions = questionIds?.length || 0;
  const passingThreshold = 0.9; // 90% correct to pass
  const passed = correct >= totalQuestions * passingThreshold;

  // Format the time taken (in seconds) to MM:SS
  const minutes = Math.floor(timeTaken / 60);
  const seconds = (timeTaken % 60).toString().padStart(2, '0');
  const formattedTimeTaken = `${minutes}:${seconds}`;

  // Language-specific text
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

  // Handle exit button
  const handleExit = () => {
    navigate('/user');
  };

  return (
    <div className="p-6 text-white min-h-screen bg-[url(/loginBg.png)] bg-cover flex flex-col items-center">
      {/* Navigation Buttons and Time Taken */}
      <div className="flex justify-between items-center mb-6 w-full max-w-4xl">
        <div className="flex px-2 py-1">
          {questionIds?.map((_, index) => {
            const questionId = state.questions[index]?.question?.id;
            const isCorrect = answerCorrectness[questionId];
            const buttonColorClass = isCorrect
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white';

            return (
              <button
                key={index}
                className={`mx-[0.05rem] w-12 h-12 flex items-center justify-center ${buttonColorClass}`}
                disabled // Disable buttons since this is the result page
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <div className="absolute right-[8rem] top-[6rem] bg-green-700 text-white rounded-full w-18 h-17 flex items-center justify-center border-2 border-green-500">
          {formattedTimeTaken}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-4">{titleText[selectedLanguage]}</h1>

      {/* Test Result */}
      <p className="text-xl mb-4">
        {resultText[selectedLanguage]}: {correct}/{totalQuestions}
      </p>

      {/* Pass/Fail Message */}
      <p
        className={`text-lg mb-6 ${
          passed ? 'text-green-500' : 'text-red-500'
        }`}
      >
        {passed ? passMessage[selectedLanguage] : failMessage[selectedLanguage]}
      </p>

      {/* Exit Button */}
      <button
        onClick={handleExit}
        className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200"
      >
        {exitButtonText[selectedLanguage]}
      </button>
    </div>
  );
};

export default Imtihon2050natija;