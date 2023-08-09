import React from "react";
import { useState } from "react";
import LoadingPage from "./LoadingPage";
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
import { debounce } from "lodash";
import ConfirmationModal from "../messageBox/ConfirmationModal";

const ContestMonitoringBasecamp = () => {
  const { currentContest } = useContext(CurrentContestContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isHolding, setIsHolding] = useState(false);
  const [contestInfo, setContestInfo] = useState({});

  const [msgOpen, setMsgOpen] = useState(false);
  const [message, setMessage] = useState({});

  const [stagesArray, setStagesArray] = useState([]);
  const [currentStage, setCurrentStage] = useState({ stageId: null });
  const navigate = useNavigate();

  const fetchNotice = useFirestoreGetDocument("contest_notice");
  const fetchStages = useFirestoreGetDocument("contest_stages_assign");

  const { data: fetchRealTimeCurrentStage, getDocument: currentStageFunction } =
    useFirebaseRealtimeGetDocument();

  const addCurrentStage = useFirebaseRealtimeAddData();
  const updateCurrentStage = useFirebaseRealtimeUpdateData();

  const fetchPool = async (noticeId, stageAssignId) => {
    try {
      const returnNotice = await fetchNotice.getDocument(noticeId);
      const returnContestStage = await fetchStages.getDocument(stageAssignId);

      console.log(noticeId);
      if (returnNotice && returnContestStage) {
        const promises = [
          setStagesArray(
            returnContestStage.stages.sort(
              (a, b) => a.stageNumber - b.stageNumber
            )
          ),
          setContestInfo({ ...returnNotice }),
        ];

        Promise.all(promises);
      }
    } catch (error) {
      setMessage({
        body: "데이터를 로드하지 못했습니다.",
        body4: error.message,
        isButton: true,
        confirmButtonText: "확인",
      });
    }

    setIsLoading(false);
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
    } = stagesArray[0];

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
      categoryId,
      categoryTitle,
      gradeId,
      gradeTitle,
      stageJudgeCount: categoryJudgeCount,
      judges: judgeInitState,
    };
    try {
      await addCurrentStage
        .addData("currentStage", currentStateInfo, currentContest.contests.id)
        .then((data) => setCurrentStage({ ...data }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleGotoSummary = (categoryId, categoryTitle, grades) => {
    navigate("/contestranksummary", {
      state: { categoryId, categoryTitle, grades },
    });
  };

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
    } = stagesArray[stageIndex + 1];

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
      categoryId,
      categoryTitle,
      gradeId,
      gradeTitle,
      stageJudgeCount: categoryJudgeCount,
      judges: judgeInitState,
    };

    try {
      await updateCurrentStage
        .updateData(`${collectionName}/${documentId}`, currentStateInfo)
        .then((data) => setCurrentStage({ ...data }));
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (
      currentContest?.contests?.contestNoticeId &&
      currentContest?.contests?.contestStagesAssignId
    ) {
      fetchPool(
        currentContest.contests.contestNoticeId,
        currentContest.contests.contestStagesAssignId
      );
    }
  }, [currentContest]);

  useEffect(() => {
    setCurrentStage(fetchRealTimeCurrentStage);
  }, [fetchRealTimeCurrentStage?.stageId]);

  useEffect(() => {
    if (!isHolding && currentContest?.contests?.id) {
      const debouncedGetDocument = debounce(
        () =>
          currentStageFunction(
            `currentStage/${currentContest.contests.id}`,
            currentContest.contests.id
          ),
        1000
      );
      debouncedGetDocument();
    }
    console.log(fetchRealTimeCurrentStage);
    return () => {};
  }, [currentStageFunction]);

  return (
    <>
      {isLoading && (
        <div className="flex w-full h-screen justify-center items-center">
          <LoadingPage propStyles={{ width: "80", height: "60" }} />
        </div>
      )}
      {!isLoading && (
        <div className="flex flex-col w-full h-full bg-white rounded-lg p-3 gap-y-2 justify-start items-start">
          <ConfirmationModal
            isOpen={msgOpen}
            message={message}
            onCancel={() => setMsgOpen(false)}
            onConfirm={() => setMsgOpen(false)}
          />
          <div className="flex w-full h-auto">
            <div className="flex w-full bg-gray-100 justify-start items-center rounded-lg p-3">
              <div className="flex w-4/5 px-2 flex-col gap-y-2">
                <h1 className="font-sans text-base font-semibold">
                  대회명 : {contestInfo.contestTitle}
                </h1>
                <h1 className="font-sans text-base font-semibold">
                  채점표DB : {contestInfo.contestCollectionName}
                </h1>
                <h1 className="font-sans text-base font-semibold">
                  모니터링상태 :{" "}
                  {currentStage?.stageId && !isHolding && "실시간모니터링중"}
                  {currentStage?.stageId && isHolding && "모니터링 일시정지"}
                  {!currentStage?.stageId && !isHolding && "대회시작전"}
                </h1>
              </div>
              <div className="flex w-1/5 h-full">
                {currentStage?.stageId && !isHolding && (
                  <button
                    className="bg-gray-400 w-full h-full text-white text-lg rounded-lg"
                    onClick={() => setIsHolding(true)}
                  >
                    일시정지
                  </button>
                )}
                {currentStage?.stageId && isHolding && (
                  <button
                    className="bg-blue-600 w-full h-full text-white text-lg rounded-lg"
                    onClick={() => setIsHolding(false)}
                  >
                    모니터링 시작
                  </button>
                )}
                {!currentStage?.stageId && !isHolding && (
                  <button
                    className="bg-blue-400 w-full h-full text-white text-lg rounded-lg"
                    onClick={() => handleAddCurrentStage()}
                  >
                    대회시작
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full h-auto">
            <div className="flex w-full h-auto justify-start items-center">
              <button className="w-40 h-10 bg-blue-500 text-gray-100 rounded-t-lg">
                현재 무대상황
              </button>
              <button className="w-40 h-10 bg-gray-300 text-gray-700 rounded-t-lg">
                전체 무대목록
              </button>
            </div>
            <div className="flex w-full h-auto justify-start items-center bg-gray-100">
              test
            </div>{" "}
          </div>

          {/* <div className="flex w-full h-auto">
            <div className="flex w-full h-auto bg-gray-100 justify-start items-center rounded-lg px-3">
              <div className="flex w-full h-full justify-start items-center gap-y-2 flex-col py-3">
                {stagesArray?.length > 0 &&
                  stagesArray.map((schedule, sIdx) => {
                    const {
                      categoryTitle,
                      categoryId,
                      grades,
                      stageId,
                      stageNumber,
                    } = schedule;

                    const gradeTitle = handleGradeInfo(grades).gradeTitle;

                    const findIndex = stagesArray.findIndex(
                      (f) => f.stageId === stageId
                    );
                    return (
                      <div className="flex flex-col w-full h-auto">
                        <div
                          className={`${
                            stageId === currentStage?.stageId
                              ? "flex w-full bg-blue-200 rounded-lg h-10 p-2"
                              : "flex w-full bg-white rounded-lg h-10 p-2"
                          }`}
                        >
                          <div className="flex w-4/6">
                            {categoryTitle} ({gradeTitle})
                          </div>
                          <div className="flex w-1/6">
                            {stageId === currentStage?.stageId && (
                              <button
                                onClick={() =>
                                  handleUpdateMonitoring(
                                    "currentStage",
                                    currentStage.id,
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
                                handleGotoSummary(
                                  categoryId,
                                  categoryTitle,
                                  grades
                                )
                              }
                            >
                              집계표
                            </button>
                          </div>
                        </div>
                        <div className="flex w-full h-auto">
                          {stageId === currentStage?.stageId && (
                            <div className="flex justify-start items-center h-20 w-full">
                              {currentStage.judges.map((judge, jIdx) => {
                                const { isEnd, isLogined, seatIndex } = judge;

                                return (
                                  <div className="flex w-32 h-20 justify-center items-center flex-col">
                                    <div className="flex w-full h-10 justify-center items-center">
                                      {seatIndex}
                                    </div>
                                    <div className="flex w-full h-10 justify-center items-center">
                                      {isLogined === false &&
                                        isEnd === false && <span>준비중</span>}
                                      {isLogined === true &&
                                        isEnd === false && <span>심사중</span>}
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
          </div> */}
        </div>
      )}
    </>
  );
};

export default ContestMonitoringBasecamp;
