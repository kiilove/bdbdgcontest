import React, { useRef } from "react";
import { useEffect } from "react";
import { useFirestoreAddData, useFirestoreQuery } from "../hooks/useFirestores";
import { where } from "firebase/firestore";
import { useState } from "react";
import { array } from "yup";
import PrintAwardForm from "./PrintAwardForm";
import dayjs from "dayjs";
import { generateToday } from "../functions/functions";
import ReactToPrint from "react-to-print";

const PrintAward = ({ props, setClose }) => {
  const [resultsArray, setResultsArray] = useState([]);
  const [currentResult, setCurrentResult] = useState([]);
  const [awardList, setAwardList] = useState([]);
  const [currentAwardList, setCurrentAwardList] = useState([]);
  const fetchResults = useFirestoreQuery();
  const addAward = useFirestoreAddData("contest_award_list");
  const fetchQuery = useFirestoreQuery();
  const [currentAwardNumber, setCurrentAwardNumber] = useState(1);
  const printRef = useRef();

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

    try {
      await fetchResults
        .getDocuments("contest_award_list", condition)
        .then((data) => {
          if (data?.length > 0) {
            const filterd = data.filter(
              (f) => f.madeYear === dayjs(generateToday()).year()
            );
            if (filterd.length === 0) {
              setCurrentAwardNumber(1);
            } else {
              setCurrentAwardNumber(filterd.length + 1);
            }
            setAwardList(() => [
              ...data.sort((a, b) =>
                a.categoryTitle.localeCompare(b.categoryTitle)
              ),
            ]);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddAward = async (awardList) => {
    const newList = awardList.filter((f) => f.isAward === true);
    if (newList.length > 0) {
      newList.map(async (list, lIdx) => {
        try {
          await addAward
            .addData({ ...list, isMaded: true })
            .then((data) => {
              console.log(data);
            })
            .then(() => {
              const newList = [...currentAwardList];
              newList.push({ ...list, isMaded: true });
              setCurrentAwardList(() => [...newList]);
            });
        } catch (error) {
          console.log(error);
        }
      });
    }
  };

  const handleCurrentResult = (resultId, resultArray) => {
    if (resultId === "noId") {
      return;
    }

    const findResult = resultArray.find((f) => f.id === resultId);
    if (findResult) {
      const newPlayerInfo = {
        ...findResult,
      };

      const flattenPlayerInfo = newPlayerInfo?.result?.map((player, pIdx) => {
        const { playerName, playerGym, playerNumber, playerRank, playerUid } =
          player;
        const { categoryId, categoryTitle, gradeId, gradeTitle, contestId } =
          newPlayerInfo;
        const newInfo = {
          categoryId,
          categoryTitle,
          gradeId,
          gradeTitle,
          contestId,
          playerName,
          playerGym,
          playerNumber,
          playerRank,
          playerUid,
          isAward: false,
          isMaded: false,
          madeYear: dayjs(generateToday()).year().toString(),
          awardNumber: currentAwardNumber + pIdx,
        };

        return newInfo;
      });

      console.log(flattenPlayerInfo);

      setCurrentResult(() => [...flattenPlayerInfo]);
    }
  };

  const handleCheckAllAwardPlayer = (e) => {
    const { name, checked, value } = e.target;
    console.log(checked);

    const newArray = [...currentResult];
    const newChecked = newArray.map((arr, aIdx) => {
      if (!arr.isMaded) {
        const newInfo = { ...arr, isAward: checked };
        console.log(newInfo);
        return newInfo;
      }
    });
    console.log(newArray);

    setCurrentResult(() => [...newChecked]);
  };
  const handleCheckAwardPlayer = (e, resultIndex) => {
    const { name, checked, value } = e.target;

    const findIndexPlayer = currentResult.findIndex(
      (f) => f.playerUid === name
    );
    const newInfo = { ...currentResult[findIndexPlayer], isAward: checked };
    const newArray = [...currentResult];
    newArray.splice(findIndexPlayer, 1, { ...newInfo });
    setCurrentResult(() => [...newArray]);

    console.log(newInfo);
  };

  useEffect(() => {
    console.log(currentResult);
    if (currentResult?.length > 0) {
      let dummy = [];
      currentResult.map((item, idx) => {
        const { contestId, categoryId, gradeId, playerUid } = item;
        const findAward = awardList.findIndex(
          (f) =>
            f.contestId === contestId &&
            f.categoryId === categoryId &&
            f.gradeId === gradeId &&
            f.playerUid === playerUid
        );
        if (findAward != -1) {
          dummy.push({ ...item });
        }
      });
      setCurrentAwardList(() => [...dummy]);
    }
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
    <div className="flex w-full h-full bg-gray-100 justify-center items-start  overflow-auto">
      <div className="flex flex-col w-full h-full justify-start items-center gap-y-2 bg-white">
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
              <button onClick={() => handleAddAward(currentResult)}>
                상장만들기
              </button>
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
                    onChange={(e) => handleCheckAllAwardPlayer(e)}
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
              {currentResult.length > 0 &&
                currentResult
                  .sort((a, b) => a.playerRank - b.playerRank)
                  .map((player, pIdx) => {
                    const {
                      playerRank,
                      playerName,
                      playerNumber,
                      playerGym,
                      playerUid,
                      isAward,
                      isMaded,
                    } = player;
                    return (
                      <div className="flex w-full">
                        <div
                          className="flex h-10 justify-center items-center"
                          style={{ width: "10%" }}
                        >
                          {isMaded ? (
                            <span>완료</span>
                          ) : (
                            <input
                              type="checkbox"
                              value={playerUid}
                              checked={isAward}
                              name={playerUid}
                              onChange={(e) => handleCheckAwardPlayer(e, pIdx)}
                            />
                          )}
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
        <div className="flex w-full h-10">
          <ReactToPrint
            trigger={() => (
              <button className="w-40 h-10 bg-blue-300 rounded-lg">
                상장출력
              </button>
            )}
            content={() => printRef.current}
            pageStyle="@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; box-shadow:none; } }"
          />
        </div>
        <div
          className="flex flex-col w-full h-full bg-white gap-y-2 justify-start items-center"
          ref={printRef}
        >
          {currentAwardList.length > 0 &&
            currentAwardList.map((award, aIdx) => {
              const {
                playerName,
                awardNumber,
                categoryTitle,
                gradeTitle,
                playerRank,
                playerGym,
              } = award;
              return (
                <div className="flex">
                  <div className="flex w-full flex-col p-10 break-after-page">
                    <PrintAwardForm
                      playerName={playerName}
                      playerRank={playerRank}
                      awardNumber={awardNumber}
                      categoryTitle={categoryTitle}
                      gradeTitle={gradeTitle}
                      playerGym={playerGym}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PrintAward;
