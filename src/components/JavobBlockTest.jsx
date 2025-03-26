import React from 'react';

const JavobBlockTest = ({ label, text, onClick, isSelected, isAnswered, isAnswerCorrect, isUserAnswerCorrect }) => {
  // Styling for the label (F1, F2, etc.)
  let labelBackgroundClass = 'bg-white text-black'; // Default label background
  let textBackgroundClass = 'bg-gray-200'; // Default text background

  if (isSelected && !isAnswered) {
    // First click: highlight in yellow (changed to blue for consistency)
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
      className={`flex items-stretch text-black rounded-lg mb-2 sm:mb-4 cursor-pointer ${isAnswered ? 'pointer-events-none' : ''}`}
      onClick={isAnswered ? null : onClick}
    >
      <span
        className={`flex items-center justify-center font-bold rounded-l-lg px-2 sm:px-3 py-1 sm:py-2 h-full ${labelBackgroundClass}`}
      >
        {label}
      </span>
      <span
        className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base flex-1 rounded-r-lg ${textBackgroundClass}`}
      >
        {text}
      </span>
    </div>
  );
};

export default JavobBlockTest;