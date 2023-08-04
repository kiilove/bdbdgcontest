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
import {
  useFirebaseRealtimeAddData,
  useFirebaseRealtimeGetDocument,
  useFirebaseRealtimeQuery,
  useFirebaseRealtimeUpdateData,
} from "../hooks/useFirebaseRealtime";
import { useNavigate } from "react-router-dom";

const ContestMonitoring = () => {
  const { currentContest } = useContext(CurrentContestContext);
  const [isRefresh, setIsRefresh] = useState(false);
  const [contestData, setContestData] = useState([]);
  const [contestSchedule, setContestSchedule] = useState([]);
  const [judgeData, setJudgeData] = useState([]);
  const [currentState, setCurrentState] = useState({ stageId: null });
  const navigate = useNavigate();

  const fetchStages = useFirestoreGetDocument("contest_stages_assign");

  const {
    data: realtimeData,
    error: realtimeError,
    getDocument: realtimeGetDocument,
  } = useFirebaseRealtimeGetDocument();

  const addCurrentStage = useFirebaseRealtimeAddData();
  const updateCurrentStage = useFirebaseRealtimeUpdateData();

  const fetchPool = async () => {
    const returnContestStage = await fetchStages.getDocument(
      currentContest.contests.contestStagesAssignId
    );

    //console.log(returnContestData.schedule);
    if (returnContestStage) {
      setContestSchedule(
        returnContestStage.stages.sort((a, b) => a.stageNumber - b.stageNumber)
      );
    }
  };

  const handleGradeInfo = (grades) => {
    let gradeTitle = "";
    let gradeId = "";

    if (grades?.length === 0) {
      gradeTitle = "오류발생";
      gradeId = "";
    }
    if (grades.length === 1) {
      gradeTitle = grades[0].gradeTitle;
      gradeId = grades[0].gradeId;
    } else if (grades.length > 1) {
      const madeTitle = grades.map((grade, gIdx) => {
        return grade.gradeTitle + " ";
      });
      gradeId = grades[0].gradeId;
      gradeTitle = madeTitle + "통합";
    }

    return { gradeTitle, gradeId };
  };

  const handleAddCurrentStage = async () => {
    const {
      stageId,
      stageNumber,
      categoryJudgeCount,
      categoryId,
      categoryTitle,
      grades,
    } = contestSchedule[0];

    const gradeTitle = handleGradeInfo(grades).gradeTitle;
    const gradeId = handleGradeInfo(grades).gradeId;

    const judgeInitState = Array.from(
      { length: categoryJudgeCount },
      (_, jIdx) => jIdx + 1
    ).map((number) => {
      return { seatIndex: number, isLogined: false, isEnd: false };
    });

    const currentStateInfo = {
      stageId,
      stageNumber,
      categoryTitle,
      gradeId,
      gradeTitle,
      judges: judgeInitState,
    };
    const addedData = await addCurrentStage.addData(
      "currentStage",
      currentStateInfo,
      currentContest.contests.id
    );
    setCurrentState({ ...addedData });
    console.log("Added Data:", addedData);
  };

  const handleStartMonitoring = (collectionName, documentId) => {
    realtimeGetDocument(collectionName, documentId);
  };

  const handleGotoSummary = (categoryId, categoryTitle, grades) => {
    navigate("/contestranksummary", {
      state: { categoryId, categoryTitle, grades },
    });
  };

  const handleStatgeInfo = (stageId) => {};

  const handleUpdateMonitoring = async (
    collectionName,
    documentId,
    stageIndex
  ) => {
    const {
      stageId,
      stageNumber,
      categoryJudgeCount,
      categoryId,
      categoryTitle,
      grades,
    } = contestSchedule[stageIndex + 1];

    const gradeTitle = handleGradeInfo(grades).gradeTitle;
    const gradeId = handleGradeInfo(grades).gradeId;

    const judgeInitState = Array.from(
      { length: categoryJudgeCount },
      (_, jIdx) => jIdx + 1
    ).map((number) => {
      return { seatIndex: number, isLogined: false, isEnd: false };
    });

    const currentStateInfo = {
      stageId,
      stageNumber,
      categoryTitle,
      gradeTitle,
      judges: judgeInitState,
    };
    const updatedData = await updateCurrentStage.updateData(
      collectionName,
      documentId,
      currentStateInfo
    );
    setCurrentState({ ...updatedData });
    console.log("Updated Data:", updatedData);
    setIsRefresh(!isRefresh);
  };
  useEffect(() => {
    let isMounted = true; // 컴포넌트 마운트 상태를 추적하는 플래그 추가

    isMounted && fetchPool();

    // cleanup 함수에서 마운트 상태 플래그를 false로 설정
    return () => {
      isMounted = false;
    };
  }, [currentContest?.contests]);

  useEffect(() => {
    realtimeGetDocument("currentStage", currentContest?.contests?.id);
  }, [isRefresh]);

  useEffect(() => {
    console.log(realtimeData?.stageId);
    setCurrentState(realtimeData);
  }, [realtimeData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefresh((prevIsRefresh) => !prevIsRefresh);
    }, 1000); // 1000 milliseconds = 1 second

    // clean up function
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    console.log(currentState);
  }, [currentState]);

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg p-3 gap-y-2 justify-start items-start">
      <div className="flex w-full h-14">
        <div className="flex w-full bg-gray-100 justify-start items-center rounded-lg px-3">
          <div className="flex w-1/2">
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
          <div className="flex w-1/2 h-full justify-start ml-5 items-center">
            {!currentState?.stageId && (
              <button
                onClick={() => handleAddCurrentStage()}
                className="w-auto h-10 px-5 bg-blue-200"
              >
                모니터링 데이터생성
              </button>
            )}
            {currentState?.stageId && <span>실시간 모니터링중...</span>}
          </div>
        </div>
      </div>

      <div className="flex w-full h-auto">
        <div className="flex w-full h-auto bg-gray-100 justify-start items-center rounded-lg px-3">
          <div className="flex w-full h-full justify-start items-center gap-y-2 flex-col py-3">
            {contestSchedule?.length > 0 &&
              contestSchedule.map((schedule, sIdx) => {
                const {
                  categoryTitle,
                  categoryId,
                  grades,
                  stageId,
                  stageNumber,
                } = schedule;

                const gradeTitle = handleGradeInfo(grades).gradeTitle;

                const findIndex = contestSchedule.findIndex(
                  (f) => f.stageId === stageId
                );
                return (
                  <div className="flex flex-col w-full h-auto">
                    <div
                      className={`${
                        stageId === currentState?.stageId
                          ? "flex w-full bg-blue-200 rounded-lg h-10 p-2"
                          : "flex w-full bg-white rounded-lg h-10 p-2"
                      }`}
                    >
                      <div className="flex w-4/6">
                        {categoryTitle} ({gradeTitle})
                      </div>
                      <div className="flex w-1/6">
                        {stageId === currentState?.stageId && (
                          <button
                            onClick={() =>
                              handleUpdateMonitoring(
                                "currentStage",
                                currentState.id,
                                findIndex
                              )
                            }
                          >
                            완료
                          </button>
                        )}
                      </div>
                      <div className="flex w-1/6">
                        <button
                          onClick={() =>
                            handleGotoSummary(categoryId, categoryTitle, grades)
                          }
                        >
                          집계표
                        </button>
                      </div>
                    </div>
                    <div className="flex w-full h-auto">
                      {stageId === currentState?.stageId && (
                        <div className="flex justify-start items-center h-20 w-full">
                          {currentState.judges.map((judge, jIdx) => {
                            const { isEnd, isLogined, seatIndex } = judge;

                            return (
                              <div className="flex w-32 h-20 justify-center items-center flex-col">
                                <div className="flex w-full h-10 justify-center items-center">
                                  {seatIndex}
                                </div>
                                <div className="flex w-full h-10 justify-center items-center">
                                  {isLogined === false && isEnd === false && (
                                    <span>준비중</span>
                                  )}
                                  {isLogined === true && isEnd === false && (
                                    <span>심사중</span>
                                  )}
                                  {isLogined === true && isEnd === true && (
                                    <span>완료</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
