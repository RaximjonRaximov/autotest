import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { cartActions } from "../../store";
import { useAuth } from "../../context/AuthContext";

const ImtihonBiletlar = () => {
  const [tables, setTables] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useAuth();
  const userId = user ? user.user_id : null;

  const handleBilet = (id) => {
    navigate("/user/bilet-test", { replace: true });
    dispatch(cartActions.setCurrentBiletId(id));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError("Foydalanuvchi topilmadi. Iltimos, tizimga kiring.");
        setLoading(false);
        return;
      }

      try {
        const tablesResponse = await api.get("/tables/");
        const sortedTables = Array.isArray(tablesResponse.data.tables)
          ? tablesResponse.data.tables.sort((a, b) => a.id - b.id)
          : [];

        const resultsResponse = await api.get(`/user-correct/${userId}/`);
        const results = Array.isArray(resultsResponse.data)
          ? resultsResponse.data
          : [];
        setUserResults(results);

        const tablesWithResults = sortedTables.map((table) => {
          const result = results.find((r) => r.table === table.id);
          return {
            ...table,
            correct: result ? result.correct : 0,
            incorrect: result ? result.incorrect : 0,
          };
        });

        setTables(tablesWithResults);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Noma'lum xato yuz berdi"
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-base sm:text-lg text-gray-600">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-base sm:text-lg text-red-600">Xato: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-4 sm:py-8">
      <h1 className="text-xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">
        Imtihon biletlari
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 w-full sm:max-w-4xl px-4 sm:px-0">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => handleBilet(table.id)}
            className="flex flex-col items-center justify-center py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition duration-300 hover:opacity-90 bg-gradient-to-b from-[#B4DFEF] to-[#38BEEF] text-black font-semibold text-sm sm:text-base"
          >
            <span>{table.name}</span>
            {table.correct !== 0 || table.incorrect !== 0 ? (
              <div className="flex space-x-2 sm:space-x-5 mt-1 sm:mt-0">
                <div className="flex items-center space-x-1">
                  <span className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full inline-block"></span>
                  <span>{table.correct}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full inline-block"></span>
                  <span>{table.incorrect}</span>
                </div>
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImtihonBiletlar;