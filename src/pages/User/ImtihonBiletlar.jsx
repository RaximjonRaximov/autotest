import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { cartActions } from "../../store";

const ImtihonBiletlar = () => {
  const [tables, setTables] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Assuming user ID 5 is the current user, make this dynamic if needed
  const userId = 5;

  const handleBilet = (id) => {
    navigate("/user/bilet-test", { replace: true });
    dispatch(cartActions.setCurrentBiletId(id));
  };

  useEffect(() => {
    const fetchData = async () => {
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
        Imthon billetteri
      </h1>

      <div className="grid grid-cols-5 gap-4 max-w-4xl">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => handleBilet(table.id)}
            className="flex flex-col items-center justify-center text-white space-x-2 py-3 px-6 rounded-lg shadow-md transition duration-300 hover:opacity-90 bg-gradient-to-b from-[#B4DFEF] to-[#38BEEF] text-black font-semibold"
          >
            {/* Table name */}
            <span>{table.name}</span>

            <div className="flex space-x-3">
              {/* Correct count with green dot */}
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                <span>{table.correct}</span>
              </div>

              {/* Incorrect count with red dot */}
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                <span>{table.incorrect}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImtihonBiletlar;
