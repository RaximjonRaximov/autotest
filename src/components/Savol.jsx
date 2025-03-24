/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext"; // Language context
import api from "../services/api";
import Javob from "./Javob";

function Savol({ id }) {
  const [question, setQuestion] = useState({});
  const { selectedLanguage } = useLanguage(); // Get selected language

  useEffect(() => {
    const getQuestions = async () => {
      if (!id) return; // Prevent API call if id is undefined
      try {
        const response = await api.get(`/questions/${id}/`);
        setQuestion(response.data);
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };
    getQuestions();
  }, [id]);

  const getQuestionText = () => {
    switch (selectedLanguage) {
      case "RU":
        return question.question?.LanRu || "Вопрос отсутствует";
      case "KK":
        return question.question?.LanKarakalpak || "Savol mavjud emas";
      case "УЗ":
        return question.question?.LanKrill || "Савол мавжуд эмас";
      default:
        return question.question?.LanUz;
    }
  };

  return (
    <div>
      {/* Question Display */}
      <div className="text-white py-[44px] text-[22px] font-bold pl-[84px] bg-[#FFFFFF66] rounded-[12px] mb-[54px]">
        <p>{getQuestionText()}</p>
      </div>

      <div className="flex space-x-4">
        {/* Answers List */}
        <div className="space-y-4 flex-1">
          {question.answers?.map((answer, index) => (
            <Javob
              key={answer.id}
              answer={answer}
              index={index}
            />
          ))}
        </div>
        <div className="flex-1 rounded-[12px]">
          <img
            src={question.question?.Image}
            alt="Image"
          />
        </div>
      </div>
    </div>
  );
}

export default Savol;
