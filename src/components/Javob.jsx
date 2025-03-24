import React from 'react';

const Javob = ({ label, text, onClick, isSelected, isCorrect, isAnswered }) => {
  // Styling for the label (A, B, C)
  let labelBackgroundClass = 'bg-white text-black'; // Default label background
  if (isAnswered) {
    if (isSelected && !isCorrect) {
      labelBackgroundClass = 'bg-red-500 text-white'; // Incorrect selected answer
    } else if (isCorrect) {
      labelBackgroundClass = 'bg-green-500 text-white'; // Correct answer
    }
  }

  // Styling for the text part
  let textBackgroundClass = 'bg-gray-200'; // Default text background (like option C)
  if (isAnswered) {
    if (isSelected && !isCorrect) {
      textBackgroundClass = 'bg-red-200'; // Incorrect selected answer
    } else if (isCorrect) {
      textBackgroundClass = 'bg-green-200'; // Correct answer
    }
  }

  return (
    <div
      className={`flex items-center text-black rounded-lg mb-4 cursor-pointer ${textBackgroundClass} ${
        isAnswered ? 'pointer-events-none' : ''
      }`} // Disable clicks if answered
      onClick={isAnswered ? null : onClick}
    >
      <span
        className={`font-bold rounded-l-lg px-3 py-2 ${labelBackgroundClass}`}
      >
        {label}
      </span>
      <span className="px-4">{text}</span>
    </div>
  );
};

export default Javob;