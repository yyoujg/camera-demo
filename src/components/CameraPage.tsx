import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Webcam from "react-webcam"
import * as faceapi from "face-api.js"
import { MdCameraAlt, MdPerson, MdCheckCircle, MdWarning, MdFlashOn } from "react-icons/md"

const CameraPage = () => {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const navigate = useNavigate()

  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [faceConfidence, setFaceConfidence] = useState(0)

  // Canvas 마운트 확인용 useEffect
  useEffect(() => {
    if (canvasRef.current) {
      console.log('Canvas mounted:', canvasRef.current)
      console.log('Canvas dimensions:', canvasRef.current.offsetWidth, 'x', canvasRef.current.offsetHeight)
    }
  }, [])

  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log("AI 모델 로딩 시작...")
        setLoadingProgress(10)

        await faceapi.nets.tinyFaceDetector.loadFromUri("/models")
        setLoadingProgress(60)

        await faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models")
        setLoadingProgress(90)

        // Small delay for smooth animation
        setTimeout(() => {
          setLoadingProgress(100)
          setModelsLoaded(true)
          console.log("AI 모델 로딩 완료 ✅")
        }, 200)
      } catch (err) {
        console.error("모델 로딩 실패 ❌", err)
      }
    }
    loadModels()
  }, [])

  useEffect(() => {
    let interval: number
    if (modelsLoaded && webcamRef.current?.video) {
      const video = webcamRef.current.video as HTMLVideoElement
      interval = window.setInterval(async () => {
        if (!video || video.paused || video.ended) return

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks(true)

        const canvas = canvasRef.current
        if (!canvas) return

        // Canvas를 정방향 원으로 설정
        const containerSize = Math.min(canvas.offsetWidth, canvas.offsetHeight)
        canvas.width = containerSize
        canvas.height = containerSize

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          console.error('Canvas context not available')
          return
        }

        // Canvas 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 원형 인식 영역 그리기 (항상 표시) - 정방향 원, 더 안쪽으로
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const radius = canvas.width / 2 - 40 // 더 안쪽으로 이동 (패딩 증가)

        // 얼굴 인식 결과 처리
        const displaySize = { width: video.videoWidth, height: video.videoHeight }
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        // 인식률에 따른 시계방향 초록 채움
        if (resizedDetections.length > 0) {
          const maxConfidence = Math.max(...resizedDetections.map((d) => d.detection.score))
          const progressAngle = maxConfidence * 2 * Math.PI // 인식률을 각도로 변환

          // 먼저 전체 회색 원형을 그리기 (점선 패턴)
          ctx.strokeStyle = "#CCCCCC"
          ctx.lineWidth = 15
          ctx.setLineDash([5, 5])
          ctx.lineDashOffset = 0
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
          ctx.stroke()

          // 초록색 진행률 표시 - 회색 원형과 정확히 같은 패턴으로 덮어쓰기
          // 회색 원형이 0도에서 시작하므로, 초록색도 0도에서 시작하여 진행률만큼만 그리기
          ctx.strokeStyle = "#52C41A"
          ctx.lineWidth = 15
          ctx.setLineDash([5, 5])
          ctx.lineDashOffset = 0
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, progressAngle) // 0도에서 시작하여 진행률만큼
          ctx.stroke()

          // 얼굴 인식 상태 업데이트
          setFaceConfidence(maxConfidence)
          setFaceDetected(true)
        } else {
          // 얼굴이 감지되지 않았을 때만 회색 원형 표시
          ctx.strokeStyle = "#CCCCCC"
          ctx.lineWidth = 15
          ctx.setLineDash([5, 5])
          ctx.lineDashOffset = 0
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
          ctx.stroke()

          setFaceConfidence(0)
          setFaceDetected(false)
        }
      }, 100)
    }
    return () => clearInterval(interval)
  }, [modelsLoaded])

  // 3️⃣ 얼굴 인식 후 촬영
  const handleDetectFace = async () => {
    if (!webcamRef.current?.video || !modelsLoaded) return
    setDetecting(true)

    const video = webcamRef.current.video as HTMLVideoElement

    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())

    if (detection) {
      setFaceDetected(true)
      capture()
    } else {
      setFaceDetected(false)
    }

    setDetecting(false)
  }

  // 4️⃣ 사진 촬영 및 ResultPage 이동
  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      navigate("/result", { state: { image: imageSrc } })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-8 sm:p-12 flex flex-col items-center justify-center" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25">
            <MdFlashOn className="w-10 h-10 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Smart Check-In
            </h1>
            <p className="text-blue-300 text-xl font-medium mt-2">AI-powered face recognition</p>
          </div>
        </div>
      </div>

      {!modelsLoaded && (
        <div className="p-8 bg-slate-800/40 border border-slate-600/50 rounded-xl backdrop-blur-xl mb-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-400/30 border-t-blue-400"></div>
              <div className="absolute inset-0 rounded-full bg-blue-400/10 animate-pulse"></div>
            </div>
            <div>
              <span className="text-blue-200 font-semibold text-lg">AI 모델 초기화 중</span>
              <p className="text-slate-400 text-sm">얼굴 인식 엔진을 준비하고 있습니다...</p>
            </div>
          </div>
          <div className="relative w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-lg shadow-blue-500/30"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-slate-300 text-sm font-medium">{loadingProgress}% 완료</p>
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-sm font-medium">
              로딩 중
            </span>
          </div>
        </div>
      )}

      {modelsLoaded && (
        <>
          <div className="relative overflow-hidden bg-slate-800/20 border border-slate-600/30 rounded-full backdrop-blur-xl shadow-2xl mb-12 ring-1 ring-white/10 aspect-square w-64 h-64 mx-auto" style={{ zIndex: 1, maxWidth: '280px', margin: '0 auto' }}>
            <div className="relative w-full h-full ">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover scale-x-[-1] rounded-full"
                videoConstraints={{ facingMode: "user" }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 rounded-full pointer-events-none"
                style={{
                  backgroundColor: 'transparent',
                  zIndex: 10,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  aspectRatio: '1 / 1'
                }}
              />

              <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                <span
                  className={`${
                    faceDetected
                      ? "bg-green-500/90 hover:bg-green-600 shadow-lg shadow-green-500/25 animate-pulse"
                      : "bg-slate-700/90 border-slate-600"
                  } text-white font-semibold px-4 py-2 rounded-full backdrop-blur-sm inline-flex items-center gap-2`}
                >
                  {faceDetected ? <MdCheckCircle className="w-5 h-5" /> : <MdPerson className="w-5 h-5" />}
                  {faceDetected ? `얼굴 인식됨 (${Math.round(faceConfidence * 100)}%)` : "얼굴 감지 중..."}
                </span>
              </div>

              {!faceDetected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-blue-200">
                    <div className="relative mb-4">
                      <MdPerson className="w-16 h-16 mx-auto opacity-60" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-30"></div>
                    </div>
                    <p className="text-sm font-medium">원형 영역 안에 얼굴을</p>
                    <p className="text-sm font-medium">위치시켜 주세요</p>
                    <p className="text-xs text-slate-400 mt-1">인식률에 따라 초록색으로 채워집니다</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center space-y-6 w-full max-w-sm px-4">
            <button
              onClick={handleDetectFace}
              disabled={detecting}
              className={`w-full px-8 py-6 text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed ${
                detecting
                  ? "bg-slate-600 hover:bg-slate-600 cursor-not-allowed"
                  : faceDetected
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl shadow-green-500/30"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-xl shadow-blue-500/30"
              } text-white`}
            >
              <div className="flex items-center justify-center gap-3">
                {detecting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white/30 border-t-white"></div>
                    <span>AI 분석 중...</span>
                  </>
                ) : faceDetected ? (
                  <>
                    <MdCameraAlt className="w-6 h-6" />
                    <span>촬영하기</span>
                  </>
                ) : (
                  <>
                    <MdWarning className="w-6 h-6" />
                    <span>얼굴 인식 필요</span>
                  </>
                )}
              </div>
            </button>

            {!faceDetected && !detecting && (
              <div className="flex items-center justify-center gap-3 text-amber-300 bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                <MdWarning className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">원형 영역 안에 얼굴을 위치시켜 주세요</p>
              </div>
            )}

            {faceDetected && !detecting && (
              <div className="flex items-center justify-center gap-3 text-green-300 bg-green-500/10 rounded-xl p-4 border border-green-500/20 animate-pulse">
                <MdCheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  {faceConfidence > 0.8
                    ? "완벽합니다! 촬영 준비 완료"
                    : faceConfidence > 0.6
                    ? "좋습니다! 천천히 움직여주세요"
                    : "잠시만요... 계속 움직여주세요"}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CameraPage
