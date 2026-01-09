import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UploadCSV from "./pages/UploadCSV";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/upload-csv" element={<UploadCSV />} />
    </Routes>
  );
}
