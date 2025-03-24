import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Savol from "../../components/Savol";
import api from "../../services/api";
import Javob from "../../components/Javob";
import { useLanguage } from "../../context/LanguageContext";

function AynanMavzulashtirilganTestlar() {
  const id = useSelector((state) => state.cart.categoryId);
  const [questions, setQuestions] = useState([]); // List of question IDs
  const [currentQuestion, setCurrentQuestion] = useState({}); // Current question details
  const [currentPage, setCurrentPage] = useState(1); // Start at page 1
  const { selectedLanguage } = useLanguage();

  // Fetch the list of question IDs for the category
  useEffect(() => {
    const getQuestions = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/questions_by_category/${id}/`);
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    getQuestions();
  }, [id]);

  // Fetch the current question based on the current page
  useEffect(() => {
    const getCurrentQuestion = async () => {
      if (!questions.length || currentPage < 1 || currentPage > questions.length) return;

      const questionId = questions[currentPage - 1]?.id; // Get the ID of the current question
      if (!questionId) return;

      try {
        const response = await api.get(`/questions/${questionId}/`);
        setCurrentQuestion(response.data);
      } catch (error) {
        console.error("Error fetching current question:", error);
      }
    };
    getCurrentQuestion();
  }, [questions, currentPage]);

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

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundImage: `url('/loginBg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex justify-end items-center mb-[33px]">
        <button
          className="px-12 py-1 text-white font-regular rounded-lg text-[22px]
                 bg-[conic-gradient(from_-3.29deg_at_100%_-13%,#FFA502_0deg,#FF6348_360deg)] 
                 shadow-[0px_0px_30px_0px_#FF7F5080] transition-all duration-300 
                 hover:shadow-[0px_0px_40px_0px_#FF7F5080] hover:scale-105"
        >
          Test
        </button>
      </div>
      <Savol getQuestionText={getQuestionText} />
      <div className="flex space-x-4">
        {/* Answers List */}
        <div className="space-y-4 flex-1">
          {currentQuestion.answers?.map((answer, index) => (
            <Javob key={answer.id} answer={answer} index={index} />
          ))}
        </div>
        <div className="flex-1 rounded-[12px]">
          <img
            src={currentQuestion.question?.Image}
            alt="Question Image"
            className="h-[150px]object-cover rounded-[12px]"
          />
        </div>
      </div>
      {/* Pagination */}
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
    </div>
  );
}

export default AynanMavzulashtirilganTestlar;