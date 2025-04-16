import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Savol from '../../components/Savol';
import JavobBlockTest from '../../components/JavobBlockTest';
import { useLanguage } from '../../context/LanguageContext';

const BlockTest = () => {
  const questionIds = useSelector((state) => state.cart.test);
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

  const clearDatabase = async () => {
    try {
      await api.post('/user-results/reset/');
      console.log('Database cleared successfully on refresh');
    } catch (err) {
      console.error('Error clearing database on refresh:', err);
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
          navigate('/login');
        } else {
          setError('Savollarni yuklashda xato yuz berdi');
          console.error('API xatosi:', err);
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

  // Helper function to find the next unanswered question
  const findNextUnansweredQuestion = (currentIndex) => {
    for (let i = currentIndex + 1; i < questions.length; i++) {
      const questionId = questions[i]?.question?.id;
      if (!answeredQuestions[questionId]) {
        return i;
      }
    }
    // If no unanswered question is found after the current index, check from the beginning
    for (let i = 0; i < currentIndex; i++) {
      const questionId = questions[i]?.question?.id;
      if (!answeredQuestions[questionId]) {
        return i;
      }
    }
    // If all questions are answered, return the current index
    return currentIndex;
  };

  const handleAnswerClick = async (questionId, answerId) => {
    if (answeredQuestions[questionId]) return;

    if (selectedAnswers[questionId] === answerId) {
      try {
        const response = await api.post('/submit-answer/', {
          question_id: questionId.toString(),
          answer_id: answerId.toString(),
        });
        const isCorrect = response.data.is_correct;

        setAnsweredQuestions((prev) => ({
          ...prev,
          [questionId]: true,
        }));

        setAnswerCorrectness((prev) => ({
          ...prev,
          [questionId]: isCorrect,
        }));

        // Automatically move to the next unanswered question after 2 seconds
        setTimeout(() => {
          const nextIndex = findNextUnansweredQuestion(currentQuestionIndex);
          setCurrentQuestionIndex(nextIndex);
        }, 2000); // 2-second delay
      } catch (err) {
        console.error('Error submitting answer:', err);
      }
    } else {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: answerId,
      }));
    }
  };

  const handleQuestionChange = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleFinish = async () => {
    try {
      const timeTaken = initialTime - timeLeft;
      const response = await api.get('/user-results/');
      const { correct, incorrect } = response.data;

      navigate('/user/imtihon2050natija', {
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
      console.error('Error fetching user results:', err);
      navigate('/user');
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
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Blok Test</h1>
        <p>No questions available. Please select questions.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionText = currentQuestion?.question
    ? selectedLanguage === 'UZ'
      ? currentQuestion.question.LanUz
      : selectedLanguage === 'УЗ'
      ? currentQuestion.question.LanKrill
      : selectedLanguage === 'KK'
      ? currentQuestion.question.LanKarakalpak
      : currentQuestion.question.LanRu
    : '';

  const answers = currentQuestion?.answers || [];
  const imageUrl = currentQuestion?.question?.Image
    ? `${currentQuestion.question.Image}`
    : '/avtotest.jpg';

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen bg-[url(/loginBg.png)] bg-cover">
      {/* Pagination and Finish Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-1 sm:gap-1 px-2 py-1">
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
                className={`w-8 sm:w-12 h-8 sm:h-12 flex items-center justify-center ${buttonColorClass} text-sm sm:text-base`}
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

            const isSelected = selectedAnswers[currentQuestion.question.id] === answer.id;
            const isAnswered = !!answeredQuestions[currentQuestion.question.id];
            const isAnswerCorrect = answer.is_correct;
            const isUserAnswerCorrect = answerCorrectness[currentQuestion.question.id];

            return (
              <JavobBlockTest
                key={answer.id}
                label={label}
                text={answerText}
                onClick={() => handleAnswerClick(currentQuestion.question.id, answer.id)}
                isSelected={isSelected}
                isAnswered={isAnswered}
                isAnswerCorrect={isAnswerCorrect}
                isUserAnswerCorrect={isUserAnswerCorrect}
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

              const isSelected = selectedAnswers[currentQuestion.question.id] === answer.id;
              const isAnswered = !!answeredQuestions[currentQuestion.question.id];
              const isAnswerCorrect = answer.is_correct;
              const isUserAnswerCorrect = answerCorrectness[currentQuestion.question.id];

              return (
                <JavobBlockTest
                  key={answer.id}
                  label={label}
                  text={answerText}
                  onClick={() => handleAnswerClick(currentQuestion.question.id, answer.id)}
                  isSelected={isSelected}
                  isAnswered={isAnswered}
                  isAnswerCorrect={isAnswerCorrect}
                  isUserAnswerCorrect={isUserAnswerCorrect}
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

export default BlockTest;