import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Savol from "../../components/Savol";
import Javob from "../../components/Javob";
import { useLanguage } from "../../context/LanguageContext";

const Imtihon2050 = () => {
  const questionIds = useSelector((state) => state.cart.test);
  const testTuri = useSelector((state) => state.cart.testTuri); // testTuri ni Redux'dan olamiz
  const navigate = useNavigate();
  const { selectedLanguage } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [answerCorrectness, setAnswerCorrectness] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialTime = 25 * 60; // 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(initialTime);

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
        const questionPromises = questionIds.map((id) =>
          api.get(`/questions/${id}/`).then((res) => res.data)
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

    if (questionIds.length > 0) {
      fetchQuestions();
    }
  }, [questionIds, navigate]);

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
      const response = await api.get("/user-results/");
      const { correct, incorrect } = response.data;

      navigate("/user/imtihon2050natija", {
        state: {
          correct,
          incorrect,
          questionIds,
          answerCorrectness,
          questions,
          timeTaken,
        },
      });

      await clearDatabase();
    } catch (err) {
      console.error("Error fetching user results:", err);
      navigate("/user");
    }
  };

  if (loading) {
    return <div className="p-4 sm:p-6 text-white">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-4 sm:p-6 text-red-500">{error}</div>;
  }

  if (questionIds.length === 0 || questions.length === 0) {
    return (
      <div className="p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Imtihon 20/50</h1>
        <p>No questions available. Please select 20 or 50 questions.</p>
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

  // testTuri ga qarab dizaynni o'zgartirish
  const is20Questions = testTuri === "20";
  const is50Questions = testTuri === "50";

  // Full Grid Pagination komponenti (kompyuter uchun, rasmdagi kabi to'liq qator)
  const FullGridPagination = () => (
    <div className="flex sm:flex-row flex-col  justify-between items-center mb-4 sm:mb-6">
      <div className="flex flex-wrap gap-2 px-2 py-1">
        {questions.map((_, index) => {
          const questionId = questions[index]?.question?.id;
          const isAnswered = !!answeredQuestions[questionId];
          let buttonColorClass = "bg-white text-black border border-gray-300";

          if (currentQuestionIndex === index) {
            buttonColorClass = "bg-blue-500 text-white border border-blue-500";
          } else if (isAnswered) {
            buttonColorClass = answerCorrectness[questionId]
              ? "bg-green-500 text-white border border-green-500"
              : "bg-red-500 text-white border border-red-500";
          }

          return (
            <button
              key={index}
              onClick={() => handleQuestionChange(index)}
              className={`sm:w-10 sm:h-10 w-7.5 h-7.5 flex items-center justify-center ${buttonColorClass} text-sm  hover:bg-gray-200 transition-colors duration-200`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <button
        onClick={handleFinish}
        className="ml-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm sm:text-base transition-colors duration-200"
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
  );

  // Rasmdagi Pagination komponenti (50 ta savol, mobil uchun yuqorida)
  const SimplePagination = () => (
    <div className="flex flex-col space-y-2 mb-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => handleQuestionChange(currentQuestionIndex - 1)}
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
          onClick={() => handleQuestionChange(currentQuestionIndex + 1)}
          disabled={currentQuestionIndex === questions.length - 1}
          className={`w-10 h-10 flex items-center justify-center bg-white text-black border border-gray-300 rounded-md text-xl ${
            currentQuestionIndex === questions.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
          } transition-colors duration-200`}
        >
          {">>"}
        </button>
      </div>
      {/* Tugatish tugmasi paginationdan keyin */}
      <div className="flex justify-end">
        <button
          onClick={handleFinish}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm transition-colors duration-200"
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
    </div>
  );

  // Grid Pagination komponenti (50 ta savol, mobil uchun pastda)
  const BottomGridPagination = () => (
    <div className="flex flex-wrap gap-2 px-2 py-1 mt-4">
      {questions.map((_, index) => {
        const questionId = questions[index]?.question?.id;
        const isAnswered = !!answeredQuestions[questionId];
        let buttonColorClass = "bg-white text-black border border-gray-300";

        if (currentQuestionIndex === index) {
          buttonColorClass = "bg-blue-500 text-white border border-blue-500";
        } else if (isAnswered) {
          buttonColorClass = answerCorrectness[questionId]
            ? "bg-green-500 text-white border border-green-500"
            : "bg-red-500 text-white border border-red-500";
        }

        return (
          <button
            key={index}
            onClick={() => handleQuestionChange(index)}
            className={`w-7.5 h-7.5 flex items-center justify-center ${buttonColorClass} text-sm  hover:bg-gray-200 transition-colors duration-200`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen bg-[url(/loginBg.png)] bg-cover">
      {is20Questions || !is50Questions ? (
        // 20 ta savol yoki testTuri aniqlanmagan bo'lsa
        <>
          {/* Pagination yuqorida (rasmdagi kabi to'liq qator) */}
          <FullGridPagination />

          {/* Question Text and Timer */}
          <Savol text={questionText} timeLeft={timeLeft} />

          {/* Mobile: Picture and Answers (stacked) */}
          <div className="md:hidden">
            <div className="flex justify-center mb-4">
              <img
                src={imageUrl}
                alt="Question Image"
                className="w-full max-w-[350px] object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-2">
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

          {/* Desktop: Picture and Answers (side by side) */}
          <div className="hidden md:flex flex-col md:flex-row gap-4 sm:gap-6">
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
        </>
      ) : (
        // 50 ta savol bo'lsa
        <>
          {/* Mobile: Pagination yuqorida (rasmdagi kabi), Tugatish tugmasi undan keyin, grid pagination pastda */}
          <div className="md:hidden flex flex-col">
            {/* Pagination yuqorida (rasmdagi kabi) */}
            <SimplePagination />

            {/* Question Text and Timer */}
            <Savol text={questionText} timeLeft={timeLeft} />

            {/* Picture and Answers (stacked) */}
            <div className="flex justify-center mb-4">
              <img
                src={imageUrl}
                alt="Question Image"
                className="w-full max-w-[350px] object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-2 mb-4">
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

            {/* Grid Pagination eng pastda */}
            <BottomGridPagination />
          </div>

          {/* Desktop: Pagination yuqorida (rasmdagi kabi to'liq qator) */}
          <div className="hidden md:block">
            <FullGridPagination />

            {/* Question Text and Timer */}
            <Savol text={questionText} timeLeft={timeLeft} />

            {/* Picture and Answers (side by side) */}
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
        </>
      )}
    </div>
  );
};

export default Imtihon2050;