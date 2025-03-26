import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Savol from "../../components/Savol";
import Javob from "../../components/Javob";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

const BiletTest = () => {
  const id = useSelector((state) => state.cart.CurrentBiletId);
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [answerCorrectness, setAnswerCorrectness] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialTime = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const { user } = useAuth();
  const userId = user ? user.user_id : null;

  const clearDatabase = async () => {
    try {
      await api.get("/user-results/");
      console.log("Database cleared successfully on refresh");
    } catch (err) {
      console.error("Error clearing database on refresh:", err);
    }
  };

  const resetTest = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setAnsweredQuestions({});
    setAnswerCorrectness({});
    setTimeLeft(initialTime);
    setQuestions([]);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    resetTest();
    clearDatabase();

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const idResponse = await api.get(`/questionsId/${id}/`);
        const questionIds = idResponse.data.questions_id || [];

        if (!questionIds.length) {
          setError("No question IDs found for this Bilet.");
          setLoading(false);
          return;
        }

        const questionPromises = questionIds.map((questionId) =>
          api.get(`/questions/${questionId}/`).then((res) => res.data)
        );
        const questionData = await Promise.all(questionPromises);
        setQuestions(questionData);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          navigate("/login");
        } else {
          setError("Savollarni yuklashda xato yuz berdi");
          console.error("API xatosi:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuestions();
    }
  }, [id, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelect = async (questionId, answerId) => {
    if (answeredQuestions[questionId]) return;

    try {
      const response = await api.post("/submit-answer/", {
        question_id: questionId.toString(),
        answer_id: answerId.toString(),
      });
      const isCorrect = response.data.is_correct;

      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: answerId,
      }));

      setAnsweredQuestions((prev) => ({
        ...prev,
        [questionId]: true,
      }));

      setAnswerCorrectness((prev) => ({
        ...prev,
        [questionId]: isCorrect,
      }));
    } catch (err) {
      console.error("Error submitting answer:", err);
    }
  };

  const handleQuestionChange = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleFinish = async () => {
    try {
      const timeTaken = initialTime - timeLeft;
      const getResponse = await api.get("/user-results/");
      const { correct, incorrect } = getResponse.data;

      const postData = {
        user_id: userId,
        table_id: id,
        correct: correct,
        incorrect: 20 - correct,
      };

      const postResponse = await api.post("/save-correct/", postData);
      console.log("Save Results Response:", postResponse.data);

      navigate("/user/imtihon2050natija", {
        state: {
          correct,
          incorrect,
          questionIds: questions.map((q) => q.question.id),
          answerCorrectness,
          questions,
          timeTaken,
        },
      });
    } catch (error) {
      console.error("Error in handleFinish:", error);
    }
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
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Bilet Test</h1>
        <p>No questions available. Please select a valid Bilet ID.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionText = currentQuestion?.question
    ? selectedLanguage === "UZ"
      ? currentQuestion.question.LanUz
      : selectedLanguage === "УЗ"
      ? currentQuestion.question.LanKrill
      : selectedLanguage === "KK"
      ? currentQuestion.question.LanKarakalpak
      : currentQuestion.question.LanRu
    : "";

  const answers = currentQuestion?.answers || [];
  const imageUrl = currentQuestion?.question?.Image
    ? `${currentQuestion.question.Image}`
    : "/avtotest.jpg";

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen bg-[url(/loginBg.png)] bg-cover">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <div className="flex flex-wrap px-2 py-1 gap-1 sm:gap-2">
          {questions.map((_, index) => {
            const questionId = questions[index]?.question?.id;
            const isAnswered = !!answeredQuestions[questionId];
            let buttonColorClass = "bg-white text-black border";

            if (currentQuestionIndex === index) {
              buttonColorClass = "bg-blue-500 text-white border";
            } else if (isAnswered) {
              buttonColorClass = answerCorrectness[questionId]
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white";
            }

            return (
              <button
                key={index}
                onClick={() => handleQuestionChange(index)}
                className={`w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center ${buttonColorClass} text-sm sm:text-base`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleFinish}
          className="mt-2 sm:mt-0 ml-0 sm:ml-4 px-3 sm:px-4 py-1 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm sm:text-base"
        >
          {selectedLanguage === "UZ"
            ? "Tugatish"
            : selectedLanguage === "KK"
            ? "Ayaqtaý"
            : selectedLanguage === "УЗ"
            ? "Тугатиш"
            : "Закончить"}
        </button>
      </div>

      <Savol text={questionText} timeLeft={timeLeft} />

      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        <div className="flex-1">
          <div className="space-y-2 sm:space-y-4">
            {answers.map((answer, idx) => {
              const label = `F${idx + 1}`;
              const answerText =
                selectedLanguage === "UZ"
                  ? answer.LanUz
                  : selectedLanguage === "УЗ"
                  ? answer.LanKrill
                  : selectedLanguage === "KK"
                  ? answer.LanKarakalpak
                  : answer.LanRu;

              const isAnswered = !!answeredQuestions[currentQuestion.question.id];
              return (
                <Javob
                  key={answer.id}
                  label={label}
                  text={answerText}
                  onClick={() =>
                    handleAnswerSelect(currentQuestion.question.id, answer.id)
                  }
                  isSelected={
                    selectedAnswers[currentQuestion.question.id] === answer.id
                  }
                  isCorrect={answer.is_correct}
                  isAnswered={isAnswered}
                />
              );
            })}
          </div>
        </div>

        <div className="flex-1 mt-4 sm:mt-0">
          <img
            src={imageUrl}
            alt="Question Image"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default BiletTest;