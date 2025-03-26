/* eslint-disable react/prop-types */

const Savol = ({ text, timeLeft }) => {
  return (
    <div className="flex items-center justify-between text-white py-2 sm:py-[0.5rem] text-lg sm:text-[22px] font-bold px-2 sm:px-[1rem] bg-[#FFFFFF66] rounded-lg sm:rounded-[12px] mb-2 sm:mb-[1rem]">
      <span>{text}</span>
      {timeLeft !== null ? (
        <div className="bg-green-700 text-white rounded-full w-14 sm:w-18 h-14 sm:h-17 flex items-center justify-center border-2 border-green-500 text-sm sm:text-base">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      ) : (
        <div className="w-14 sm:w-18 h-14 sm:h-17" /> // Placeholder to maintain layout
      )}
    </div>
  );
};

export default Savol;