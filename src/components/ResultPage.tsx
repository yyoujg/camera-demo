import { useLocation, useNavigate } from "react-router-dom"
import { Camera, CheckCircle, RotateCcw, Download, Share2, Sparkles } from "lucide-react"

const ResultPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const image = (location.state as { image: string })?.image

  const handleDownload = () => {
    if (!image) return

    const link = document.createElement("a")
    link.href = image
    link.download = `smart-checkin-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (!image) return

    try {
      const response = await fetch(image)
      const blob = await response.blob()
      const file = new File([blob], "smart-checkin-capture.jpg", { type: "image/jpeg" })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Smart Check-In 얼굴 인식",
          text: "AI 얼굴 인식으로 촬영한 사진입니다!",
          files: [file],
        })
      } else {
        await navigator.clipboard.write([new ClipboardItem({ "image/jpeg": blob })])
        alert("🎉 이미지가 클립보드에 복사되었습니다!")
      }
    } catch (error) {
      console.error("Share failed:", error)
      alert("공유에 실패했습니다. 다시 시도해주세요.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 p-6 flex flex-col items-center justify-center">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="relative p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/25">
            <CheckCircle className="w-10 h-10 text-white" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              촬영 완료!
            </h1>
            <p className="text-green-300 text-xl font-medium mt-2">AI 얼굴 인식 성공 ✨</p>
          </div>
        </div>
      </div>

      {image ? (
        <>
          <div className="relative overflow-hidden bg-slate-800/20 border border-slate-600/30 rounded-xl backdrop-blur-xl shadow-2xl mb-10 ring-1 ring-white/10 group">
            <div className="relative w-full max-w-lg">
              <img
                src={image || "/placeholder.svg"}
                alt="AI 얼굴 인식 촬영 결과"
                className="w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute top-6 right-6">
                <span className="bg-green-500/90 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-green-500/25 animate-pulse backdrop-blur-sm inline-flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>인식 성공</span>
                </span>
              </div>

              <div className="absolute bottom-6 left-6">
                <span className="bg-slate-800/80 text-slate-200 font-medium px-3 py-2 rounded-full backdrop-blur-sm border border-slate-600/50">
                  📅 {new Date().toLocaleString("ko-KR")}
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl pointer-events-none"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg mb-8">
            <button
              onClick={() => navigate("/")}
              className="bg-slate-800/40 border border-slate-600/50 text-white hover:bg-slate-700/60 hover:text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              다시 촬영
            </button>

            <button
              onClick={handleDownload}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 px-6 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              다운로드
            </button>

            <button
              onClick={handleShare}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105 px-6 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              공유하기
            </button>
          </div>

          <div className="text-center bg-slate-800/20 rounded-xl p-4 border border-slate-600/30 backdrop-blur-sm">
            <p className="text-slate-300 text-sm font-medium">🔒 개인정보 보호</p>
            <p className="text-slate-400 text-xs mt-1">모든 이미지는 로컬에서만 처리되며 서버에 저장되지 않습니다</p>
          </div>
        </>
      ) : (
        <div className="p-10 bg-slate-800/40 border border-slate-600/50 rounded-xl backdrop-blur-xl text-center shadow-2xl">
          <div className="flex flex-col items-center gap-6">
            <div className="relative p-6 bg-red-500/20 rounded-2xl">
              <Camera className="w-12 h-12 text-red-400" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">이미지를 찾을 수 없습니다</h2>
              <p className="text-red-300 mb-8 text-lg">촬영된 사진이 없습니다. 카메라로 돌아가서 다시 시도해주세요.</p>
              <button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 rounded-xl text-white flex items-center justify-center gap-3 mx-auto"
              >
                <Camera className="w-6 h-6" />
                카메라로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultPage
