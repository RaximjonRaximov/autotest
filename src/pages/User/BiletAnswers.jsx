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
      console.log("Fetched Question IDs:", idResponse.data);
      const questionIds = idResponse.data.questions_id || [];

      if (!questionIds.length) {
        setError("No question IDs found for this Bilet.");
        return;
      }

      const questionPromises = questionIds.map((questionId) =>
        api.get(`/questions/${questionId}/`).then((res) => res.data)
      );
      const questionData = await Promise.all(questionPromises);
      console.log("Fetched Question Details:", questionData);

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
      case "RU":
        return question.question.LanRu || "Вопрос отсутствует";
      case "KK":
        return question.question.LanKarakalpak || "Savol mavjud emas";
      case "УЗ":
        return question.question.LanKrill || "Савол мавжуд эмас";
      default:
        return question.question.LanUz || "Savol mavjud emas";
    }
  };

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

  if (loading) {
    return <div className="p-6 text-white">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!id || questions.length === 0) {
    return (
      <div className="p-6 text-white">
        <p>No questions available. Please select a valid Table ID.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const imageUrl = currentQuestion?.question?.Image || "/avtotest.jpg";

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
          onClick={handleExit}
          className="px-12 py-1 text-white font-regular rounded-lg text-[22px] bg-[conic-gradient(from_-3.29deg_at_100%_-13%,#FFA502_0deg,#FF6348_360deg)] 
                     shadow-[0px_0px_30px_0px_#FF7F5080] transition-all duration-300 hover:shadow-[0px_0px_40px_0px_#FF7F5080] hover:scale-105"
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

      <Savol text={getQuestionText(currentQuestion)} timeLeft={null} />
      <div className="flex space-x-4">
        <div className="space-y-4 flex-1">
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
        <div className="flex-1 rounded-[12px]">
          <img
            src={imageUrl}
            alt="Question Image"
            className="w-[350px] object-cover rounded-[12px]"
          />
        </div>
      </div>
      <div className="flex justify-center items-center mt-6 space-x-4 pagination">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`px-4 py-2 bg-white text-black border border-gray-300 rounded-md text-2xl ${
            currentQuestionIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {"<<"}
        </button>
        <span className="px-4 py-2 bg-gray-800 text-white rounded-md text-2xl">
          {currentQuestionIndex + 1}/{questions.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className={`px-4 py-2 bg-white text-black border border-gray-300 rounded-md text-2xl ${
            currentQuestionIndex === questions.length - 1
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

export default BiletAnswers;