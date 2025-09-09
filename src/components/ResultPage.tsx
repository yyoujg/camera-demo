import { useLocation, useNavigate } from "react-router-dom";

 const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const image = (location.state as { image: string })?.image;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {image ? (
        <>
          <img
            src={image}
            alt="captured"
            className="w-full max-w-md rounded-lg shadow-lg"
          />
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow"
          >
            다시 찍기
          </button>
        </>
      ) : (
        <p>사진이 없습니다. 다시 시도해주세요.</p>
      )}
    </div>
  );
}

export default ResultPage;
