import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { cartActions } from "../../store";
import { useAuth } from "../../context/AuthContext";

const ImtihonBiletlarJavoblari = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useAuth();
  const userId = user ? user.user_id : null;
  console.log("User object:", user);
  console.log("userId:", userId);

  const handleBilet = (id) => {
    // Navigate to the new answers page with tableId and set it in Redux
    navigate("/user/bilet-answers", { state: { tableId: id } });
    dispatch(cartActions.setCurrentBiletId(id));
    console.log(`[handleBilet] Navigating to /user/bilet-answers with tableId: ${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        console.log("No userId, skipping fetch.");
        setError("Foydalanuvchi topilmadi. Iltimos, tizimga kiring.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching tables...");
        const tablesResponse = await api.get("/tables/");
        console.log("Tables response:", tablesResponse.data);
        const sortedTables = Array.isArray(tablesResponse.data.tables)
          ? tablesResponse.data.tables.sort((a, b) => a.id - b.id)
          : [];
        if (!sortedTables.length) {
          console.warn("No tables found in response.");
        }

        setTables(sortedTables);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err.response ? err.response : err);
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
        <p className="text-lg text-gray-600">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-red-600">Xato: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Imtihon biletlari javoblari
      </h1>

      <div className="grid grid-cols-5 gap-4 max-w-4xl">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => handleBilet(table.id)}
            className="py-3 px-6 rounded-lg shadow-md transition duration-300 hover:opacity-90 bg-gradient-to-b from-[#B4DFEF] to-[#38BEEF] text-black font-semibold"
          >
            <span>{table.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImtihonBiletlarJavoblari;