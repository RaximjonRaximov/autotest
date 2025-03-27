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
      if (
        !questions.length ||
        currentPage < 1 ||
        currentPage > questions.length
      )
        return;
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
      case "RU":
        return currentQuestion.question?.LanRu || "Вопрос отсутствует";
      case "KK":
        return currentQuestion.question?.LanKarakalpak || "Savol mavjud emas";
      case "УЗ":
        return currentQuestion.question?.LanKrill || "Савол мавжуд эмас";
      default:
        return currentQuestion.question?.LanUz || "Savol mavjud emas";
    }
  };

  const handleAnswerClick = (answer) => {
    if (!testStarted) return;
    const questionId = questions[currentPage - 1]?.id;
  
    if (answers[questionId]) return;
  
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { answer, is_correct: answer.is_correct },
    }));
  
    if (answer.is_correct) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }
  
    setTimeout(() => {
      if (currentPage < questions.length) {
        setCurrentPage(currentPage + 1);
      }
    }, 1000);
  };

  const handleQuestionClick = (page) => {
    setCurrentPage(page);
  };

  const getLabel = (index) => `F${index + 1}`;

  const getAnswerText = (answer) => {
    switch (selectedLanguage) {
      case "RU":
        return answer.LanRu || "Ответ отсутствует";
      case "KK":
        return answer.LanKarakalpak || "Javob mavjud emas";
      case "УЗ":
        return answer.LanKrill || "Жавоб мавжуд эмас";
      default:
        return answer.LanUz || "Javob mavjud emas";
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
    if (unansweredCount > 0) {
      setIncorrectCount((prev) => prev + unansweredCount);
    }
    setTestStarted(false);
    setTestEnded(true);

    const timeTaken = 1500 - timeLeft;

    const questionIds = questions.map((q) => q.id);
    const answerCorrectness = {};
    questionIds.forEach((id) => {
      answerCorrectness[id] = answers[id]?.is_correct || false;
    });

    navigate("/user/imtihon2050natija", {
      state: {
        correct: correctCount,
        incorrect: incorrectCount,
        questionIds,
        answerCorrectness,
        timeTaken,
        questions,
      },
    });
  };

  const handleStopTest = () => {
    handleTestEnd();
  };

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{
        backgroundImage: `url('/loginBg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <>
        {/* Pagination and Start/Stop Button at the Top */}
        <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-[33px]">
          {!error && questions.length > 0 && (
            <div className="grid grid-cols-10 gap-1 sm:gap-2 justify-center mb-2 sm:mb-4">
              {questions.map((_, index) => {
                const page = index + 1;
                const questionId = questions[index]?.id;
                const userAnswer = answers[questionId];
                let bgColor = "bg-white text-black"; // White before test starts
                if (testStarted && userAnswer) {
                  bgColor = userAnswer.is_correct
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white";
                }
                return (
                  <button
                    key={page}
                    onClick={() => handleQuestionClick(page)}
                    className={`w-8 sm:w-12 h-8 sm:h-12 flex items-center justify-center ${bgColor} ${
                      currentPage === page ? "border-2 border-blue-500" : ""
                    } text-sm sm:text-base`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex justify-end items-center">
            <button
              onClick={testStarted ? handleStopTest : handleStartTest}
              className={`px-6 sm:px-12 py-1 text-white font-regular rounded-lg text-lg sm:text-[22px] bg-[conic-gradient(from_-3.29deg_at_100%_-13%,#FFA502_0deg,#FF6348_360deg)] 
                   shadow-[0px_0px_20px_0px_#FF7F5080] sm:shadow-[0px_0px_30px_0px_#FF7F5080] transition-all duration-300 hover:shadow-[0px_0px_30px_0px_#FF7F5080] sm:hover:shadow-[0px_0px_40px_0px_#FF7F5080] hover:scale-105`}
            >
              {testStarted
                ? selectedLanguage === "UZ"
                  ? "Tugatish"
                  : selectedLanguage === "KK"
                  ? "Ayaqtaý"
                  : selectedLanguage === "УЗ"
                  ? "Тугатиш"
                  : "Закончить"
                : selectedLanguage === "UZ"
                ? "Test"
                : selectedLanguage === "KK"
                ? "Test"
                : selectedLanguage === "УЗ"
                ? "Тест"
                : "Тест"}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-center mb-2 sm:mb-4">{error}</div>
        )}

        {!error && questions.length > 0 && (
          <>
            {/* Question Text and Timer */}
            <Savol
              text={getQuestionText()}
              timeLeft={testStarted ? timeLeft : null}
            />

            {/* Mobile: Picture and Answers (stacked) */}
            <div className="md:hidden">
              <div className="flex justify-center mb-4">
                <img
                  src={currentQuestion.question?.Image}
                  alt="Question Image"
                  className="w-full max-w-[350px] object-cover rounded-lg"
                />
              </div>
              <div className="space-y-2">
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
            </div>

            {/* Desktop: Picture and Answers (side by side) */}
            <div className="hidden md:block">
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
                    src={currentQuestion.question?.Image}
                    alt="Question Image"
                    className="w-full  object-cover rounded-lg sm:rounded-[12px]"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {!error && questions.length === 0 && (
          <div className="text-white text-center mt-6 sm:mt-10">
            Loading questions...
          </div>
        )}
      </>
    </div>
  );
}

export default AynanMavzulashtirilganTestlar;