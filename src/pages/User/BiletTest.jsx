import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Savol from "../../components/Savol";
import Javob from "../../components/Javob";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

const BiletTest = () => {
  const id = useSelector((state) => state.cart.CurrentBiletId); // Single ID from Redux
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage();
  const [questions, setQuestions] = useState([]); // Array of question objects
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [answerCorrectness, setAnswerCorrectness] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialTime = 25 * 60; // 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const {user} = useAuth();
  const userId = user ? user.user_id : null;

  // Function to clear the database
  const clearDatabase = async () => {
    try {
      await api.get("/user-results/");
      console.log("Database cleared successfully on refresh");
    } catch (err) {
      console.error("Error clearing database on refresh:", err);
    }
  };

  // Function to reset all test-related states
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

  // Fetch questions based on CurrentBiletId
  useEffect(() => {
    resetTest();
    clearDatabase();

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Fetch the question IDs
        const idResponse = await api.get(`/questionsId/${id}/`);
        console.log("ID Response:", idResponse.data);
        const questionIds = idResponse.data.questions_id || [];

        if (!questionIds.length) {
          setError("No question IDs found for this Bilet.");
          setLoading(false);
          return;
        }

        // Step 2: Fetch full question details for each ID
        const questionPromises = questionIds.map((questionId) =>
          api.get(`/questions/${questionId}/`).then((res) => res.data)
        );
        const questionData = await Promise.all(questionPromises);
        console.log("Fetched Questions:", questionData);
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

  // Timer logic
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

  // Handle answer selection and submit to backend
  const handleAnswerSelect = async (questionId, answerId) => {
    if (answeredQuestions[questionId]) return;

    try {
      const response = await api.post("/submit-answer/", {
        question_id: questionId.toString(),
        answer_id: answerId.toString(),
      });
      console.log("Submit Answer Response:", response.data);

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

  // Handle navigation between questions
  const handleQuestionChange = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Handle finishing the test
  const handleFinish = async () => {
    try {
      const timeTaken = initialTime - timeLeft;
  
      // First get the user results
      const getResponse = await api.get("/user-results/");
      console.log("User Results Response:", getResponse.data);
      const { correct, incorrect } = getResponse.data;
  
      // Prepare data for POST request
      const postData = {
        user_id: userId,
        table_id: id,
        correct: correct,
        incorrect: 20 - correct  
      };
  
      // Save the results
      const postResponse = await api.post("/save-correct/", postData);
      console.log("Save Results Response:", postResponse.data);
  
      console.log("userId", userId);
      console.log("correct", correct);
      console.log("incorrect", 20 - correct);
      console.log("tableId", id);
  
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
      // Handle error appropriately
    }
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
        <h1 className="text-2xl font-bold mb-4">Bilet Test</h1>
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
    <div className="p-6 text-white min-h-screen bg-[url(/loginBg.png)] bg-cover">
      <div className="flex justify-between items-center mb-6">
        <div className="flex px-2 py-1">
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
                className={`mx-[0.05rem] w-12 h-12 flex items-center justify-center ${buttonColorClass}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleFinish}
          className="ml-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Tugatish
        </button>
      </div>

      <Savol
        text={questionText}
        timeLeft={timeLeft}
      />

      <div className="flex justify-between flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="space-y-4">
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

              const isAnswered =
                !!answeredQuestions[currentQuestion.question.id];
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

        <div className="flex-1">
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
