import React from "react";
import { useState } from "react";
import _ from "lodash";
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
import { where } from "firebase/firestore";
import { Modal } from "@mui/material";
import CompareSetting from "../modals/CompareSetting";

const ContestMonitoringJudgeHead = () => {
  const navigate = useNavigate();
  const { currentContest } = useContext(CurrentContestContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isHolding, setIsHolding] = useState(false);
  const [contestInfo, setContestInfo] = useState({});

  const [msgOpen, setMsgOpen] = useState(false);
  const [message, setMessage] = useState({});

  const [compareOpen, setCompareOpen] = useState(false);

  const [stagesArray, setStagesArray] = useState([]);
  const [playersArray, setPlayersArray] = useState([]);
  const [currentStageMatchedPlayers, setCurrentStageMatchedPlayers] = useState(
    []
  );
  const [currentStageInfo, setCurrentStageInfo] = useState({ stageId: null });
  const [currentRealtime, setCurrentRealtime] = useState({});

  const [normalScoreData, setNormalScoreData] = useState([]);
  const [normalScoreTable, setNormalScoreTable] = useState([]);

  const [currentScoreTableByJudge, setCurrentScoreTableByJudge] = useState([]);

  const fetchNotice = useFirestoreGetDocument("contest_notice");
  const fetchStages = useFirestoreGetDocument("contest_stages_assign");
  const fetchFinalPlayers = useFirestoreGetDocument("contest_players_final");
  const fetchScoreCardQuery = useFirestoreQuery();

  const { data: fetchRealTimeCurrentStage, getDocument: currentStageFunction } =
    useFirebaseRealtimeGetDocument();

  const addCurrentStage = useFirebaseRealtimeAddData();
  const updateCurrentStage = useFirebaseRealtimeUpdateData();

  const fetchPool = async (noticeId, stageAssignId, playerFinalId) => {
    try {
      const returnNotice = await fetchNotice.getDocument(noticeId);
      const returnContestStage = await fetchStages.getDocument(stageAssignId);
      const returnPlayersFinal = await fetchFinalPlayers.getDocument(
        playerFinalId
      );

      if (returnNotice && returnContestStage) {
        const promises = [
          setStagesArray(
            returnContestStage.stages.sort(
              (a, b) => a.stageNumber - b.stageNumber
            )
          ),
          setContestInfo({ ...returnNotice }),
          setPlayersArray(
            returnPlayersFinal.players.sort(
              (a, b) => a.playerIndex - b.playerIndex
            )
          ),
        ];

        Promise.all(promises);

        setIsLoading(false);
      }
    } catch (error) {
      setMessage({
        body: "데이터를 로드하지 못했습니다.",
        body4: error.message,
        isButton: true,
        confirmButtonText: "확인",
      });
    }
  };

  const fetchScoreTable = async (grades) => {
    setIsLoading(true);
    const allData = [];

    for (let grade of grades) {
      const { gradeId } = grade;
      try {
        const condition = [where("gradeId", "==", gradeId)];
        const data = await fetchScoreCardQuery.getDocuments(
          contestInfo.contestCollectionName,
          condition
        );
        allData.push(...data);
      } catch (error) {
        console.log(error);
      }
    }

    setNormalScoreData(allData);
    setIsLoading(false);
  };

  const handleForceScoreTableRefresh = (grades) => {
    console.log(grades);
    if (grades?.length <= 0) {
      return;
    }

    fetchScoreTable(grades);
  };

  const handleScoreTableByJudge = (grades) => {
    if (
      !_.isEqual(currentRealtime?.judges, fetchRealTimeCurrentStage?.judges)
    ) {
      fetchScoreTable(grades);
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
    } = stagesArray[0];

    const gradeTitle = handleGradeInfo(grades).gradeTitle;
    const gradeId = handleGradeInfo(grades).gradeId;

    const judgeInitState = Array.from(
      { length: categoryJudgeCount },
      (_, jIdx) => jIdx + 1
    ).map((number) => {
      return { seatIndex: number, isLogined: false, isEnd: false };
    });

    const newCurrentStateInfo = {
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
        .addData(
          "currentStage",
          newCurrentStateInfo,
          currentContest.contests.id
        )
        .then((data) => setCurrentRealtime({ ...data }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleGotoSummary = (categoryId, categoryTitle, grades) => {
    navigate("/contestranksummary", {
      state: { categoryId, categoryTitle, grades },
    });
  };

  useEffect(() => {
    if (
      currentContest?.contests?.contestNoticeId &&
      currentContest?.contests?.contestStagesAssignId &&
      currentContest?.contests?.contestPlayersFinalId
    ) {
      fetchPool(
        currentContest.contests.contestNoticeId,
        currentContest.contests.contestStagesAssignId,
        currentContest?.contests?.contestPlayersFinalId
      );
    }
  }, [currentContest]);

  useEffect(() => {
    setCurrentRealtime(fetchRealTimeCurrentStage);
    setCurrentStageInfo({
      ...stagesArray.find(
        (f) => f.stageId === fetchRealTimeCurrentStage.stageId
      ),
    });
  }, [fetchRealTimeCurrentStage]);

  useEffect(() => {
    if (!isHolding && currentContest?.contests?.id) {
      const debouncedGetDocument = debounce(
        () =>
          currentStageFunction(
            `currentStage/${currentContest.contests.id}`,
            currentContest.contests.id
          ),
        2000
      );
      debouncedGetDocument();
    }

    return () => {};
  }, [currentStageFunction]);

  useEffect(() => {
    if (
      fetchRealTimeCurrentStage?.stageJudgeCount &&
      currentStageInfo?.grades?.length > 0 &&
      playersArray?.length > 0
    ) {
      handleScoreTableByJudge(currentStageInfo.grades);
      setCurrentStageMatchedPlayers(
        playersArray
          .filter(
            (f) => f.contestGradeId === currentStageInfo.grades[0].gradeId
          )
          .sort((a, b) => a.playerIndex - b.playerIndex)
      );
    }
  }, [
    fetchRealTimeCurrentStage?.stageJudgeCount,
    fetchRealTimeCurrentStage?.judges,
    playersArray,
    currentStageInfo,
  ]);

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
          <Modal open={compareOpen} onClose={() => setCompareOpen(false)}>
            <CompareSetting
              stageInfo={currentStageInfo}
              setClose={setCompareOpen}
              gradeListId={currentContest.contests.contestGradesListId}
              fullMatched={currentStageMatchedPlayers}
            />
          </Modal>
          <div className="flex w-full h-auto">
            <div className="flex w-full bg-gray-100 justify-start items-center rounded-lg p-3">
              <div className="flex w-4/5 px-2 flex-col gap-y-2">
                <h1 className="font-sans text-base font-semibold">
                  대회명 : {contestInfo.contestTitle}
                </h1>
                <h1 className="font-sans text-base font-semibold">
                  모니터링상태 :{" "}
                  {currentRealtime?.stageId && !isHolding && "실시간모니터링중"}
                  {currentRealtime?.stageId && isHolding && "모니터링 일시정지"}
                  {!currentRealtime?.stageId && !isHolding && "대회시작전"}
                </h1>
              </div>
              <div className="flex w-1/5 h-full">
                {currentRealtime?.stageId && !isHolding && (
                  <button
                    className="bg-gray-400 w-full h-full text-white text-lg rounded-lg"
                    onClick={() => setIsHolding(true)}
                  >
                    일시정지
                  </button>
                )}
                {currentRealtime?.stageId && isHolding && (
                  <button
                    className="bg-blue-600 w-full h-full text-white text-lg rounded-lg"
                    onClick={() => setIsHolding(false)}
                  >
                    모니터링 시작
                  </button>
                )}
                {!currentRealtime?.stageId && !isHolding && (
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
            <div className="flex w-full h-auto justify-start items-center bg-blue-100 rounded-lg rounded-b-lg p-2">
              {currentRealtime && (
                <div className="flex w-full flex-col h-auto gap-y-2">
                  <div className="flex bg-white p-2 w-full h-auto rounded-lg flex-col justify-center items-start">
                    <div className="flex w-full h-14 justify-start items-center px-2">
                      <div className="flex w-2/3 justify-start items-center h-auto">
                        <span className="font-bold text-lg">집계상황</span>
                        <button
                          className="ml-2 w-20 h-auto p-2 bg-blue-200 rounded-lg"
                          onClick={() =>
                            handleForceScoreTableRefresh(
                              currentStageInfo.grades
                            )
                          }
                        >
                          새로고침
                        </button>
                      </div>
                      <div className="flex w-1/3 justify-end items-center h-full">
                        <button
                          className="w-full h-full bg-orange-600 rounded-lg"
                          onClick={() => setCompareOpen(true)}
                        >
                          <span className=" text-lg text-white font-semibold">
                            비교심사시작
                          </span>
                        </button>
                      </div>
                    </div>
                    {currentStageInfo?.grades?.length > 0 &&
                      currentStageInfo.grades.map((grade, gIdx) => {
                        const { categoryTitle, gradeTitle, gradeId } = grade;
                        const filterdPlayers = playersArray
                          .filter(
                            (f) =>
                              f.contestGradeId === gradeId &&
                              f.playerNoShow === false
                          )
                          .sort((a, b) => a.playerIndex - b.playerIndex);
                        return (
                          <div className="flex w-full h-auto p-2 flex-col">
                            <div className="flex w-full h-10 justify-start items-center">
                              {categoryTitle}({gradeTitle})
                            </div>
                            <div className="flex w-full h-10 justify-start items-center">
                              <div
                                className="h-full p-2 justify-center items-start flex w-full border border-gray-400 border-b-2"
                                style={{ maxWidth: "15%" }}
                              >
                                구분
                              </div>
                              {currentRealtime?.judges &&
                                currentRealtime.judges.map((judge, jIdx) => {
                                  const { seatIndex } = judge;
                                  return (
                                    <div
                                      className="h-full p-2 justify-center items-start flex w-full border-t border-b-2 border-r border-gray-400 "
                                      style={{ maxWidth: "15%" }}
                                    >
                                      {seatIndex}
                                    </div>
                                  );
                                })}
                            </div>
                            {filterdPlayers.map((player, pIdx) => {
                              const { playerNumber } = player;

                              return (
                                <div className="flex">
                                  <div
                                    className="h-full p-2 justify-center items-start flex w-full border-l border-b border-r  border-gray-400 "
                                    style={{ maxWidth: "15%" }}
                                  >
                                    {playerNumber}
                                  </div>
                                  {currentRealtime?.judges?.length > 0 &&
                                    currentRealtime?.judges.map(
                                      (judge, jIdx) => {
                                        const { seatIndex } = judge;

                                        const finded = normalScoreData.find(
                                          (f) =>
                                            f.playerNumber === playerNumber &&
                                            f.seatIndex === seatIndex
                                        );

                                        return (
                                          <div
                                            className="h-auto p-2 justify-center items-start flex w-full  border-r border-b border-gray-400 "
                                            style={{ maxWidth: "15%" }}
                                          >
                                            {finded?.playerScore || ""}
                                          </div>
                                        );
                                      }
                                    )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
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

export default ContestMonitoringJudgeHead;
