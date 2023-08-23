import React from "react";
import ScoreSheet from "../components/ScoreSheet";
import { useState } from "react";
import { useFirestoreQuery } from "../hooks/useFirestores";
import { useContext } from "react";
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import { useEffect } from "react";
import { where } from "firebase/firestore";
import LoadingPage from "../pages/LoadingPage";

const ContestRankingSummaryPrintAll = ({ props, setClose }) => {
  const [resultTable, setResultTable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [judgesArray, setJudgesArray] = useState([]);
  const fetchQuery = useFirestoreQuery();
  const { currentContest } = useContext(CurrentContestContext);

  const fetchPool = async (propContestId, propGradeId) => {
    const condition = [
      where("contestId", "==", propContestId),
      where("gradeId", "==", propGradeId),
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(resultTable);
  }, [resultTable]);

  useEffect(() => {
    if (!props?.contestId || !props?.gradeId) {
      return;
    }
    fetchPool(props.contestId, props.gradeId);
  }, [props]);
  return (
    <div className="w-full h-auto flex flex-col bg-gray-100 justify-start items-center overflow-auto">
      {isLoading && <LoadingPage />}
      {!isLoading && (
        <>
          <div className="flex" onClick={() => setClose(false)}>
            닫기
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
                  style={{ width: "210mm", height: "297mm" }}
                >
                  <ScoreSheet
                    contestId={contestId}
                    contestInfo={currentContest.contestInfo}
                    gradeId={gradeId}
                    categoryTitle={categoryTitle}
                    gradeTitle={gradeTitle}
                    scoreTable={result}
                  />
                </div>
              );
            })}
        </>
      )}
    </div>
  );
};

export default ContestRankingSummaryPrintAll;
