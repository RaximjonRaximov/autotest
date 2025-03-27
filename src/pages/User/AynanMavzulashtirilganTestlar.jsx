import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Savol from "../../components/Savol";
import api from "../../services/api";
import Javob from "../../components/Javob";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

function AynanMavzulashtirilganTestlar() {
  const id = useSelector((state) => state.cart.categoryId);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(1500);
  const [testStarted, setTestStarted] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const { selectedLanguage } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const getQuestions = async () => {
      if (!id) {
        setError("Category ID is missing.");
        return;
      }
      try {
        const response = await api.get(`/questions_by_category/${id}/`);
        setQuestions(response.data);
        if (response.data.length === 0) {
          setError("No questions found for this category.");
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError("Failed to fetch questions. Please try again.");
      }
    };
    getQuestions();
  }, [id]);

  useEffect(() => {
    const getCurrentQuestion = async () => {
      if (!questions.length || currentPage < 1 || currentPage > questions.length) return;
      const questionId = questions[currentPage - 1]?.id;
      if (!questionId) {
        setError("Question ID is missing.");
        return;
      }
      try {
        const response = await api.get(`/questions/${questionId}/`);
        setCurrentQuestion(response.data);
      } catch (error) {
        console.error("Error fetching current question:", error);
        setError("Failed to fetch the current question. Please try again.");
      }
    };
    getCurrentQuestion();
  }, [questions, currentPage]);

  useEffect(() => {
    if (!testStarted || testEnded) return;
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          handleTestEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted, testEnded]);

  const getQuestionText = () => {
    switch (selectedLanguage) {
      case "RU": return currentQuestion.question?.LanRu || "Вопрос отсутствует";
      case "KK": return currentQuestion.question?.LanKarakalpak || "Savol mavjud emas";
      case "УЗ": return currentQuestion.question?.LanKrill || "Савол мавжуд эмас";
      default: return currentQuestion.question?.LanUz || "Savol mavjud emas";
    }
  };

  const handleAnswerClick = (answer) => {
    if (!testStarted || answers[questions[currentPage - 1]?.id]) return;
    const questionId = questions[currentPage - 1]?.id;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { answer, is_correct: answer.is_correct },
    }));
    if (answer.is_correct) setCorrectCount((prev) => prev + 1);
    else setIncorrectCount((prev) => prev + 1);
    setTimeout(() => {
      if (currentPage < questions.length) setCurrentPage(currentPage + 1);
    }, 1000);
  };

  const imageUrl = currentQuestion?.question?.Image
    ? `${currentQuestion.question?.Image}`
    : "/avtotest.jpg";

  const handleQuestionClick = (page) => setCurrentPage(page);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < questions.length) setCurrentPage(currentPage + 1);
  };

  const getLabel = (index) => `F${index + 1}`;

  const getAnswerText = (answer) => {
    switch (selectedLanguage) {
      case "RU": return answer.LanRu || "Ответ отсутствует";
      case "KK": return answer.LanKarakalpak || "Javob mavjud emas";
      case "УЗ": return answer.LanKrill || "Жавоб мавжуд эмас";
      default: return answer.LanUz || "Javob mavjud emas";
    }
  };

  const handleStartTest = () => {
    setTestStarted(true);
    setTimeLeft(1500);
    setCurrentPage(1);
    setAnswers({});
    setCorrectCount(0);
    setIncorrectCount(0);
    setTestEnded(false);
  };

  const handleTestEnd = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) setIncorrectCount((prev) => prev + unansweredCount);
    setTestStarted(false);
    setTestEnded(true);
    const timeTaken = 1500 - timeLeft;
    const questionIds = questions.map((q) => q.id);
    const answerCorrectness = {};
    questionIds.forEach((id) => {
      answerCorrectness[id] = answers[id]?.is_correct || false;
    });
    navigate("/user/imtihon2050natija", {
      state: { correct: correctCount, incorrect: incorrectCount, questionIds, answerCorrectness, timeTaken, questions },
    });
  };

  const handleStopTest = () => handleTestEnd();

  // Full Grid Pagination (Desktop)
  const FullGridPagination = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
      <div className="flex flex-wrap gap-2 px-2 py-1">
        {questions.map((_, index) => {
          const page = index + 1;
          const questionId = questions[index]?.id;
          const userAnswer = answers[questionId];
          let buttonColorClass = "bg-white text-black border border-gray-300";
          if (currentPage === page) {
            buttonColorClass = "bg-blue-500 text-white border border-blue-500";
          } else if (testStarted && userAnswer) {
            buttonColorClass = userAnswer.is_correct
              ? "bg-green-500 text-white border border-green-500"
              : "bg-red-500 text-white border border-red-500";
          }
          return (
            <button
              key={page}
              onClick={() => handleQuestionClick(page)}
              className={`sm:w-10 sm:h-10 w-7.5 h-7.5 flex items-center justify-center ${buttonColorClass} text-sm hover:bg-gray-200 transition-colors duration-200`}
            >
              {page}
            </button>
          );
        })}
      </div>
      <button
        onClick={testStarted ? handleStopTest : handleStartTest}
        className="mt-2 sm:mt-0 ml-0 sm:ml-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm sm:text-base transition-colors duration-200"
      >
        {testStarted
          ? selectedLanguage === "UZ" ? "Tugatish" : selectedLanguage === "KK" ? "Ayaqtaý" : selectedLanguage === "УЗ" ? "Тугатиш" : "Закончить"
          : selectedLanguage === "UZ" ? "Test" : selectedLanguage === "KK" ? "Test" : selectedLanguage === "УЗ" ? "Тест" : "Тест"}
      </button>
    </div>
  );

  // Simple Pagination with Previous/Next (Mobile)
  const SimplePagination = () => (
    <div className="flex flex-col space-y-2 mb-4">
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`w-10 h-10 flex items-center justify-center bg-white text-black border border-gray-300 rounded-md text-xl ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
          } transition-colors duration-200`}
        >
          {"<<"}
        </button>
        <span className="w-16 h-10 flex items-center justify-center bg-gray-800 text-white rounded-md text-xl">
          {currentPage}/{questions.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === questions.length}
          className={`w-10 h-10 flex items-center justify-center bg-white text-black border border-gray-300 rounded-md text-xl ${
            currentPage === questions.length ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
          } transition-colors duration-200`}
        >
          {">>"}
        </button>
      </div>
      <div className="flex justify-end">
        <button
          onClick={testStarted ? handleStopTest : handleStartTest}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm transition-colors duration-200"
        >
          {testStarted
            ? selectedLanguage === "UZ" ? "Tugatish" : selectedLanguage === "KK" ? "Ayaqtaý" : selectedLanguage === "УЗ" ? "Тугатиш" : "Закончить"
            : selectedLanguage === "UZ" ? "Test" : selectedLanguage === "KK" ? "Test" : selectedLanguage === "УЗ" ? "Тест" : "Тест"}
        </button>
      </div>
    </div>
  );

  // Bottom Grid Pagination (Mobile)
  const BottomGridPagination = () => (
    <div className="flex flex-wrap gap-2 px-2 py-1 mt-4">
      {questions.map((_, index) => {
        const page = index + 1;
        const questionId = questions[index]?.id;
        const userAnswer = answers[questionId];
        let buttonColorClass = "bg-white text-black border border-gray-300";
        if (currentPage === page) {
          buttonColorClass = "bg-blue-500 text-white border border-blue-500";
        } else if (testStarted && userAnswer) {
          buttonColorClass = userAnswer.is_correct
            ? "bg-green-500 text-white border border-green-500"
            : "bg-red-500 text-white border border-red-500";
        }
        return (
          <button
            key={page}
            onClick={() => handleQuestionClick(page)}
            className={`w-7.5 h-7.5 flex items-center justify-center ${buttonColorClass} text-sm hover:bg-gray-200 transition-colors duration-200`}
          >
            {page}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundImage: `url('/loginBg.png')`, backgroundSize: "cover", backgroundPosition: "center" }}>
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col">
        <SimplePagination />
        {error && <div className="text-red-500 text-center mb-2">{error}</div>}
        {!error && questions.length > 0 && (
          <>
            <Savol text={getQuestionText()} timeLeft={testStarted ? timeLeft : null} />
            <div className="flex justify-center mb-4">
              <img
                src={currentQuestion.question?.Image}
                alt="Question Image"
                className="w-full max-w-[350px] object-cover rounded-lg"
              />
            </div>
            <div className="space-y-2 mb-4">
              {currentQuestion.answers?.map((answer, index) => {
                const questionId = questions[currentPage - 1]?.id;
                const userAnswer = answers[questionId];
                const isSelected = userAnswer?.answer.id === answer.id;
                const isAnswered = !!userAnswer;
                return (
                  <Javob
                    key={answer.id}
                    label={getLabel(index)}
                    text={getAnswerText(answer)}
                    onClick={() => handleAnswerClick(answer)}
                    isSelected={isSelected}
                    isCorrect={answer.is_correct}
                    isAnswered={isAnswered}
                    disabled={isAnswered}
                    showCorrect={!testStarted}
                  />
                );
              })}
            </div>
            <BottomGridPagination />
          </>
        )}
        {!error && questions.length === 0 && (
          <div className="text-white text-center mt-6">Loading questions...</div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <FullGridPagination />
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {!error && questions.length > 0 && (
          <>
            <Savol text={getQuestionText()} timeLeft={testStarted ? timeLeft : null} />
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="space-y-2 sm:space-y-4 flex-1">
                {currentQuestion.answers?.map((answer, index) => {
                  const questionId = questions[currentPage - 1]?.id;
                  const userAnswer = answers[questionId];
                  const isSelected = userAnswer?.answer.id === answer.id;
                  const isAnswered = !!userAnswer;
                  return (
                    <Javob
                      key={answer.id}
                      label={getLabel(index)}
                      text={getAnswerText(answer)}
                      onClick={() => handleAnswerClick(answer)}
                      isSelected={isSelected}
                      isCorrect={answer.is_correct}
                      isAnswered={isAnswered}
                      disabled={isAnswered}
                      showCorrect={!testStarted}
                    />
                  );
                })}
              </div>
              <div className="flex-1 rounded-lg sm:rounded-[12px]">
                <img
                  src={imageUrl}
                  alt="/avtotest.jpg"
                  className="w-full object-cover rounded-lg sm:rounded-[12px]"
                />
              </div>
            </div>
          </>
        )}
        {!error && questions.length === 0 && (
          <div className="text-white text-center mt-10">Loading questions...</div>
        )}
      </div>
    </div>
  );
}

export default AynanMavzulashtirilganTestlar;