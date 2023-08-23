import React, { useRef } from "react";
import ScoreSheet from "../components/ScoreSheet";
import ScoreCardRankForm from "../components/ScoreCardRankForm";
import { useState } from "react";
import {
  useFirestoreGetDocument,
  useFirestoreQuery,
} from "../hooks/useFirestores";
import { useContext } from "react";
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import { useEffect } from "react";
import { where } from "firebase/firestore";
import LoadingPage from "../pages/LoadingPage";
import ReactToPrint from "react-to-print";

const ContestRankingSummaryPrintAll = ({ props, setClose }) => {
  const [resultTable, setResultTable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [judgesArray, setJudgesArray] = useState([]);
  const [judgeHeadInfo, setJudgeHeadInfo] = useState();
  const [scoreCardsArray, setScoreCardsArray] = useState([]);
  const printRef = useRef();
  const fetchQuery = useFirestoreQuery();

  const { currentContest } = useContext(CurrentContestContext);

  const fetchPool = async (propContestId, propGradeId, scoreCollectionName) => {
    const condition = [
      where("contestId", "==", propContestId),
      where("gradeId", "==", propGradeId),
    ];

    const conditionJudge = [
      where("contestId", "==", propContestId),
      where("isHead", "==", true),
    ];
    console.log(propGradeId);
    try {
      await fetchQuery
        .getDocuments("contest_results_list", condition)
        .then((data) => {
          console.log(data);
          if (data.length === 0) {
            console.log("데이터가 없음");
            return;
          } else {
            setResultTable(() => [...data]);
          }
        });
    } catch (error) {
      console.log(error);
    }

    try {
      await fetchQuery
        .getDocuments(scoreCollectionName, condition)
        .then((data) => {
          console.log(data);
          if (data.length === 0) {
            console.log("데이터가 없음");
            return;
          } else {
            setScoreCardsArray(() => [...data]);
          }
        });
    } catch (error) {
      console.log(error);
    }

    try {
      await fetchQuery
        .getDocuments("contest_judges_pool", conditionJudge)
        .then((data) => {
          if (data?.length === 0) {
            return;
          } else {
            setJudgeHeadInfo(() => ({ ...data[0] }));
          }
        });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJudgeHeadInfo = (judges) => {
    if (judges.length === 0) {
      return;
    }
    const findHeadInfo = judges.filter((f) => f.isHead === true);
    console.log(findHeadInfo);
    if (findHeadInfo.length === 0) {
      return;
    } else {
      return findHeadInfo[0];
    }
  };

  useEffect(() => {
    if (judgesArray?.length > 0) {
      setJudgeHeadInfo(() => handleJudgeHeadInfo(judgesArray));
    }
  }, [judgesArray]);

  useEffect(() => {
    console.log(resultTable);
  }, [resultTable]);

  useEffect(() => {
    if (
      !props?.contestId ||
      !props?.gradeId ||
      !currentContest?.contestInfo?.contestCollectionName
    ) {
      return;
    }
    fetchPool(
      props.contestId,
      props.gradeId,
      currentContest?.contestInfo?.contestCollectionName
    );
  }, [props, currentContest?.contestInfo]);
  return (
    <div className="w-full h-auto flex flex-col bg-gray-100 justify-start items-center overflow-auto">
      {isLoading && <LoadingPage />}
      {!isLoading && (
        <>
          <div
            className="flex h-14 justify-end items-center gap-x-2"
            style={{ width: "210mm" }}
          >
            <ReactToPrint
              trigger={() => (
                <button className="w-40 h-10 bg-blue-300 rounded-lg">
                  집계표출력
                </button>
              )}
              content={() => printRef.current}
              pageStyle="@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; box-shadow:none; } }"
            />
            <button
              className="flex w-40 h-10 bg-gray-300 rounded-lg justify-center items-center"
              onClick={() => setClose(false)}
            >
              닫기
            </button>
          </div>
          {resultTable?.length > 0 &&
            resultTable.map((table, rIdx) => {
              const {
                contestId,
                categoryId,
                categoryTitle,
                gradeId,
                gradeTitle,
                result,
              } = table;

              return (
                <div
                  className="flex shadow bg-white"
                  ref={printRef}
                  style={{ width: "210mm", height: "297mm" }}
                >
                  <div className="flex flex-col w-full h-auto">
                    <div className="flex w-full break-after-page mb-20">
                      <ScoreSheet
                        contestId={contestId}
                        contestInfo={currentContest.contestInfo}
                        gradeId={gradeId}
                        categoryTitle={categoryTitle}
                        gradeTitle={gradeTitle}
                        scoreTable={result}
                        judgeHeadInfo={judgeHeadInfo}
                      />
                    </div>
                    <div className="flex w-full h-auto flex-col">
                      {scoreCardsArray?.length > 0 &&
                        scoreCardsArray
                          .sort((a, b) => a.seatIndex - b.seatIndex)
                          .map((card, cIdx) => {
                            const { seatIndex, categoryTitle, gradeTitle } =
                              card;
                            return (
                              <div className="flex w-full h-auto justify-center items-start break-after-page">
                                <ScoreCardRankForm
                                  seatIndex={seatIndex}
                                  categoryTitle={categoryTitle}
                                  gradeTitle={gradeTitle}
                                />
                              </div>
                            );
                          })}
                    </div>
                  </div>
                </div>
              );
            })}
        </>
      )}
    </div>
  );
};

export default ContestRankingSummaryPrintAll;
