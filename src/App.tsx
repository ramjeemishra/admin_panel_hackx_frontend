import { Routes, Route } from "react-router-dom";
import UploadCSV from "./pages/UploadCSV";
import Filters from "./pages/Filters";
import LockScreen from "./pages/LockScreen";
import Admin from "./pages/Admin"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LockScreen />} />
      <Route path="/upload-csv" element={<UploadCSV />} />
      <Route path="/filters" element={<Filters/>}/>
      <Route path="/admin" element={<Admin/>}/>
    </Routes>
  );
}
