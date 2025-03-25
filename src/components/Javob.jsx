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