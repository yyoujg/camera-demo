import { BrowserRouter, Routes, Route } from "react-router-dom";
import CameraPage from "./components/CameraPage";
import ResultPage from "./components/ResultPage";
import "./App.css";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CameraPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
