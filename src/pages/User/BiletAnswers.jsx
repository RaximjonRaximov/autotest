import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Savol from "../../components/Savol";
import api from "../../services/api";
import Javob from "../../components/Javob";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

function BiletAnswers() {
  const id = useSelector((state) => state.cart.CurrentBiletId);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedLanguage } = useLanguage();
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const idResponse = await api.get(`/questionsId/${id}/`);
      const questionIds = idResponse.data.questions_id || [];

      if (!questionIds.length) {
        setError("No question IDs found for this Bilet.");
        return;
      }

      const questionPromises = questionIds.map((questionId) =>
        api.get(`/questions/${questionId}/`).then((res) => res.data)
      );
      const questionData = await Promise.all(questionPromises);

      if (!questionData.length || questionData.some((q) => !q.question || !q.answers)) {
        setError("Invalid or incomplete question data received.");
        return;
      }

      setQuestions(questionData);
    } catch (err) {
      console.error("Error fetching questions:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Savollarni yuklashda xato yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuestions();
    } else {
      setError("Table ID is missing.");
      setQuestions([]);
    }
  }, [id, navigate]);

  const getQuestionText = (question) => {
    if (!question?.question) return "Savol mavjud emas";
    switch (selectedLanguage) {
      case "RU": return question.question.LanRu || "Вопрос отсутствует";
      case "KK": return question.question.LanKarakalpak || "Savol mavjud emas";
      case "УЗ": return question.question.LanKrill || "Савол мавжуд эмас";
      default: return question.question.LanUz || "Savol mavjud emas";
    }
  };

  const getAnswerText = (answer) => {
    switch (selectedLanguage) {
      case "RU": return answer.LanRu || "Ответ отсутствует";
      case "KK": return answer.LanKarakalpak || "Javob mavjud emas";
      case "УЗ": return answer.LanKrill || "Жавоб мавжуд эмас";
      default: return answer.LanUz || "Javob mavjud emas";
    }
  };

  const getLabel = (index) => `F${index + 1}`;

  const handleExit = () => {
    navigate("/user/imtihon-biletlar-javoblar", { replace: true });
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
  };

  if (loading) {
    return <div className="p-4 sm:p-6 text-white">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-4 sm:p-6 text-red-500">{error}</div>;
  }

  if (!id || questions.length === 0) {
    return (
      <div className="p-4 sm:p-6 text-white">
        <p>No questions available. Please select a valid Table ID.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const imageUrl = currentQuestion?.question?.Image || "/avtotest.jpg";

  // Full Grid Pagination (Desktop)
  const FullGridPagination = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
      <div className="flex flex-wrap gap-2 px-2 py-1">
        {questions.map((_, index) => {
          const buttonColorClass =
            currentQuestionIndex === index
              ? "bg-blue-500 text-white border border-blue-500"
              : "bg-white text-black border border-gray-300";
          return (
            <button
              key={index}
              onClick={() => handleQuestionClick(index)}
              className={`sm:w-10 sm:h-10 w-7.5 h-7.5 flex items-center justify-center ${buttonColorClass} text-sm hover:bg-gray-200 transition-colors duration-200`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <button
        onClick={handleExit}
        className="mt-2 sm:mt-0 ml-0 sm:ml-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm sm:text-base transition-colors duration-200"
      >
        {selectedLanguage === "UZ"
          ? "Chiqish"
          : selectedLanguage === "KK"
          ? "Shyǵý"
          : selectedLanguage === "УЗ"
          ? "Чиқиш"
          : "Выход"}
      </button>
    </div>
  );

  // Simple Pagination with Previous/Next (Mobile)
  const SimplePagination = () => (
    <div className="flex flex-col space-y-2 mb-4">
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`w-10 h-10 flex items-center justify-center bg-white text-black border border-gray-300 rounded-md text-xl ${
            currentQuestionIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
          } transition-colors duration-200`}
        >
          {"<<"}
        </button>
        <span className="w-16 h-10 flex items-center justify-center bg-gray-800 text-white rounded-md text-xl">
          {currentQuestionIndex + 1}/{questions.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className={`w-10 h-10 flex items-center justify-center bg-white text-black border border-gray-300 rounded-md text-xl ${
            currentQuestionIndex === questions.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
          } transition-colors duration-200`}
        >
          {">>"}
        </button>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleExit}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm transition-colors duration-200"
        >
          {selectedLanguage === "UZ"
            ? "Chiqish"
            : selectedLanguage === "KK"
            ? "Shyǵý"
            : selectedLanguage === "УЗ"
            ? "Чиқиш"
            : "Выход"}
        </button>
      </div>
    </div>
  );

  // Bottom Grid Pagination (Mobile)
  const BottomGridPagination = () => (
    <div className="flex flex-wrap gap-2 px-2 py-1 mt-4">
      {questions.map((_, index) => {
        const buttonColorClass =
          currentQuestionIndex === index
            ? "bg-blue-500 text-white border border-blue-500"
            : "bg-white text-black border border-gray-300";
        return (
          <button
            key={index}
            onClick={() => handleQuestionClick(index)}
            className={`w-7.5 h-7.5 flex items-center justify-center ${buttonColorClass} text-sm hover:bg-gray-200 transition-colors duration-200`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{
        backgroundImage: `url('/loginBg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Mobile Layout */}
      <div className="sm:hidden flex flex-col space-y-4">
        <SimplePagination />
        <Savol text={getQuestionText(currentQuestion)} timeLeft={null} />
        <div className="flex-1 rounded-lg">
          <img
            src={imageUrl}
            alt="Question Image"
            className="w-full object-cover rounded-lg"
          />
        </div>
        <div className="space-y-2">
          {currentQuestion.answers?.map((answer, index) => (
            <Javob
              key={answer.id}
              label={getLabel(index)}
              text={getAnswerText(answer)}
              isCorrect={answer.is_correct}
              showCorrect={true}
              disabled={true}
            />
          ))}
        </div>
        <BottomGridPagination />
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block">
        <FullGridPagination />
        <Savol text={getQuestionText(currentQuestion)} timeLeft={null} />
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="space-y-2 sm:space-y-4 flex-1">
            {currentQuestion.answers?.map((answer, index) => (
              <Javob
                key={answer.id}
                label={getLabel(index)}
                text={getAnswerText(answer)}
                isCorrect={answer.is_correct}
                showCorrect={true}
                disabled={true}
              />
            ))}
          </div>
          <div className="flex-1 rounded-lg sm:rounded-[12px]">
            <img
              src={imageUrl}
              alt="Question Image"
              className="w-full object-cover rounded-lg sm:rounded-[12px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BiletAnswers;