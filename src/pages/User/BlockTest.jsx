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
  const [answerCorrectness, setAnswerCorrectness] = useState({}); // Tracks if the user's selected answer is correct
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialTime = 25 * 60; // 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // Function to clear the database
  const clearDatabase = async () => {
    try {
      await api.post('/user-results/reset/'); // Assumed endpoint to clear the database
      console.log('Database cleared successfully on refresh');
    } catch (err) {
      console.error('Error clearing database on refresh:', err);
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

  // Run on component mount (happens on every refresh)
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

  // Handle answer click (first click: highlight, second click: submit)
  const handleAnswerClick = async (questionId, answerId) => {
    if (answeredQuestions[questionId]) return;

    if (selectedAnswers[questionId] === answerId) {
      // Second click on the same answer: submit to API
      try {
        const response = await api.post('/submit-answer/', {
          question_id: questionId.toString(),
          answer_id: answerId.toString(),
        });
        console.log('Submit Answer Response:', response.data);

        const isCorrect = response.data.is_correct;

        setAnsweredQuestions((prev) => ({
          ...prev,
          [questionId]: true,
        }));

        setAnswerCorrectness((prev) => ({
          ...prev,
          [questionId]: isCorrect,
        }));
      } catch (err) {
        console.error('Error submitting answer:', err);
      }
    } else {
      // First click: highlight the answer in yellow
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: answerId,
      }));
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
      const response = await api.get('/user-results/');
      console.log('User Results Response:', response.data);

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
    return <div className="p-6 text-white">Yuklanmoqda...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (questionIds.length === 0 || questions.length === 0) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Blok Test</h1>
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
    ? `https://django-avtotest.onrender.com${currentQuestion.question.Image}`
    : '/avtotest.jpg';

  return (
    <div className="p-6 text-white min-h-screen bg-[url(/loginBg.png)] bg-cover">
      <div className="flex justify-between items-center mb-6">
        <div className="flex px-2 py-1">
          {questionIds.map((_, index) => {
            const questionId = questions[index]?.question?.id;
            const isAnswered = !!answeredQuestions[questionId];
            let buttonColorClass = 'bg-white text-black border';

            if (currentQuestionIndex === index) {
              buttonColorClass = 'bg-blue-500 text-white border';
            } else if (isAnswered) {
              buttonColorClass = answerCorrectness[questionId]
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white';
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

      <Savol text={questionText} timeLeft={timeLeft} />

      <div className="flex justify-between flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="space-y-4">
            {answers.map((answer, idx) => {
              const label = `F${idx + 1}`; // Change label to F1, F2, F3, ...
              const answerText = selectedLanguage === 'UZ'
                ? answer.LanUz
                : selectedLanguage === 'УЗ'
                ? answer.LanKrill
                : selectedLanguage === 'KK'
                ? answer.LanKarakalpak
                : answer.LanRu;

              const isSelected = selectedAnswers[currentQuestion.question.id] === answer.id;
              const isAnswered = !!answeredQuestions[currentQuestion.question.id];
              const isAnswerCorrect = answer.is_correct; // Whether this specific answer is correct
              const isUserAnswerCorrect = answerCorrectness[currentQuestion.question.id]; // Whether the user's selected answer is correct

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

export default BlockTest;