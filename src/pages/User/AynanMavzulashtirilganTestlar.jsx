import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Savol from "../../components/Savol";
import api from "../../services/api";
import Javob from "../../components/Javob";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom"; // For navigation

function AynanMavzulashtirilganTestlar() {
  const id = useSelector((state) => state.cart.categoryId);
  const [questions, setQuestions] = useState([]); // List of question IDs
  const [currentQuestion, setCurrentQuestion] = useState({}); // Current question details
  const [currentPage, setCurrentPage] = useState(1); // Start at page 1
  const [timeLeft, setTimeLeft] = useState(1500); // Timer starts at 25 minutes (1500 seconds)
  const [isAnswered, setIsAnswered] = useState(false); // Track if the current question is answered
  const [testStarted, setTestStarted] = useState(false); // Track if the test timer has started
  const [testEnded, setTestEnded] = useState(false); // Track if the test has ended
  const [error, setError] = useState(null); // Track errors
  const [answers, setAnswers] = useState({}); // Track user answers during the test
  const [correctCount, setCorrectCount] = useState(0); // Track correct answers
  const [incorrectCount, setIncorrectCount] = useState(0); // Track incorrect answers
  const { selectedLanguage } = useLanguage();
  const navigate = useNavigate(); // For navigation

  // Fetch the list of question IDs for the category immediately
  useEffect(() => {
    const getQuestions = async () => {
      if (!id) {
        setError("Category ID is missing.");
        return;
      }
      try {
        const response = await api.get(`/questions_by_category/${id}/`);
        console.log("Questions response:", response.data); // Debugging
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

  // Fetch the current question based on the current page
  useEffect(() => {
    const getCurrentQuestion = async () => {
      if (
        !questions.length ||
        currentPage < 1 ||
        currentPage > questions.length
      )
        return;

      const questionId = questions[currentPage - 1]?.id; // Get the ID of the current question
      if (!questionId) {
        setError("Question ID is missing.");
        return;
      }

      try {
        const response = await api.get(`/questions/${questionId}/`);
        console.log("Current question response:", response.data); // Debugging
        setCurrentQuestion(response.data);
      } catch (error) {
        console.error("Error fetching current question:", error);
        setError("Failed to fetch the current question. Please try again.");
      }
    };
    getCurrentQuestion();
  }, [questions, currentPage]);

  // Timer logic: Start the timer only after the test starts
  useEffect(() => {
    if (!testStarted || testEnded) return; // Only start the timer after the test starts and before it ends

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          // End the test when time runs out
          setTestEnded(true);
          setTestStarted(false); // Reset test state
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, [testStarted, testEnded]);

  // Reset answered state when the page changes
  useEffect(() => {
    setIsAnswered(false); // Reset answered state
  }, [currentPage]);

  // End the test when all questions are answered
  useEffect(() => {
    if (testStarted && Object.keys(answers).length === questions.length) {
      setTestEnded(true);
      setTestStarted(false);
    }
  }, [answers, questions.length, testStarted]);

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

  // Handle answer selection
  const handleAnswerClick = (answer) => {
    if (!testStarted) return; // Only allow answer selection after the test starts

    setIsAnswered(true);

    // Update answers state
    const questionId = questions[currentPage - 1]?.id;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Update correct/incorrect counts
    if (answer.is_correct) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setIncorrectCount((prev) => prev + 1);
    }

    // Auto-advance to the next question after a short delay
    setTimeout(() => {
      if (currentPage < questions.length) {
        setCurrentPage(currentPage + 1);
      }
    }, 1000); // 1-second delay to show feedback before moving to the next question
  };

  // Pagination handlers
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < questions.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle clicking a question number in the top pagination bar
  const handleQuestionClick = (page) => {
    setCurrentPage(page);
  };

  // Map index to labels (A, B, C, D)
  const getLabel = (index) => {
    return String.fromCharCode(65 + index); // 65 is ASCII for 'A'
  };

  // Get answer text based on language
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

  // Handle Test button click to start the test timer
  const handleStartTest = () => {
    setTestStarted(true);
    setTimeLeft(1500); // Ensure timer starts at 25 minutes
    setCurrentPage(1); // Reset to the first question
    setAnswers({}); // Reset answers
    setCorrectCount(0); // Reset correct count
    setIncorrectCount(0); // Reset incorrect count
  };

  // Calculate the percentage and outcome for the results page
  const calculateResults = () => {
    const totalQuestions = questions.length;
    const percentage =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    let outcome = "";
    if (percentage >= 80) {
      outcome = "YAXSHI"; // Good
    } else if (percentage >= 50) {
      outcome = "QONIQARLI"; // Satisfactory
    } else {
      outcome = "YOMON"; // Bad
    }
    return { percentage: percentage.toFixed(0), outcome };
  };

  // Handle Exit button click
  const handleExit = () => {
    navigate("/");
  };

  // Handle Topic Analysis button click

  // Render the results page
  const renderResultsPage = () => {
    const { percentage, outcome } = calculateResults();
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <div className="text-3xl font-bold mb-4">
          Test javoblari: {correctCount}/{questions.length}
        </div>
        <div className="text-2xl mb-4">
          Sizning ozlashtirishingiz: {percentage}%
        </div>
        <div className="text-2xl mb-8">Test natijasi: {outcome}</div>
        <div className="flex space-x-4">
          <button
            onClick={handleExit}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Chiqish
          </button>
        </div>
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
      {/* Show results page if the test has ended */}
      {testEnded ? (
        renderResultsPage()
      ) : (
        <>
          {/* Top Pagination Bar with Correct/Incorrect Indicators - Visible only after test starts */}
          {testStarted && !error && questions.length > 0 && (
            <div className="flex justify-center mb-4 space-x-2">
              {questions.map((_, index) => {
                const page = index + 1;
                const questionId = questions[index]?.id;
                const userAnswer = answers[questionId];
                let bgColor = "bg-white text-black"; // Default: unanswered
                if (userAnswer) {
                  bgColor = userAnswer.is_correct
                    ? "bg-green-500 text-white" // Correct
                    : "bg-red-500 text-white"; // Incorrect
                }

                return (
                  <button
                    key={page}
                    onClick={() => handleQuestionClick(page)}
                    className={`px-4 py-2 rounded-md font-medium ${bgColor} ${
                      currentPage === page ? "border-2 border-blue-500" : ""
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          )}

          

          {/* Test Button */}
          <div className="flex justify-end items-center mb-[33px]">
            <button
              onClick={handleStartTest}
              disabled={testStarted} // Disable button after test starts
              className={`px-12 py-1 text-white font-regular rounded-lg text-[22px]
                     bg-[conic-gradient(from_-3.29deg_at_100%_-13%,#FFA502_0deg,#FF6348_360deg)] 
                     shadow-[0px_0px_30px_0px_#FF7F5080] transition-all duration-300 
                     hover:shadow-[0px_0px_40px_0px_#FF7F5080] hover:scale-105 ${
                       testStarted ? "opacity-50 cursor-not-allowed" : ""
                     }`}
            >
              Test
            </button>
          </div>

          {/* Show error message if there's an error */}
          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}

          {/* Show test content if there are questions and no errors */}
          {!error && questions.length > 0 && (
            <>
              <Savol
                text={getQuestionText()}
                timeLeft={testStarted ? timeLeft : null} // Pass null if test hasn't started
              />
              <div className="flex space-x-4">
                {/* Answers List */}
                <div className="space-y-4 flex-1">
                  {currentQuestion.answers?.map((answer, index) => {
                    const questionId = questions[currentPage - 1]?.id;
                    const userAnswer = answers[questionId];
                    const isSelected = userAnswer?.id === answer.id;
                    const showAsAnswered = testStarted ? isAnswered : true; // Show as answered before test starts to reveal correct answers

                    return (
                      <Javob
                        key={answer.id}
                        label={getLabel(index)} // A, B, C, D
                        text={getAnswerText(answer)} // Answer text based on language
                        onClick={() => handleAnswerClick(answer)}
                        isSelected={isSelected}
                        isCorrect={answer.is_correct}
                        isAnswered={showAsAnswered}
                      />
                    );
                  })}
                </div>
                <div className="flex-1 rounded-[12px]">
                  <img
                    src={currentQuestion.question?.Image}
                    alt="Question Image"
                    className="h-[150px] object-cover rounded-[12px]"
                  />
                </div>
              </div>
              {/* Bottom Pagination */}
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
                  disabled={
                    currentPage === questions.length || questions.length === 0
                  }
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

          {/* Fallback UI if no questions are loaded yet */}
          {!error && questions.length === 0 && (
            <div className="text-white text-center mt-10">
              Loading questions...
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AynanMavzulashtirilganTestlar;
