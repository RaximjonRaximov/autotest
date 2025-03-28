/* eslint-disable react/prop-types */

const MavzuTest = ({ title , onClick }) => {
  return (
    <div
    onClick={onClick}
    className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center h-30 w-full cursor-pointer hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-medium text-center">{title}</h3>
    </div>
  );
};

export default MavzuTest;