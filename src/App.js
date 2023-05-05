import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import ManagementHome from "./homes/ManagementHome";
import ContestInfo from "./pages/ContestInfo";
import ContestTimetable from "./pages/ContestTimetable";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/management" element={<ManagementHome />} />
        <Route
          path="/contestinfo"
          element={<ManagementHome children={<ContestInfo />} />}
        />
        <Route
          path="/contesttimetable"
          element={<ManagementHome children={<ContestTimetable />} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
