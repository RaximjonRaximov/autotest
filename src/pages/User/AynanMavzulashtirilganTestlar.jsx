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
  const [answers, setAnswers] = useState({}); // { questionId: { answer, is_correct } }
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const { selectedLanguage } = useLanguage();
  const navigate = useNavigate();

  // Fetch question IDs
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

  // Fetch current question
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

  // Timer logic
  useEffect(() => {
    if (!testStarted || testEnded) return;
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          handleTestEnd(); // End test when time runs out
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted, testEnded]);

  // End test when all questions are answered
  useEffect(() => {
    if (testStarted && Object.keys(answers).length === questions.length) {
      handleTestEnd();
    }
  }, [answers, questions.length, testStarted]);

  const getQuestionText = () => {
    switch (selectedLanguage) {
      case "RU": return currentQuestion.question?.LanRu || "Вопрос отсутствует";
      case "KK": return currentQuestion.question?.LanKarakalpak || "Savol mavjud emas";
      case "УЗ": return currentQuestion.question?.LanKrill || "Савол мавжуд эмас";
      default: return currentQuestion.question?.LanUz || "Savol mavjud emas";
    }
  };

  // Handle answer selection (only once per question)
  const handleAnswerClick = (answer) => {
    if (!testStarted) return;
    const questionId = questions[currentPage - 1]?.id;

    // Prevent answering if already answered
    if (answers[questionId]) return;

    // Save the answer and its correctness
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { answer, is_correct: answer.is_correct },
    }));

    // Update counts
    if (answer.is_correct) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }

    // Auto-advance after a delay
    setTimeout(() => {
      if (currentPage < questions.length) {
        setCurrentPage(currentPage + 1);
      }
    }, 1000);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < questions.length) setCurrentPage(currentPage + 1);
  };

  const handleQuestionClick = (page) => {
    setCurrentPage(page);
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
    setTestEnded(false); // Reset test ended state
  };

  // Handle test end (time out, all answered, or manual stop)
  const handleTestEnd = () => {
    // Mark unanswered questions as incorrect
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      setIncorrectCount((prev) => prev + unansweredCount);
    }
    setTestEnded(true);
    setTestStarted(false);
  };

  // Handle manual stop test
  const handleStopTest = () => {
    handleTestEnd(); // End the test and calculate results
  };

  const calculateResults = () => {
    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    let outcome = "";
    if (percentage >= 80) outcome = "YAXSHI";
    else if (percentage >= 50) outcome = "QONIQARLI";
    else outcome = "YOMON";
    return { percentage: percentage.toFixed(0), outcome };
  };

  const handleExit = () => {
    navigate("/");
  };

  const renderResultsPage = () => {
    const { percentage, outcome } = calculateResults();
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <div className="text-3xl font-bold mb-4">
          Test javoblari: {correctCount}/{questions.length}
        </div>
        <div className="text-2xl mb-4">Sizning ozlashtirishingiz: {percentage}%</div>
        <div className="text-2xl mb-8">Test natijasi: {outcome}</div>
        <button
          onClick={handleExit}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Chiqish
        </button>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundImage: `url('/loginBg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {testEnded ? (
        renderResultsPage()
      ) : (
        <>
          <div className={`flex ${testStarted ? "justify-between" : "justify-end"}`}>
            {testStarted && !error && questions.length > 0 && (
              <div className="flex justify-center mb-4 space-x-2">
                {questions.map((_, index) => {
                  const page = index + 1;
                  const questionId = questions[index]?.id;
                  const userAnswer = answers[questionId];
                  let bgColor = "bg-white text-black";
                  if (userAnswer) {
                    bgColor = userAnswer.is_correct ? "bg-green-500 text-white" : "bg-red-500 text-white";
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handleQuestionClick(page)}
                      className={`mx-[0.05rem] w-12 h-12 flex items-center justify-center ${bgColor} ${
                        currentPage === page ? "border-2 border-blue-500" : ""
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end items-center mb-[33px]">
              <button
                onClick={testStarted ? handleStopTest : handleStartTest}
                className={`px-12 py-1 text-white font-regular rounded-lg text-[22px] bg-[conic-gradient(from_-3.29deg_at_100%_-13%,#FFA502_0deg,#FF6348_360deg)] 
                     shadow-[0px_0px_30px_0px_#FF7F5080] transition-all duration-300 hover:shadow-[0px_0px_40px_0px_#FF7F5080] hover:scale-105`}
              >
                {testStarted ? "Stop Test" : "Test"}
              </button>
            </div>
          </div>

          {error && <div className="text-red-500 text-center mb-4">{error}</div>}

          {!error && questions.length > 0 && (
            <>
              <Savol text={getQuestionText()} timeLeft={testStarted ? timeLeft : null} />
              <div className="flex space-x-4">
                <div className="space-y-4 flex-1">
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
                      />
                    );
                  })}
                </div>
                <div className="flex-1 rounded-[12px]">
                  <img
                    src={currentQuestion.question?.Image}
                    alt="Question Image"
                    className="w-[350px] object-cover rounded-[12px]"
                  />
                </div>
              </div>
              <div className="flex justify-center items-center mt-6 space-x-4 pagination">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-2xl ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {"<<"}
                </button>
                <span className="px-4 py-2 bg-gray-800 text-white rounded-md text-2xl">
                  {currentPage}/{questions.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === questions.length || questions.length === 0}
                  className={`px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-2xl ${
                    currentPage === questions.length || questions.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {">>"}
                </button>
              </div>
            </>
          )}

          {!error && questions.length === 0 && (
            <div className="text-white text-center mt-10">Loading questions...</div>
          )}
        </>
      )}
    </div>
  );
}

export default AynanMavzulashtirilganTestlar;