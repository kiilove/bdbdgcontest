import React from "react";
import { useEffect } from "react";
import { useFirestoreQuery } from "../hooks/useFirestores";
import { where } from "firebase/firestore";
import { useState } from "react";

const PrintAward = ({ props, setClose }) => {
  const [resultsArray, setResultsArray] = useState([]);
  const [currentResult, setCurrentResult] = useState({});
  const fetchResults = useFirestoreQuery();

  const fetchPool = async (contestId) => {
    const condition = [where("contestId", "==", contestId)];
    try {
      await fetchResults
        .getDocuments("contest_results_list", condition)
        .then((data) => {
          console.log(data);
          setResultsArray(() => [
            ...data.sort((a, b) =>
              a.categoryTitle.localeCompare(b.categoryTitle)
            ),
          ]);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCurrentResult = (resultId, resultArray) => {
    if (resultId === "noId") {
      return;
    }

    const findResult = resultArray.find((f) => f.id === resultId);
    if (findResult) {
      setCurrentResult(() => ({ ...findResult }));
    }
  };

  const handleCheckAwardPlayer = (e, resultIndex) => {
    const { name, checked } = e.target;
    console.log(name);
    let newPlayerInfo = {
      ...currentResult.result[resultIndex],
      isAward: checked,
    };

    console.log(newPlayerInfo);
    const newResult = currentResult;
    newResult.splice(resultIndex, 1, { ...newResult });
    setCurrentResult(() => ({ ...currentResult, result: [...newResult] }));
    // if (checked) {
    //   const findPlayerIndex = currentResult?.findIndex(
    //     (f) => f.playerUid === name
    //   );
    //   const newResultInfo = {
    //     ...currentResult.result[findPlayerIndex],
    //     isAward: true,
    //   };
    //   const newResult = [...currentResult.result];
    //   newResult.splice(findPlayerIndex, 1, { ...newResultInfo });
    //   setCurrentResult(() => ({ ...currentResult, result: [...newResult] }));
    // }

    // if (!checked) {
    //   const findPlayerIndex = currentResult?.findIndex(
    //     (f) => f.playerUid === name
    //   );
    //   const newResultInfo = {
    //     ...currentResult.result[findPlayerIndex],
    //     isAward: false,
    //   };
    //   const newResult = [...currentResult.result];
    //   newResult.splice(findPlayerIndex, 1, { ...newResultInfo });
    //   setCurrentResult(() => ({ ...currentResult, result: [...newResult] }));
    // }
  };

  useEffect(() => {
    console.log(currentResult);
  }, [currentResult]);

  useEffect(() => {
    if (props.contestId) {
      fetchPool(props.contestId);
    }
  }, [props]);

  const AwardForm = ({ playerName }) => {
    return (
      <div
        className="flex flex-col"
        style={{ width: "210mm", height: "297mm" }}
      >
        <div className="flex">상장</div>
      </div>
    );
  };

  return (
    <div className="flex w-full h-full bg-gray-100 justify-center items-start ">
      <div
        className="flex flex-col w-full h-full justify-start items-center gap-y-2 bg-white"
        style={{ width: "210mm" }}
      >
        <div className="flex w-full justify-center items-center h-10 p-3 ">
          <div className="flex w-full bg-blue-100 p-2 rounded-lg mt-5">
            <div className="flex w-1/2 justify-start">
              <select
                onChange={(e) =>
                  handleCurrentResult(e.target.value, resultsArray)
                }
              >
                <option value="noId">종목 선택</option>
                {resultsArray?.map((result) => {
                  const { categoryTitle, gradeTitle, id } = result;
                  return (
                    <option value={id}>
                      {categoryTitle}({gradeTitle})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex">
              <button>상장만들기</button>
            </div>
          </div>
        </div>
        <div className="flex w-full h-auto p-5 flex-col">
          {currentResult && (
            <>
              <div className="flex w-full bg-gray-300">
                <div
                  className="flex h-10 justify-center items-center"
                  style={{ width: "10%" }}
                >
                  <input
                    type="checkbox"
                    name="all"
                    onChange={(e) => handleCheckAwardPlayer(e)}
                  />
                </div>
                <div
                  className="flex h-10 justify-center items-center"
                  style={{ width: "10%" }}
                >
                  순위
                </div>
                <div
                  className="flex h-10 justify-center items-center"
                  style={{ width: "25%" }}
                >
                  선수번호
                </div>
                <div
                  className="flex h-10 justify-center items-center"
                  style={{ width: "25%" }}
                >
                  이름
                </div>
                <div
                  className="flex h-10 justify-center items-center"
                  style={{ width: "30%" }}
                >
                  소속
                </div>
              </div>
              {currentResult?.result
                ?.sort((a, b) => a.playerRank - b.playerRank)
                .map((player, pIdx) => {
                  const {
                    playerRank,
                    playerName,
                    playerNumber,
                    playerGym,
                    playerUid,
                  } = player;
                  return (
                    <div className="flex w-full">
                      <div
                        className="flex h-10 justify-center items-center"
                        style={{ width: "10%" }}
                      >
                        <input
                          type="checkbox"
                          value={playerNumber}
                          name={playerUid}
                          onChange={(e) => handleCheckAwardPlayer(e, pIdx)}
                        />
                      </div>
                      <div
                        className="flex h-10 justify-center items-center"
                        style={{ width: "10%" }}
                      >
                        {playerRank}
                      </div>
                      <div
                        className="flex h-10 justify-center items-center"
                        style={{ width: "25%" }}
                      >
                        {playerNumber}
                      </div>
                      <div
                        className="flex h-10 justify-center items-center"
                        style={{ width: "25%" }}
                      >
                        {playerName}
                      </div>
                      <div
                        className="flex h-10 justify-center items-center"
                        style={{ width: "40%" }}
                      >
                        {playerGym}
                      </div>
                    </div>
                  );
                })}
            </>
          )}
        </div>
        <div className="flex"></div>
      </div>
    </div>
  );
};

export default PrintAward;
