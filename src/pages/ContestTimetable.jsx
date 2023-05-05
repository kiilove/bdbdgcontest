import React, { useState } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";

import { MdTimeline } from "react-icons/md";

const ContestTimetable = () => {
  const [currentContestInfo, setCurrentContestInfo] = useState();
  const handleContestInfo = () => {};
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg p-3 gap-y-2">
      <div className="flex w-full h-14">
        <div className="flex w-full bg-gray-100 justify-start items-center rounded-lg px-3">
          <span className="font-sans text-lg font-semibold w-6 h-6 flex justify-center items-center rounded-2xl bg-blue-400 text-white mr-3">
            <MdTimeline />
          </span>
          <h1
            className="font-sans text-lg font-semibold"
            style={{ letterSpacing: "2px" }}
          >
            타임테이블
          </h1>
        </div>
      </div>
      <div className="flex w-full h-full"></div>
    </div>
  );
};

export default ContestTimetable;
