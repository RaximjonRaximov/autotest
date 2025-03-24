import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold text-red-500">Foydalanuvchi topilmadi!</h1>
        <p>Iltimos, tizimga kiring.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      <div className="space-y-4">
        <p className="text-lg">
          <span className="font-semibold">Foydalanuvchi ID:</span> {user.user_id}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Telefon raqami:</span> {user.phone_number}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Rol:</span> {user.role}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;