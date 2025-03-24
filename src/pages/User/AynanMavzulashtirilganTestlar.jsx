import Javob from "../../components/Javob";
import Savol from "../../components/Savol";

function AynanMavzulashtirilganTestlar(id) {
  console.log(id);
  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundImage: `url('/loginBg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex justify-end items-center mb-[33px]">
        <button
          className="px-12 py-1 text-white font-regular rounded-lg text-[22px]
                 bg-[conic-gradient(from_-3.29deg_at_100%_-13%,#FFA502_0deg,#FF6348_360deg)] 
                 shadow-[0px_0px_30px_0px_#FF7F5080] transition-all duration-300 
                 hover:shadow-[0px_0px_40px_0px_#FF7F5080] hover:scale-105"
        >
          Test
        </button>
      </div>
      <Savol />
      <div className="flex">
        <div className="javoblar flex-1 space-y-5">
          <Javob />
        </div>
        <div className="rasm flex-1 ">
          <img
            src="/public/logo.png"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

export default AynanMavzulashtirilganTestlar;
