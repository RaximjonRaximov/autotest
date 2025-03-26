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

  const handleBilet = (id) => {
    navigate("/user/bilet-answers", { state: { tableId: id } });
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

        setTables(sortedTables);
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
        Imtihon biletlari javoblari
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 w-full sm:max-w-4xl px-4 sm:px-0">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => handleBilet(table.id)}
            className="py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition duration-300 hover:opacity-90 bg-gradient-to-b from-[#B4DFEF] to-[#38BEEF] text-black font-semibold text-sm sm:text-base"
          >
            <span>{table.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImtihonBiletlarJavoblari;