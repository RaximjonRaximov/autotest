/* eslint-disable react/prop-types */
import { useLanguage } from "../context/LanguageContext";

function Javob({ answer, index }) {
  const { selectedLanguage } = useLanguage();
  const optionLetters = ["A", "B", "C", "D"]; // Auto-generate labels

  const getAnswerText = () => {
    switch (selectedLanguage) {
      case "RU":
        return answer.LanRu;
      case "KK":
        return answer.LanKarakalpak;
      case "УЗ":
        return answer.LanKrill;
      default:
        return answer.LanUz;
    }
  };

  return (
    <div
      className={`flex items-center rounded-lg px-4 py-2 text-black ${
        answer.is_correct ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span className="bg-white text-black font-bold rounded-l-lg px-3 py-2">
        {optionLetters[index] || "?"}
      </span>
      <span className="px-4">{getAnswerText()}</span>
    </div>
  );
}

export default Javob;
