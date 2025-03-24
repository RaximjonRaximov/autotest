import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Savol from "../../components/Savol";
import api from "../../services/api";

function AynanMavzulashtirilganTestlar() {
  const id = useSelector((state) => state.cart.categoryId);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    const getQuestions = async () => {
      try {
        const response = await api.get(`/questions_by_category/${id}/`);
        setQuestions(response.data);
        setCurrentQuestion(response.data[0].id);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    getQuestions();
  }, [id]);
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
          className="px-12 py-1 text-white font-regular rounded-lg text-[22px]
                 bg-[conic-gradient(from_-3.29deg_at_100%_-13%,#FFA502_0deg,#FF6348_360deg)] 
                 shadow-[0px_0px_30px_0px_#FF7F5080] transition-all duration-300 
                 hover:shadow-[0px_0px_40px_0px_#FF7F5080] hover:scale-105"
        >
          Test
        </button>
      </div>
      <div className="sadg">
        <Savol id={currentQuestion} />
        
      </div>
    </div>
  );
}

export default AynanMavzulashtirilganTestlar;
