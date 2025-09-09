import { BrowserRouter, Routes, Route } from "react-router-dom";
import CameraPage from "./components/CameraPage";
import ResultPage from "./components/ResultPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CameraPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
