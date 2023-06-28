import React, { useContext, useEffect, useState } from "react";
import { BsCheckAll } from "react-icons/bs";
import LoadingPage from "./LoadingPage";
import { TiInputChecked } from "react-icons/ti";
import {
  useFirestoreGetDocument,
  useFirestoreQuery,
} from "../hooks/useFirestores";
import { where } from "firebase/firestore";
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import { Checkbox } from "@mui/material";

const ContestPlayerOrderTable = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [categorysArray, setCategorysArray] = useState([]);
  const [categorysList, setCategorysList] = useState({});
  const [gradesArray, setGradesArray] = useState([]);
  const [entrysArray, setEntrysArray] = useState([]);
  const { currentContest, setCurrentContest } = useContext(
    CurrentContestContext
  );

  const fetchCategoryDocument = useFirestoreGetDocument(
    "contest_categorys_list"
  );
  const fetchGradeDocument = useFirestoreGetDocument("contest_grades_list");
  const fetchEntry = useFirestoreQuery();
  let categoryNumber = 0;
  let totalPlayerNumber = 0;
  const fetchPool = async () => {
    if (currentContest.contests.contestCategorysListId) {
      const returnCategorys = await fetchCategoryDocument.getDocument(
        currentContest.contests.contestCategorysListId
      );

      setCategorysArray([
        ...returnCategorys?.categorys.sort(
          (a, b) => a.contestCategoryIndex - b.contestCategoryIndex
        ),
      ]);

      const returnGrades = await fetchGradeDocument.getDocument(
        currentContest.contests.contestGradesListId
      );

      setGradesArray([...returnGrades?.grades]);
    }

    const condition = [where("contestId", "==", currentContest.contests.id)];
    const returnEntrys = await fetchEntry.getDocuments(
      "contest_entrys_list",
      condition
    );
    setEntrysArray([...returnEntrys]);
  };

  useEffect(() => {
    console.log(currentContest);
    fetchPool();
  }, [currentContest]);

  useEffect(() => {
    console.log(categorysArray);
  }, [categorysArray]);

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg p-3 gap-y-2">
      {isLoading ? (
        <div className="flex w-full h-screen justify-center items-center">
          <LoadingPage />
        </div>
      ) : (
        <>
          <div className="flex w-full h-14">
            <div className="flex w-full bg-gray-100 justify-start items-center rounded-lg px-3">
              <span className="font-sans text-lg font-semibold w-6 h-6 flex justify-center items-center rounded-2xl bg-blue-400 text-white mr-3">
                <TiInputChecked />
              </span>
              <h1
                className="font-sans text-lg font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                선수명단
              </h1>
            </div>
          </div>
          <div className="flex w-full h-full ">
            <div className="flex w-full justify-start items-center">
              <div className="flex w-full h-full justify-start px-3 pt-3 flex-col bg-gray-100 rounded-lg gap-y-2">
                {categorysArray?.length > 0 &&
                  categorysArray
                    .sort(
                      (a, b) => a.contestCategoryIndex - b.contestCategoryIndex
                    )
                    .map((category, cIdx) => {
                      const {
                        contestCategoryId: categoryId,
                        contestCategoryIndex: categoryIndex,
                        contestCategoryTitle: categoryTitle,
                      } = category;
                      let gradeNumber = 0;

                      const matchedGrades = gradesArray
                        .filter((grade) => grade.refCategoryId === categoryId)
                        .sort(
                          (a, b) => a.contestGradeIndex - b.contestGradeIndex
                        );
                      const matchedPlayerCategory = entrysArray.some(
                        (entry) => entry.contestCategoryId === categoryId
                      );

                      matchedPlayerCategory && categoryNumber++;
                      return matchedPlayerCategory ? (
                        <div className="flex w-full h-auto bg-blue-200 flex-col rounded-lg">
                          <div className="flex flex-col p-2 gap-y-2">
                            {matchedGrades?.length > 0 &&
                              matchedGrades.map((match, mIdx) => {
                                const {
                                  contestGradeId: gradeId,
                                  contestGradeTitle: gradeTitle,
                                  contestGradeIndex: gradeIndex,
                                } = match;
                                const matchedPlayerGrade = entrysArray.some(
                                  (entry) => entry.contestGradeId === gradeId
                                );

                                matchedPlayerGrade && gradeNumber++;

                                const matchedPlayers = entrysArray
                                  .filter(
                                    (entry) => entry.contestGradeId === gradeId
                                  )
                                  .sort(
                                    (a, b) => a.playerIndex - b.playerIndex
                                  );

                                return matchedPlayerGrade ? (
                                  <div className="flex flex-col bg-blue-100 rounded-lg">
                                    <div className="flex h-10 items-center px-2">
                                      {categoryTitle}({gradeTitle})
                                    </div>

                                    <div className="flex flex-col w-full p-2">
                                      <div className="flex flex-col w-full bg-white p-2 border border-b-2 border-gray-400 rounded-lg">
                                        <div className="flex w-full border-b border-gray-300 h-8 items-center text-sm px-2">
                                          <div className="flex w-1/6">순번</div>
                                          <div className="flex w-1/6">
                                            선수번호
                                          </div>
                                          <div className="flex w-1/6">이름</div>
                                          <div className="flex w-2/6">소속</div>
                                          <div className="flex w-1/6">월체</div>
                                        </div>
                                        {matchedPlayers?.length > 0 &&
                                          matchedPlayers.map((player, pIdx) => {
                                            const { playerName, playerGym } =
                                              player;
                                            totalPlayerNumber++;

                                            return (
                                              <div className="flex w-full h-10 border-b border-gray-300 items-center text-sm px-2">
                                                <div className="flex w-1/6">
                                                  {pIdx + 1}
                                                </div>
                                                <div className="flex w-1/6">
                                                  {totalPlayerNumber}
                                                </div>
                                                <div className="flex w-1/6">
                                                  {playerName}
                                                </div>
                                                <div className="flex w-2/6">
                                                  {playerGym}
                                                </div>
                                                <div className="flex w-1/6">
                                                  <input type="checkbox" />
                                                </div>
                                              </div>
                                            );
                                          })}
                                      </div>
                                    </div>
                                  </div>
                                ) : null;
                              })}
                          </div>
                        </div>
                      ) : null;
                    })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContestPlayerOrderTable;
