import { useLocation, useNavigate } from "react-router-dom";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const image = (location.state as { image: string })?.image;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 p-4 text-white">
      {image ? (
        <>
          <div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-2xl ring-4 ring-pink-500 animate-fadeIn">
            <img src={image} alt="captured" className="w-full object-cover" />
            <div className="absolute bottom-4 right-4 bg-green-500 px-3 py-1 rounded-full shadow-lg animate-pulse font-semibold">
              촬영 완료
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-8 py-3 rounded-full font-bold shadow-lg bg-pink-500 hover:bg-pink-600 active:scale-95 transform transition-all duration-300"
          >
            다시 찍기
          </button>
        </>
      ) : (
        <p className="text-red-400 font-semibold mt-4 animate-pulse">
          사진이 없습니다. 다시 시도해주세요.
        </p>
      )}
    </div>
  );
};

export default ResultPage;
