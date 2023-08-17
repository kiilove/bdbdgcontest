import React from "react";
import { useState } from "react";
import _ from "lodash";
import LoadingPage from "./LoadingPage";
import { TbHeartRateMonitor } from "react-icons/tb";
import { CgSpinnerTwo } from "react-icons/cg";
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
import { PiSpinner, PiSpinnerThin } from "react-icons/pi";

const ContestMonitoringBasecamp = () => {
  const navigate = useNavigate();
  const { currentContest } = useContext(CurrentContestContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isHolding, setIsHolding] = useState(false);
  const [contestInfo, setContestInfo] = useState({});
  const [judgesIsEndValidated, setJudgesIsEndValidated] = useState(true);
  const [currentSubTab, setCurrentSubTab] = useState("0");

  const [msgOpen, setMsgOpen] = useState(false);
  const [message, setMessage] = useState({});

  const [stagesArray, setStagesArray] = useState([]);
  const [playersArray, setPlayersArray] = useState([]);
  const [currentStageInfo, setCurrentStageInfo] = useState({ stageId: null });

  const [normalScoreData, setNormalScoreData] = useState([]);
  const [normalScoreTable, setNormalScoreTable] = useState([]);

  const [currentScoreTableByJudge, setCurrentScoreTableByJudge] = useState([]);

  const fetchNotice = useFirestoreGetDocument("contest_notice");
  const fetchStages = useFirestoreGetDocument("contest_stages_assign");
  const fetchFinalPlayers = useFirestoreGetDocument("contest_players_final");
  const fetchScoreCardQuery = useFirestoreQuery();

  const { data: realtimeData, getDocument: currentStageFunction } =
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
            returnPlayersFinal.players
              .sort((a, b) => a.playerIndex - b.playerIndex)
              .filter((f) => f.playerNoShow === false)
          ),
          setIsLoading(false),
        ];

        Promise.all(promises);

        // 1초 후에 setIsLoading을 false로 설정
        // setTimeout(() => {
        //   setIsLoading(false);
        // }, 2000);
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
    //console.log(grades);
    if (grades?.length <= 0) {
      return;
    }

    fetchScoreTable(grades);
  };

  const handleScoreTableByJudge = (grades) => {
    if (!_.isEqual(realtimeData?.judges, realtimeData?.judges)) {
      fetchScoreTable(grades);
    }
  };

  const handleGradeInfo = (grades) => {
    let gradeTitle = "";
    let gradeId = "";
    let matchedJudgesCount = 0;
    let matchedPlayersCount = 0;

    if (grades?.length === 0) {
      gradeTitle = "오류발생";
      gradeId = "";
    }
    if (grades.length === 1) {
      gradeTitle = grades[0].gradeTitle;
      gradeId = grades[0].gradeId;
      matchedJudgesCount = grades[0].categoryJudgeCount;
      matchedPlayersCount = grades[0].playerCount;
    } else if (grades.length > 1) {
      const madeTitle = grades.map((grade, gIdx) => {
        return grade.gradeTitle + " ";
      });
      matchedJudgesCount = grades[0].categoryJudgeCount;
      grades.map((grade, gIdx) => {
        matchedPlayersCount = matchedPlayersCount + parseInt(grade.playerCount);
      });
      gradeId = grades[0].gradeId;
      gradeTitle = madeTitle + "통합";
    }

    return { gradeTitle, gradeId, matchedJudgesCount, matchedPlayersCount };
  };

  const handleForceReStart = async (judgeIndex, contestId) => {
    const collectionInfo = `currentStage/${contestId}/judges/${judgeIndex}`;
    const newStatus = {
      seatIndex: judgeIndex + 1,
      isLogined: false,
      isEnd: false,
    };
    try {
      await updateCurrentStage.updateData(collectionInfo, { ...newStatus });
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateCurrentStage = async (currentStageId, actionType) => {
    const {
      stageId,
      stageNumber,
      categoryJudgeCount,
      categoryId,
      categoryTitle,
      grades,
    } = stagesArray[currentStageId];

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
      compares: {
        status: {
          compareStart: false,
          compareEnd: false,
          compareCancel: false,
          compareIng: false,
        },
      },
    };

    const collectionInfo = `currentStage/${currentContest.contests.id}`;

    switch (actionType) {
      case "add":
        try {
          await addCurrentStage.addData(
            "currentStage",
            newCurrentStateInfo,
            currentContest.contests.id
          );
        } catch (error) {
          console.log(error);
        }
        break;
      case "next":
        try {
          await updateCurrentStage.updateData(collectionInfo, {
            ...newCurrentStateInfo,
          });
        } catch (error) {
          console.log(error);
        }

      case "force":
        try {
          await updateCurrentStage.updateData(collectionInfo, {
            ...newCurrentStateInfo,
          });
        } catch (error) {
          console.log(error);
        }

      default:
        break;
    }
    try {
      await addCurrentStage.addData(
        "currentStage",
        newCurrentStateInfo,
        currentContest.contests.id
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleGotoSummary = (categoryId, categoryTitle, grades) => {
    navigate("/contestranksummary", {
      state: { categoryId, categoryTitle, grades },
    });
  };

  const handleJudgeIsEndValidated = (judgesArray) => {
    if (judgesArray?.length <= 0) {
      return;
    }
    console.log(judgesArray);
    const validate = judgesArray.some((s) => s.isEnd === false);
    return validate;
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
    setCurrentStageInfo({
      ...stagesArray.find((f) => f.stageId === realtimeData?.stageId),
    });
    if (realtimeData?.judges?.length > 0) {
      setJudgesIsEndValidated(() =>
        handleJudgeIsEndValidated(realtimeData?.judges)
      );
    }
  }, [realtimeData]);

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
      realtimeData?.stageJudgeCount &&
      currentStageInfo?.grades?.length > 0 &&
      playersArray?.length > 0
    ) {
      handleScoreTableByJudge(currentStageInfo.grades);
    }
  }, [
    realtimeData?.stageJudgeCount,
    realtimeData?.judges,
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
                  {realtimeData?.stageId && !isHolding && "실시간모니터링중"}
                  {realtimeData?.stageId && isHolding && "모니터링 일시정지"}
                  {!realtimeData?.stageId && !isHolding && "대회시작전"}
                </h1>
              </div>
              <div className="flex w-1/5 h-full">
                {realtimeData?.stageId && !isHolding && (
                  <button
                    className="bg-gray-400 w-full h-full text-white text-lg rounded-lg"
                    onClick={() => setIsHolding(true)}
                  >
                    일시정지
                  </button>
                )}
                {realtimeData?.stageId && isHolding && (
                  <button
                    className="bg-blue-600 w-full h-full text-white text-lg rounded-lg"
                    onClick={() => setIsHolding(false)}
                  >
                    모니터링 시작
                  </button>
                )}
                {!realtimeData?.stageId && !isHolding && (
                  <button
                    className="bg-blue-400 w-full h-full text-white text-lg rounded-lg"
                    onClick={() => handleUpdateCurrentStage(0, "add")}
                  >
                    대회시작
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full h-auto">
            <div className="flex w-full h-auto justify-start items-center">
              <button
                onClick={() => setCurrentSubTab("0")}
                className={`${
                  currentSubTab === "0"
                    ? "w-40 h-10 bg-blue-500 text-gray-100 rounded-t-lg"
                    : "w-40 h-10 bg-white text-gray-700 rounded-t-lg border-t border-r"
                }`}
              >
                현재 무대상황
              </button>
              <button
                onClick={() => setCurrentSubTab("1")}
                className={`${
                  currentSubTab === "1"
                    ? "w-40 h-10 bg-blue-500 text-gray-100 rounded-t-lg"
                    : "w-40 h-10 bg-white text-gray-700 rounded-t-lg border-t border-r"
                }`}
              >
                전체 무대목록
              </button>
            </div>
            {currentSubTab === "0" && (
              <div className="flex w-full h-auto justify-start items-center bg-blue-100 rounded-tr-lg rounded-b-lg p-2">
                {realtimeData && (
                  <div className="flex w-full flex-col h-auto gap-y-2">
                    <div className="flex bg-white p-2 w-full h-auto rounded-lg flex-col justify-center items-start">
                      <div className="flex w-full h-14 justify-between items-center gap-x-2 px-2">
                        <div className="flex w-full justify-start items-center gap-x-2">
                          <span className="font-bold text-lg">진행상황</span>
                        </div>
                        {!judgesIsEndValidated && (
                          <div className="flex w-full justify-end items-center gap-x-2">
                            <button
                              className="w-24 h-10 bg-blue-500 rounded-lg text-gray-100"
                              onClick={() =>
                                handleUpdateCurrentStage(
                                  realtimeData.stageNumber,
                                  "next"
                                )
                              }
                            >
                              다음진행
                            </button>
                            <button className="w-24 h-10 bg-blue-800 rounded-lg text-gray-100">
                              집계표출력
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex w-full h-10 justify-start items-center px-2">
                        <span className="font-semibold">
                          {realtimeData?.categoryTitle}(
                          {realtimeData?.gradeTitle})
                        </span>
                      </div>
                      <div className="flex w-full h-auto flex-wrap box-border flex-col px-2">
                        {/* table Header */}
                        <div className="flex w-full h-10 text-lg ">
                          {realtimeData?.judges &&
                            realtimeData.judges.map((judge, jIdx) => {
                              const { seatIndex } = judge;

                              return (
                                <div
                                  className="h-full p-2 justify-center items-center flex last:border-l-0 border-blue-400 border-y border-r bg-blue-200 first:border-l w-full"
                                  style={{ maxWidth: "15%" }}
                                >
                                  {seatIndex}
                                </div>
                              );
                            })}
                        </div>
                        {/* 상황판 */}
                        <div className="flex w-full h-auto text-lg bg-gray-100 items-start">
                          {realtimeData?.judges &&
                            realtimeData.judges.map((judge, jIdx) => {
                              const { isEnd, isLogined } = judge;

                              return (
                                <div
                                  className="h-full p-2 justify-center items-start flex last:border-l-0 border-blue-400 border-y border-r border-t-0 text-sm first:border-l w-full"
                                  style={{ maxWidth: "15%" }}
                                >
                                  {isEnd && isLogined && "심사종료"}
                                  {!isEnd && isLogined && "심사중"}
                                  {!isEnd && !isLogined && "로그인대기"}
                                </div>
                              );
                            })}
                        </div>
                        {/* 강제전환 */}
                        <div className="flex w-full h-auto text-lg bg-gray-100 items-start">
                          {realtimeData?.judges &&
                            realtimeData.judges.map((judge, jIdx) => {
                              const { isEnd, isLogined } = judge;

                              return (
                                <div
                                  className="h-full p-2 justify-center items-start flex last:border-l-0 border-blue-400 border-y border-r border-t-0 text-sm first:border-l w-full"
                                  style={{ maxWidth: "15%" }}
                                >
                                  <button
                                    className="w-32 h-8 rounded-lg border border-blue-500 bg-white"
                                    onClick={() =>
                                      handleForceReStart(
                                        jIdx,
                                        currentContest.contests.id
                                      )
                                    }
                                  >
                                    강제다시시작
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                    <div className="flex bg-white p-2 w-full h-auto rounded-lg flex-col justify-center items-start">
                      <div className="flex w-full h-14 justify-between items-center gap-x-2 px-2">
                        <span className="font-bold text-lg">집계상황</span>
                        <button
                          className="ml-2"
                          onClick={() =>
                            handleForceScoreTableRefresh(
                              currentStageInfo.grades
                            )
                          }
                        >
                          새로고침
                        </button>
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
                                {realtimeData?.judges &&
                                  realtimeData.judges.map((judge, jIdx) => {
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
                                console.log(currentStageInfo);
                                return (
                                  <div className="flex">
                                    <div
                                      className="h-full p-2 justify-center items-start flex w-full border-l border-b border-r  border-gray-400 "
                                      style={{ maxWidth: "15%" }}
                                    >
                                      {playerNumber}
                                    </div>
                                    {realtimeData?.judges?.length > 0 &&
                                      realtimeData?.judges.map(
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
                                              {finded?.playerScore !== 0 &&
                                              finded?.playerScore !==
                                                undefined &&
                                              finded?.playerScore !== 1000
                                                ? finded.playerScore
                                                : ""}
                                              {finded?.playerScore === 1000 &&
                                                "순위제외"}
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
              </div>
            )}

            {currentSubTab === "1" && (
              <div className="flex w-full h-auto justify-start items-center bg-blue-100 rounded-tr-lg rounded-b-lg p-2">
                {realtimeData && stagesArray?.length > 0 && (
                  <div className="flex w-full flex-col h-auto gap-y-2">
                    <div className="flex bg-white p-2 w-full h-auto rounded-lg flex-col justify-center items-start">
                      <div className="flex w-full h-14 justify-between items-center gap-x-2 px-2">
                        <div className="flex w-full justify-start items-center gap-x-2">
                          <span className="font-bold text-lg">무대목록</span>
                        </div>
                      </div>
                      <div className="flex flex-col w-full h-auto gap-y-2 p-2">
                        {stagesArray
                          .sort((a, b) => a.stageNumber - b.stageNumber)
                          .map((stage, sIdx) => {
                            const {
                              grades,
                              stageNumber,
                              stageId,
                              categoryTitle,
                            } = stage;
                            const gradeTitle =
                              handleGradeInfo(grades).gradeTitle;
                            const playersCount =
                              handleGradeInfo(grades).matchedPlayersCount;

                            const judgesCount =
                              handleGradeInfo(grades).matchedJudgesCount;
                            return (
                              <div
                                className={`${
                                  realtimeData.stageId === stageId
                                    ? "flex w-full h-16 justify-start items-center px-5 bg-blue-400 rounded-lg text-gray-100"
                                    : "flex w-full h-10 justify-start items-center px-5 bg-blue-100 rounded-lg"
                                }`}
                              >
                                <div className="flex w-1/2 justify-start items-center flex-wrap">
                                  <div className="flex w-10  h-auto items-center">
                                    <span className="font-semibold">
                                      {stageNumber}
                                    </span>
                                  </div>
                                  <div
                                    className="flex w-auto px-2 h-auto items-center"
                                    style={{ minWidth: "450px" }}
                                  >
                                    <span className="font-semibold mr-2">
                                      {categoryTitle}
                                    </span>
                                    <span className="font-semibold">
                                      ({gradeTitle})
                                    </span>
                                    {realtimeData.stageId === stageId && (
                                      <div className="flex w-auto px-2">
                                        <PiSpinner
                                          className="animate-spin w-8 h-8 "
                                          style={{ animationDuration: "1.5s" }}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex w-auto px-2 text-base font-normal">
                                    <span className="mx-2">출전인원수 : </span>
                                    <span className="font-semibold">
                                      {playersCount}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex w-1/2 justify-end items-center flex-wrap py-2">
                                  <div className="flex w-full gap-x-2 justify-end items-center">
                                    <button
                                      className={`${
                                        realtimeData.stageId === stageId
                                          ? "flex w-24 justify-center items-center  bg-blue-100 rounded-lg p-2 text-gray-900"
                                          : "flex w-24 justify-center items-center  bg-blue-400 rounded-lg p-2 text-gray-100"
                                      }`}
                                    >
                                      집계표출력
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleUpdateCurrentStage(sIdx, "force")
                                      }
                                      className={`${
                                        realtimeData.stageId === stageId
                                          ? "flex w-24 justify-center items-center  bg-blue-100 rounded-lg p-2 text-gray-900"
                                          : "flex w-24 justify-center items-center  bg-blue-400 rounded-lg p-2 text-gray-100"
                                      }`}
                                    >
                                      {realtimeData.stageId === stageId
                                        ? "강제 재시작"
                                        : "강제시작"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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
