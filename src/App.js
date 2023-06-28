import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import ManagementHome from "./homes/ManagementHome";
import ContestInfo from "./pages/ContestInfo";
import ContestTimetable from "./pages/ContestTimetable";
import { CurrentContestProvider } from "./contexts/CurrentContestContext";
import NewContest from "./pages/NewContest";
import ContestInvoiceTable from "./pages/ContestInvoiceTable";
import ContestPlayerOrderTable from "./pages/ContestPlayerOrderTable";

function App() {
  return (
    <CurrentContestProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/management" element={<ManagementHome />} />
          <Route
            path="/newcontest"
            element={<ManagementHome children={<NewContest />} />}
          />
          <Route
            path="/contestinfo/"
            element={<ManagementHome children={<ContestInfo />} />}
          />
          <Route
            path="/contesttimetable"
            element={<ManagementHome children={<ContestTimetable />} />}
          />
          <Route
            path="/contestinvoicetable"
            element={<ManagementHome children={<ContestInvoiceTable />} />}
          />
          <Route
            path="/contestplayerordertable"
            element={<ManagementHome children={<ContestPlayerOrderTable />} />}
          />
        </Routes>
      </BrowserRouter>
    </CurrentContestProvider>
  );
}

export default App;
