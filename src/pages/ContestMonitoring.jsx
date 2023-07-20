import React from "react";
import { useState } from "react";
import { TbHeartRateMonitor } from "react-icons/tb";
import {
  useFirestoreGetDocument,
  useFirestoreQuery,
} from "../hooks/useFirestores";
import { useContext } from "react";
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import { useEffect } from "react";
import { useFirebaseRealtimeAddData } from "../hooks/useFirebaseRealtime";

const ContestMonitoring = () => {
  const [contestData, setContestData] = useState([]);
  const [contestSchedule, setContestSchedule] = useState([]);
  const [judgeData, setJudgeData] = useState([]);

  const { currentContest } = useContext(CurrentContestContext);

  const contestDataQuery = useFirestoreQuery();
  const contestDataDocu = useFirestoreGetDocument("contest_data");

  const addCurrentStage = useFirebaseRealtimeAddData();

  const fetchPool = async () => {
    console.log(currentContest.contests.contestDataId);
    const returnContestData = await contestDataDocu.getDocument(
      currentContest.contests.contestDataId
    );

    console.log(returnContestData.schedule);
    if (returnContestData) {
      setContestSchedule(
        returnContestData.schedule.sort((a, b) => a.stageIndex - b.stageIndex)
      );
    }
  };

  const handleAddCurrentStage = async () => {
    const {
      contestCategoryId: categoryId,
      contestCategoryTitle: categoryTitle,
      contestGradeId: gradeId,
      contestGradeTitle: gradeTitle,
      stageId,
      stageNumber,
    } = contestSchedule[0];

    const currentStateInfo = {
      stageId,
      stageNumber,
      categoryId,
      categoryTitle,
      gradeId,
      gradeTitle,
    };
    const addedData = await addCurrentStage.addData(
      "currentStage",
      currentStateInfo,
      currentContest.contests.id
    );
    console.log("Added Data:", addedData);
  };

  useEffect(() => {
    fetchPool();
  }, [currentContest?.contests]);

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg p-3 gap-y-2 justify-start items-start">
      <div className="flex w-full h-14">
        <div className="flex w-full bg-gray-100 justify-start items-center rounded-lg px-3">
          <span className="font-sans text-lg font-semibold w-6 h-6 flex justify-center items-center rounded-2xl bg-blue-400 text-white mr-3">
            <TbHeartRateMonitor />
          </span>
          <h1
            className="font-sans text-lg font-semibold"
            style={{ letterSpacing: "2px" }}
          >
            대회모니터링
          </h1>
        </div>
      </div>
      <div className="flex w-full h-auto">
        <div className="flex w-full h-10 bg-gray-100 justify-start items-center rounded-lg px-3">
          <div className="flex w-1/6 h-full justify-end mr-5 items-center">
            모니터링
          </div>
          <div className="flex w-5/6 h-full justify-start ml-5 items-center">
            <button onClick={() => handleAddCurrentStage()}>대회시작</button>
          </div>
        </div>
      </div>
      <div className="flex w-full h-auto">
        <div className="flex w-full h-auto bg-gray-100 justify-start items-center rounded-lg px-3">
          <div className="flex w-1/6 h-full justify-end mr-5 items-center">
            대회타임테이블
          </div>
          <div className="flex w-5/6 h-full justify-start ml-5 items-center gap-y-2 flex-col py-3">
            {contestSchedule?.length > 0 &&
              contestSchedule.map((schedule, sIdx) => {
                const { contestCategoryTitle, contestGradeTitle } = schedule;
                return (
                  <div className="flex w-full bg-white rounded-lg h-10 p-2">
                    {contestCategoryTitle} ({contestGradeTitle})
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestMonitoring;
