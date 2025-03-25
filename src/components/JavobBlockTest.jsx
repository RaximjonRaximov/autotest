import React from 'react';

const JavobBlockTest = ({ label, text, onClick, isSelected, isAnswered, isAnswerCorrect, isUserAnswerCorrect }) => {
  // Styling for the label (A, B, C)
  let labelBackgroundClass = 'bg-white text-black'; // Default label background
  let textBackgroundClass = 'bg-gray-200'; // Default text background

  if (isSelected && !isAnswered) {
    // First click: highlight in yellow
    labelBackgroundClass = 'bg-blue-500 text-black';
    textBackgroundClass = 'bg-blue-200';
  } else if (isAnswered) {
    if (isAnswerCorrect) {
      // This answer is the correct one, highlight in green
      labelBackgroundClass = 'bg-green-500 text-white';
      textBackgroundClass = 'bg-green-200';
    } else if (isSelected && !isUserAnswerCorrect) {
      // This answer was selected by the user and is incorrect, highlight in red
      labelBackgroundClass = 'bg-red-500 text-white';
      textBackgroundClass = 'bg-red-200';
    } else {
      // This answer is neither the correct one nor the selected one, keep default styling
      labelBackgroundClass = 'bg-white text-black';
      textBackgroundClass = 'bg-gray-200';
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

export default JavobBlockTest;