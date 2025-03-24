// /src/pages/User/Imtihon2050.jsx
import { useSelector } from 'react-redux';

const Imtihon2050 = () => {
  const questionIds = useSelector((state) => state.cart.test);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4 bg-amber-900 h-[40rem]">Imtihon 20/50</h1>
    </div>
  );
};

export default Imtihon2050; 