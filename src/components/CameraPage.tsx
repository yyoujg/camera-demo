import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const CameraPage = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  // face-api.js 모델 로드
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models");
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  // 얼굴 실시간 표시
  useEffect(() => {
    let interval: number;
    if (modelsLoaded && webcamRef.current) {
      const video = webcamRef.current.video as HTMLVideoElement;
      interval = window.setInterval(async () => {
        if (!video || video.paused || video.ended) return;
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks(true);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        resizedDetections.forEach((detection) => {
          const { x, y, width, height } = detection.detection.box;
          ctx.strokeStyle = "#0ff";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          faceapi.draw.drawFaceLandmarks(canvas, detection);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [modelsLoaded]);

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
      setFaceDetected(false);
      alert("얼굴을 인식하지 못했습니다. 다시 시도해주세요.");
    }

    setDetecting(false);
  };

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      navigate("/result", { state: { image: imageSrc } });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-800 p-4 text-white">
      <h1 className="text-3xl font-bold mb-6 drop-shadow-lg">Smart Check-In Demo</h1>

      {!modelsLoaded && (
        <p className="animate-pulse text-yellow-400 font-medium mb-4">
          모델 로딩 중...
        </p>
      )}

      {modelsLoaded && (
        <>
          <div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-2xl ring-4 ring-indigo-500">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-[480px] object-cover scale-x-[-1]"
              videoConstraints={{ facingMode: "user" }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full scale-x-[-1]"
            />
            {faceDetected && (
              <div className="absolute top-4 right-4 bg-green-500 px-3 py-1 rounded-full shadow-lg animate-pulse font-semibold">
                얼굴 인식 완료
              </div>
            )}
          </div>

          <button
            onClick={handleDetectFace}
            disabled={detecting}
            className={`mt-6 px-8 py-3 rounded-full font-bold shadow-lg transform transition-all duration-300
              ${detecting ? "bg-gray-500 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 active:scale-95"}`}
          >
            {detecting ? "인식 중..." : "얼굴 인식 후 촬영"}
          </button>

          {!faceDetected && !detecting && (
            <p className="mt-4 text-red-400 font-medium animate-pulse">
              얼굴을 화면에 맞춰주세요.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default CameraPage;
