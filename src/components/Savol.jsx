import React from 'react';

const Savol = ({ text, timeLeft }) => {
  return (
    <div className="flex items-center justify-between text-white py-[0.5rem] text-[22px] font-bold px-[1rem] bg-[#FFFFFF66] rounded-[12px] mb-[1rem]">
      <span>{text}</span>
      <div className="bg-green-700 text-white rounded-full w-18 h-17 flex items-center justify-center border-2 border-green-500">
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
};

export default Savol;