import React, { useContext, useEffect, useMemo, useState } from "react";
import { BsCheckAll } from "react-icons/bs";
import LoadingPage from "./LoadingPage";
import { TiInputChecked } from "react-icons/ti";
import { TfiWrite } from "react-icons/tfi";
import { CiMobile3 } from "react-icons/ci";
import { BsBrowserChrome } from "react-icons/bs";
import { v4 as uuidv4 } from "uuid";
import {
  useFirestoreGetDocument,
  useFirestoreQuery,
  useFirestoreUpdateData,
} from "../hooks/useFirestores";
import { where } from "firebase/firestore";
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import { Checkbox } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { TbWorldWww } from "react-icons/tb";
import ConfirmationModal from "../messageBox/ConfirmationModal";

const ContestPlayerOrderTable = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [msgOpen, setMsgOpen] = useState(false);
  const [message, setMessage] = useState({});

  const [matchedArray, setMatchedArray] = useState([]);
  const [categorysArray, setCategorysArray] = useState([]);
  const [playersArray, setPlayersArray] = useState([]);
  const [playersAssign, setPlayersAssign] = useState({});
  const [playersFinal, setPlayersFinal] = useState({});
  const [gradesArray, setGradesArray] = useState([]);
  const [entrysArray, setEntrysArray] = useState([]);
  const [entryTitle, setEntryTitle] = useState("");
  const { currentContest, setCurrentContest } = useContext(
    CurrentContestContext
  );

  const fetchCategoryDocument = useFirestoreGetDocument(
    "contest_categorys_list"
  );
  const fetchGradeDocument = useFirestoreGetDocument("contest_grades_list");
  const fetchPlayersAssignDocument = useFirestoreGetDocument(
    "contest_players_assign"
  );
  const fetchPlayersFinalDocument = useFirestoreGetDocument(
    "contest_players_final"
  );
  const updatePlayersAssign = useFirestoreUpdateData("contest_players_assign");
  const updatePlayersFinal = useFirestoreUpdateData("contest_players_final");
  const fetchEntry = useFirestoreQuery();

  const fetchPool = async () => {
    if (currentContest.contests.contestCategorysListId) {
      const returnCategorys = await fetchCategoryDocument.getDocument(
        currentContest.contests.contestCategorysListId
      );

      if (returnCategorys?.categorys?.length > 0) {
        setCategorysArray([
          ...returnCategorys?.categorys.sort(
            (a, b) => a.contestCategoryIndex - b.contestCategoryIndex
          ),
        ]);
      } else {
        setCategorysArray([]);
      }

      const returnGrades = await fetchGradeDocument.getDocument(
        currentContest.contests.contestGradesListId
      );

      setGradesArray([...returnGrades?.grades]);

      const condition = [where("contestId", "==", currentContest.contests.id)];

      const returnEntrys = await fetchEntry.getDocuments(
        "contest_entrys_list",
        condition
      );
      setEntrysArray([...returnEntrys]);

      const returnPlayersAssign = await fetchPlayersAssignDocument.getDocument(
        currentContest.contests.contestPlayersAssignId
      );

      setPlayersAssign({ ...returnPlayersAssign });
      setPlayersArray([...returnPlayersAssign?.players]);

      const returnPlayersFinal = await fetchPlayersFinalDocument.getDocument(
        currentContest.contests.contestPlayersFinalId
      );

      setPlayersFinal({ ...returnPlayersFinal });
    }
  };

  const initEntryList = () => {
    setIsLoading(true);
    setEntryTitle(() => "초기명단/계측명단 출력불가능");
    let dummy = [];
    let playerNumber = 0;

    categorysArray
      .sort((a, b) => a.contestCategoryIndex - b.contestCategoryIndex)
      .map((category, cIdx) => {
        const matchedGrades = gradesArray.filter(
          (grade) => grade.refCategoryId === category.contestCategoryId
        );
        const matchedGradesLength = matchedGrades.length;

        matchedGrades
          .sort((a, b) => a.contestGradeIndex - b.contestGradeIndex)
          .map((grade, gIdx) => {
            const matchedPlayerWithPlayerNumber = [];
            const matchedPlayers = entrysArray.filter(
              (entry) => entry.contestGradeId === grade.contestGradeId
            );
            // .sort((a, b) => {
            //   const dateA = new Date(a.invoiceCreateAt);
            //   const dateB = new Date(b.invoiceCreateAt);
            //   return dateA.getTime() - dateB.getTime();
            // });

            matchedPlayers.map((player, pIdx) => {
              playerNumber++;
              const newPlayer = {
                ...player,
                playerNumber,
                playerNoShow: false,
                playerIndex: playerNumber,
              };
              matchedPlayerWithPlayerNumber.push({ ...newPlayer });
            });

            const matchedInfo = {
              ...category,
              ...grade,
              matchedPlayers: matchedPlayerWithPlayerNumber,
              matchedGradesLength,
            };
            dummy.push({ ...matchedInfo });
          });
      });

    setMatchedArray([...dummy]);
    setIsLoading(false);
  };

  const fetchEntryList = () => {
    setIsLoading(true);
    let dummy = [];
    setEntryTitle(() => "저장된명단/계측명단 출력가능");

    categorysArray
      .sort((a, b) => a.contestCategoryIndex - b.contestCategoryIndex)
      .map((category, cIdx) => {
        const matchedGrades = gradesArray.filter(
          (grade) => grade.refCategoryId === category.contestCategoryId
        );
        const matchedGradesLength = matchedGrades.length;

        matchedGrades
          .sort((a, b) => a.contestGradeIndex - b.contestGradeIndex)
          .map((grade, gIdx) => {
            const matchedPlayerWithPlayerNumber = [];
            const matchedPlayers = playersArray.filter(
              (entry) => entry.contestGradeId === grade.contestGradeId
            );
            // .sort((a, b) => {
            //   const dateA = new Date(a.invoiceCreateAt);
            //   const dateB = new Date(b.invoiceCreateAt);
            //   return dateA.getTime() - dateB.getTime();
            // });

            matchedPlayers
              .sort((a, b) => a.playerIndex - b.playerIndex)
              .map((player, pIdx) => {
                const { playerNumber } = player;

                const newPlayer = {
                  ...player,
                  playerNumber,
                  playerNoShow: false,
                  playerIndex: playerNumber,
                };
                matchedPlayerWithPlayerNumber.push({ ...newPlayer });
              });

            const matchedInfo = {
              ...category,
              ...grade,
              matchedPlayers: matchedPlayerWithPlayerNumber,
              matchedGradesLength,
            };
            dummy.push({ ...matchedInfo });
          });
      });

    setMatchedArray([...dummy]);

    setIsLoading(false);
  };

  const handleUpdatePlayersAssign = async (assignId, finalId) => {
    const newPlayersAssign = { ...playersAssign, players: [...dummyArray] };
    const newPlayersFinal = { ...playersFinal, players: [...dummyArray] };
    try {
      await updatePlayersAssign.updateData(assignId, newPlayersAssign);
      await updatePlayersFinal.updateData(finalId, newPlayersFinal).then(() => {
        setMessage({
          body: "저장되었습니다.",
          isButton: true,
          confirmButtonText: "확인",
        });
        setMsgOpen(true);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onDragPlayerEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const newMatchedArray = [...matchedArray];
    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    // Find the player that was dragged
    const draggedPlayer = newMatchedArray[
      sourceIndex.parentIndex
    ].matchedPlayers.find((player) => player.playerUid === draggableId);

    // Remove the player from the source category and grade
    newMatchedArray[sourceIndex.parentIndex].matchedPlayers.splice(
      sourceIndex.childIndex,
      1
    );

    // Insert the player at the destination category and grade
    newMatchedArray[destinationIndex.parentIndex].matchedPlayers.splice(
      destinationIndex.childIndex,
      0,
      draggedPlayer
    );
    // Flatten all matchedPlayers into a single array to update playerNumber and playerIndex
    const allPlayers = newMatchedArray.flatMap(
      (matched) => matched.matchedPlayers
    );

    // Update playerNumber and playerIndex based on the new order
    allPlayers.forEach((player, index) => {
      player.playerNumber = index + 1;
      player.playerIndex = index + 1; // If you want to update playerIndex based on playerNumber, use 'player.playerNumber' instead of 'index + 1'
    });

    setMatchedArray(newMatchedArray);
  };

  useEffect(() => {
    fetchPool();
  }, [currentContest]);

  useEffect(() => {
    if (categorysArray.length > 0 && playersArray?.length > 0) {
      fetchEntryList();
    } else if (categorysArray.length > 0 && playersArray?.length === 0) {
      initEntryList();
    }
  }, [categorysArray, gradesArray, entrysArray, playersArray]);

  const dummyArray = [];

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg p-2 gap-y-2">
      {isLoading ? (
        <div className="flex w-full h-screen justify-center items-center">
          <LoadingPage />
        </div>
      ) : (
        <>
          <div className="flex w-full h-full">
            <ConfirmationModal
              isOpen={msgOpen}
              message={message}
              onCancel={() => setMsgOpen(false)}
              onConfirm={() => setMsgOpen(false)}
            />
            <div className="flex w-full justify-start items-center">
              <div className="flex w-full h-full justify-start lg:px-2 lg:pt-2 flex-col bg-gray-100 rounded-lg gap-y-2">
                <div className="flex w-full gap-x-5">
                  <button
                    className="w-full h-12 bg-gradient-to-l from-green-300 to-green-200 rounded-lg"
                    onClick={() => {
                      initEntryList();
                      setMessage({
                        body: "초기화되었습니다.",
                        isButton: true,
                        confirmButtonText: "확인",
                      });
                      setMsgOpen(true);
                    }}
                  >
                    초기화(신규등록선수 있을경우)
                  </button>
                  <button
                    className="w-full h-12 bg-gradient-to-r from-blue-300 to-cyan-200 rounded-lg"
                    onClick={() =>
                      handleUpdatePlayersAssign(
                        currentContest.contests.contestPlayersAssignId,
                        currentContest.contests.contestPlayersFinalId
                      )
                    }
                  >
                    계측명단 저장
                  </button>
                </div>
                {matchedArray.length > 0 &&
                  matchedArray
                    .sort(
                      (a, b) => a.contestCategoryIndex - b.contestCategoryIndex
                    )
                    .map((matched, mIdx) => {
                      const {
                        contestCategoryId: categoryId,
                        contestCategoryIndex: categoryIndex,
                        contestCategoryTitle: categoryTitle,
                        contestGradeId: gradeId,
                        contestGradeIndex: gradeIndex,
                        contestGradeTitle: gradeTitle,
                        matchedPlayers,
                        matchedGradesLength: gradeLength,
                      } = matched;

                      if (matchedPlayers.length === 0) {
                        return null;
                      } else {
                        dummyArray.push(...matchedPlayers);
                      }

                      let categoryNumber = 0;
                      return (
                        <div
                          className="flex w-full h-auto bg-blue-300 flex-col rounded-lg"
                          key={mIdx}
                        >
                          <div className="flex flex-col p-1 lg:p-2 gap-y-2">
                            <div className="flex flex-col bg-blue-100 rounded-lg">
                              <div className="flex h-10 items-center px-2">
                                {categoryTitle}({gradeTitle})
                              </div>

                              <div className="flex flex-col w-full lg:p-2">
                                <div className="flex flex-col w-full bg-white p-2 border border-b-2 border-gray-400 rounded-lg">
                                  <div className="flex w-full border-b border-gray-300 h-8 items-center text-sm lg:px-2">
                                    <div className="flex w-1/6">순번</div>
                                    <div className="flex w-1/6">선수번호</div>
                                    <div className="flex w-1/6">이름</div>
                                    <div className="flex w-1/6">소속</div>
                                    <div className="hidden lg:flex w-1/6">
                                      신청일
                                    </div>
                                  </div>

                                  <DragDropContext onDragEnd={onDragPlayerEnd}>
                                    <Droppable droppableId="players">
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.droppableProps}
                                        >
                                          {matchedPlayers
                                            .sort(
                                              (a, b) =>
                                                a.playerIndex - b.playerIndex
                                            )
                                            .map((player, pIdx) => {
                                              const {
                                                playerName,
                                                playerGym,
                                                playerUid,
                                                playerNumber,
                                                createBy,
                                                invoiceCreateAt,
                                              } = player;

                                              return (
                                                <Draggable
                                                  draggableId={playerUid}
                                                  index={{
                                                    parentIndex: mIdx,
                                                    childIndex: pIdx,
                                                  }}
                                                  key={playerUid}
                                                >
                                                  {(provided, snapshot) => (
                                                    <div
                                                      className={`${
                                                        snapshot.isDragging
                                                          ? "flex w-full h-10 border-b border-gray-300 items-center text-sm lg:px-2 bg-blue-400 text-white"
                                                          : "flex w-full h-10 border-b border-gray-300 items-center text-sm lg:px-2"
                                                      }`}
                                                      key={playerUid}
                                                      id={playerUid}
                                                      ref={provided.innerRef}
                                                      {...provided.dragHandleProps}
                                                      {...provided.draggableProps}
                                                    >
                                                      <div className="flex w-1/6">
                                                        {pIdx + 1}
                                                      </div>
                                                      <div className="flex w-1/6">
                                                        {playerNumber}
                                                      </div>
                                                      <div className="flex w-1/6 justify-start items-center gap-x-2">
                                                        {playerName}{" "}
                                                        {createBy ===
                                                          "manual" && (
                                                          <span className="text-green-600 text-lg">
                                                            <TfiWrite />
                                                          </span>
                                                        )}
                                                        {createBy ===
                                                          undefined && (
                                                          <span className="text-blue-600 text-lg">
                                                            <TbWorldWww />
                                                          </span>
                                                        )}
                                                      </div>
                                                      <div className="flex w-1/6">
                                                        {playerGym}
                                                      </div>

                                                      <div className="hidden lg:flex w-1/6">
                                                        {invoiceCreateAt}
                                                      </div>
                                                    </div>
                                                  )}
                                                </Draggable>
                                              );
                                            })}
                                          {provided.placeholder}
                                        </div>
                                      )}
                                    </Droppable>
                                  </DragDropContext>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
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
