import React, { useContext, useEffect, useState } from "react";
import { TbHeartRateMonitor } from "react-icons/tb";
import { useLocation } from "react-router-dom";
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import { useFirestoreQuery } from "../hooks/useFirestores";
import { where } from "firebase/firestore";

const ContestRankSummary = () => {
  const [basicInfo, setBasicInfo] = useState({});
  const [scoreData, setScoreData] = useState([]);
  const location = useLocation();
  const { currentContest } = useContext(CurrentContestContext);

  const scoreRankQuery = useFirestoreQuery();

  const fetchScoreRank = async () => {
    const condidtion = [
      where("contestId", "==", currentContest.contests.id),
      where("categoryId", "==", basicInfo.categoryId),
      where("gradeId", "==", basicInfo.gradeId),
    ];
    const returnData = await scoreRankQuery.getDocuments(
      currentContest.contestInfo.contestCollectionName,
      condidtion
    );

    if (returnData.length > 0) {
      setScoreData(returnData.sort((a, b) => a.seatIndex - b.seatIndex));
    }

    console.log(returnData);
  };

  useEffect(() => {
    setBasicInfo({ ...location.state });
  }, [location]);

  useEffect(() => {
    if (basicInfo.gradeId && currentContest?.contests?.id) {
      fetchScoreRank();
    }
  }, [basicInfo, currentContest]);

  useEffect(() => {
    console.log(scoreData);
  }, [scoreData]);

  const ScoreTable = ({ data }) => {
    const playersGroup = data.reduce((acc, item) => {
      if (!acc[item.playerIndex]) {
        acc[item.playerIndex] = [];
      }
      acc[item.playerIndex].push(item);
      return acc;
    }, {});

    const orderedPlayers = Object.entries(playersGroup).sort(
      ([playerIndex1], [playerIndex2]) => playerIndex1 - playerIndex2
    );

    const judgesGroup = data.reduce((acc, item) => {
      if (!acc[item.judgeUId]) {
        acc[item.judgeUId] = [];
      }
      acc[item.judgeUId].push(item);
      return acc;
    }, {});

    const orderedJudges = Object.entries(judgesGroup).sort(
      ([, group1], [, group2]) => group1[0].seatIndex - group2[0].seatIndex
    );

    orderedPlayers.forEach(([, scores]) => {
      let minScore = scores[0];
      let maxScore = scores[0];
      for (let i = 1; i < scores.length; i++) {
        if (scores[i].playerScore < minScore.playerScore) {
          minScore = scores[i];
        }
        if (scores[i].playerScore > maxScore.playerScore) {
          maxScore = scores[i];
        }
      }
      minScore.isMin = true;
      maxScore.isMax = true;
    });

    // Calculate total score and rank for each player
    const playerRanks = orderedPlayers
      .map(([playerIndex, scores]) => {
        const totalScore = scores.reduce(
          (sum, score) =>
            score.isMin || score.isMax ? sum : sum + score.playerScore,
          0
        );
        return { playerIndex, totalScore };
      })
      .sort((a, b) => a.totalScore - b.totalScore)
      .map((player, index) => ({ ...player, rank: index + 1 }));

    return (
      <div className="flex w-full flex-col px-5 py-2border">
        <div className="flex w-full border-b-2 border-b-gray-600">
          <div className="flex w-full justify-center items-center p-2">
            선수번호
          </div>
          <div className="flex w-full justify-center items-center p-2">
            순위
          </div>
          {orderedJudges.map(([, group]) => (
            <div
              className="flex w-full justify-center items-center p-2"
              key={group[0].seatIndex}
            >
              {group[0].seatIndex}
            </div>
          ))}
          <div className="flex w-full justify-center items-center p-2">
            기표합산
          </div>
        </div>
        {orderedPlayers.map(([playerIndex, scores]) => {
          const totalScore = scores.reduce(
            (sum, score) =>
              score.isMin || score.isMax ? sum : sum + score.playerScore,
            0
          );
          const playerRank = playerRanks.find(
            (player) => player.playerIndex === playerIndex
          ).rank;
          return (
            <div
              key={playerIndex}
              className="flex w-full border-b border-b-gray-300"
            >
              <div className="flex w-full justify-center items-center p-2">
                {scores[0].playerNumber}
              </div>
              <div className="flex w-full justify-center items-center p-2">
                {playerRank}
              </div>
              {orderedJudges.map(([judgeId]) => {
                const score = scores.find(
                  (score) => score.judgeUId === judgeId
                );
                return (
                  <div
                    className="flex w-full justify-center items-center p-2"
                    key={judgeId}
                  >
                    {score && score.isMin && (
                      <span className="w-auto h-auto p-3 px-5 rounded-lg bg-red-300">
                        {score.playerScore}
                      </span>
                    )}
                    {score && score.isMax && (
                      <span className="w-auto h-auto p-3 px-5 rounded-lg bg-blue-300">
                        {score.playerScore}
                      </span>
                    )}
                    {score && !score.isMax && !score.isMin && (
                      <span className="w-auto h-auto p-3 rounded-lg ">
                        {score.playerScore}
                      </span>
                    )}
                  </div>
                );
              })}
              <div className="flex w-full justify-center items-center p-2">
                {totalScore}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
            집계표
          </h1>
        </div>
      </div>
      <div className="flex w-full h-auto">
        <div className="flex w-full h-10 bg-gray-100 justify-start items-center rounded-lg px-3">
          <div className="flex w-full h-full justify-start ml-5 items-center">
            {basicInfo.categoryTitle}({basicInfo.gradeTitle})
          </div>
        </div>
      </div>
      <div className="flex w-full h-auto">
        <div className="flex w-full h-auto bg-gray-100 justify-start items-center rounded-lg p-3">
          <div className="flex w-full h-full justify-center items-center bg-red-200">
            <div className="flex bg-white w-full h-auto p-2">
              <ScoreTable data={scoreData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestRankSummary;
