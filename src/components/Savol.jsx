/* eslint-disable react/prop-types */


function Savol({ getQuestionText }) {
  return (
    <div className="text-white py-[44px] text-[22px] font-bold pl-[84px] bg-[#FFFFFF66] rounded-[12px] mb-[54px]">
      <p>{getQuestionText()}</p>
    </div>
  );
}

export default Savol;
