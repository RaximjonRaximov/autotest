import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Savol from '../../components/Savol';
import Javob from '../../components/Javob';
import { useLanguage } from '../../context/LanguageContext';

const Imtihon2050 = () => {
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
  const initialTime = 25 * 60; // 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // Function to clear the database
  const clearDatabase = async () => {
    try {
      await api.get('/user-results/'); // Assumed endpoint to clear the database
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
    // Reset all states
    resetTest();

    // Clear the database
    clearDatabase();

    // Fetch questions after resetting
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
  }, [questionIds, navigate]); // Dependencies ensure this runs on mount and when questionIds or navigate change

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
  }, []); // Empty dependency array ensures the timer starts fresh on mount

  // Handle answer selection and submit to backend
  const handleAnswerSelect = async (questionId, answerId) => {
    if (answeredQuestions[questionId]) return;

    try {
      const response = await api.post('/submit-answer/', {
        question_id: questionId.toString(),
        answer_id: answerId.toString(),
      });
      console.log('Submit Answer Response:', response.data);

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
      console.error('Error submitting answer:', err);
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

      // Clear the database after fetching results
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
        <h1 className="text-2xl font-bold mb-4">Imtihon 20/50</h1>
        <p>No questions available. Please select 20 or 50 questions.</p>
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
          {selectedLanguage === "UZ"
            ? "Tugatish"
            : selectedLanguage === "KK"
            ? "Ayaqtaý"
            : selectedLanguage === "УЗ"
            ? "Тугатиш"
            : selectedLanguage === "RU"
            ? "Закончить"
            : ""}
        </button>
      </div>

      <Savol text={questionText} timeLeft={timeLeft} />

      <div className="flex  justify-between flex-col md:flex-row gap-6">
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

              const isAnswered = !!answeredQuestions[currentQuestion.question.id];
              return (
                <Javob
                  key={answer.id}
                  label={label}
                  text={answerText}
                  onClick={() => handleAnswerSelect(currentQuestion.question.id, answer.id)}
                  isSelected={selectedAnswers[currentQuestion.question.id] === answer.id}
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

export default Imtihon2050;