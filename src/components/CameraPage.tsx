import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

 const CameraPage = () => {
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  // face-api.js 모델 로드
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  // 얼굴 검출 실행
  const handleDetectFace = async () => {
    if (!webcamRef.current || !modelsLoaded) return;
    setDetecting(true);

    const video = webcamRef.current.video as HTMLVideoElement;
    if (!video) return;

    const detection = await faceapi.detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (detection) {
      setFaceDetected(true);
      capture();
    } else {
      alert("얼굴을 인식하지 못했습니다. 다시 시도해주세요.");
    }

    setDetecting(false);
  };

  // 사진 촬영 및 ResultPage로 이동
  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      navigate("/result", { state: { image: imageSrc } });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {modelsLoaded ? (
        <>
          {/* 카메라 미리보기 */}
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full max-w-md rounded-lg shadow-lg"
            videoConstraints={{ facingMode: "user" }}
          />

          {/* 얼굴 인식 버튼 */}
          <button
            onClick={handleDetectFace}
            disabled={detecting}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow"
          >
            {detecting ? "인식 중..." : "얼굴 인식 후 촬영"}
          </button>

          {faceDetected && (
            <p className="mt-2 text-green-600 font-medium">
              얼굴 인식 성공!
            </p>
          )}
        </>
      ) : (
        <p>모델 로딩 중...</p>
      )}
    </div>
  );
}


export default CameraPage;
