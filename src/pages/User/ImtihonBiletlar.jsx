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
        // Fetch tables
        const tablesResponse = await api.get("/tables/");
        const sortedTables = tablesResponse.data.tables.sort(
          (a, b) => a.id - b.id
        );

        // Fetch user results
        const resultsResponse = await api.get(`/user-correct/${userId}/`);
        setUserResults(resultsResponse.data);

        // Combine tables with results
        const tablesWithResults = sortedTables.map((table) => {
          const result = resultsResponse.data.find((r) => r.table === table.id);
          return {
            ...table,
            correct: result ? result.correct : 0,
            incorrect: result ? result.incorrect : 0,
          };
        });

        setTables(tablesWithResults);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Imtihon billetteri
      </h1>

      <div className="grid grid-cols-5 gap-4 max-w-4xl">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => handleBilet(table.id)}
            className="flex flex-col items-center justify-center space-x-3 py-3 px-6 rounded-lg shadow-md transition duration-300 hover:opacity-90 bg-gradient-to-b from-[#B4DFEF] to-[#38BEEF] text-black font-semibold"
          >
            {/* Table name */}
            <span>{table.name}</span>

            {/* Show counters only if the test has been taken (correct or incorrect is not 0) */}
            {table.correct !== 0 || table.incorrect !== 0 ? (
              <>
                <div className="flex space-x-5">
                  {/* Correct count with green dot */}
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                    <span>{table.correct}</span>
                  </div>

                  {/* Incorrect count with red dot */}
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                    <span>{table.incorrect}</span>
                  </div>
                </div>
              </>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImtihonBiletlar;
