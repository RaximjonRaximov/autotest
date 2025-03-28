/* eslint-disable react/prop-types */

const Javob = ({ label, text, onClick, isSelected, isCorrect, isAnswered, showCorrect }) => {
  // Styling for the label part
  let labelBackgroundClass = 'bg-white text-black'; // Default label background
  if (showCorrect && isCorrect) {
    labelBackgroundClass = 'bg-green-500 text-white'; // Highlight correct answer before test starts
  } else if (isAnswered) {
    if (isSelected && !isCorrect) {
      labelBackgroundClass = 'bg-red-500 text-white'; // Incorrect selected answer
    } else if (isCorrect) {
      labelBackgroundClass = 'bg-green-500 text-white'; // Correct answer after answering
    }
  }

  // Styling for the text part
  let textBackgroundClass = 'bg-gray-200'; // Default text background
  if (showCorrect && isCorrect) {
    textBackgroundClass = 'bg-green-200'; // Highlight correct answer before test starts
  } else if (isAnswered) {
    if (isSelected && !isCorrect) {
      textBackgroundClass = 'bg-red-200'; // Incorrect selected answer
    } else if (isCorrect) {
      textBackgroundClass = 'bg-green-200'; // Correct answer after answering
    }
  }

  return (
    <div
      className={`flex items-stretch text-black rounded-lg mb-2 sm:mb-4 cursor-pointer ${isAnswered ? 'pointer-events-none' : ''}`}
      onClick={isAnswered ? null : onClick}
    >
      <span
        className={`flex items-center justify-center font-bold rounded-l-lg px-4 sm:px-6 py-2 sm:py-3 min-h-[48px] sm:min-h-[56px] ${labelBackgroundClass}`}
      >
        {label}
      </span>
      <span
        className={`px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base flex-1 rounded-r-lg min-h-[48px] sm:min-h-[56px] flex items-center ${textBackgroundClass}`}
      >
        {text}
      </span>
    </div>
  );
};

export default Javob;