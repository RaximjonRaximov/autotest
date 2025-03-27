/* eslint-disable react/prop-types */

const Savol = ({ text, timeLeft }) => {
  return (
    <div className="flex items-center justify-between text-white py-2 sm:py-[0.5rem] text-lg sm:text-[22px] font-bold px-2 sm:px-[1rem] bg-[#FFFFFF66] rounded-lg sm:rounded-[12px] mb-2 sm:mb-[1rem] gap-2">
      <span className="flex-1 min-w-0">{text}</span>
      <div className="flex-shrink-0 bg-green-700 text-white rounded-full w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center border-2 border-green-500 text-sm sm:text-base">
        {timeLeft !== null ? (
          <span>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default Savol;