import React, { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import LoadingPage from "./LoadingPage";
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import { useFirestoreGetDocument } from "../hooks/useFirestores";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { PiSplitHorizontalFill } from "react-icons/pi";

const ContestStagetable = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesArray, setCategoriesArray] = useState([]);
  const [gradesArray, setGradesArray] = useState([]);
  const [playersArray, setPlayersArray] = useState([]);
  const [stagesArray, setStagesArray] = useState([]);
  const { currentContest } = useContext(CurrentContestContext);

  const fetchCategoies = useFirestoreGetDocument("contest_categorys_list");
  const fetchGrades = useFirestoreGetDocument("contest_grades_list");
  const fetchPlayersAssign = useFirestoreGetDocument("contest_players_assign");

  const fetchPool = async () => {
    const returnCategoies = await fetchCategoies.getDocument(
      currentContest.contests.contestCategorysListId
    );
    const returnGrades = await fetchGrades.getDocument(
      currentContest.contests.contestGradesListId
    );
    const returnPlayersAssign = await fetchPlayersAssign.getDocument(
      currentContest.contests.contestPlayersAssignId
    );

    console.log(returnGrades);

    if (returnCategoies) {
      setCategoriesArray([
        ...returnCategoies.categorys.sort(
          (a, b) => a.contestCategoryIndex - b.contestCategoryIndex
        ),
      ]);
    }

    if (returnGrades) {
      setGradesArray([...returnGrades.grades]);
    }

    if (returnPlayersAssign) {
      setPlayersArray([...returnPlayersAssign.players]);
    }
  };

  const initStage = (contestId) => {
    const stages = [];
    let stageNumber = 0;

    categoriesArray
      .sort((a, b) => a.contestCategoryIndex - b.contestCategoryIndex)
      .map((category, cIdx) => {
        const {
          contestCategoryId: categoryId,
          contestCategoryTitle: categoryTitle,
        } = category;
        const matchedGrades = gradesArray.filter(
          (grade) => grade.refCategoryId === categoryId
        );

        if (matchedGrades?.length === 0) {
          return null;
        }
        matchedGrades
          .sort((a, b) => a.contestGradeIndex - b.contestGradeIndex)
          .map((grade, gIdx) => {
            const { contestGradeId: gradeId, contestGradeTitle: gradeTitle } =
              grade;

            const matchedPlayers = playersArray.filter(
              (player) => player.contestGradeId === gradeId
            );

            if (matchedPlayers?.length === 0) {
              return null;
            }

            stageNumber++;
            const newStageInfo = {
              stageId: uuidv4(),
              stageNumber,
              grades: [
                {
                  categoryId,
                  categoryTitle,
                  gradeId,
                  gradeTitle,
                  playerCount: matchedPlayers?.length,
                },
              ],
            };

            stages.push({ ...newStageInfo });
          });
      });
    setStagesArray([...stages]);
  };

  // const onDragEnd = (result) => {
  //   const { source, destination, draggableId, type } = result;
  //   if (!destination) return;

  //   if (type === "stage") {
  //     const [removed] = stagesArray.splice(source.index, 1);
  //     stagesArray.splice(destination.index, 0, removed);
  //     setStagesArray([...stagesArray]);
  //   } else {
  //     const sourceStageIndex = stagesArray.findIndex(
  //       (stage) => stage.stageId === source.droppableId
  //     );
  //     const destinationStageIndex = stagesArray.findIndex(
  //       (stage) => stage.stageId === destination.droppableId
  //     );

  //     const [removedGrade] = stagesArray[sourceStageIndex].grades.splice(
  //       source.index,
  //       1
  //     );
  //     stagesArray[destinationStageIndex].grades.splice(
  //       destination.index,
  //       0,
  //       removedGrade
  //     );
  //     setStagesArray([...stagesArray]);
  //   }

  //   let updatedStagesArray = [...stagesArray];
  //   if (source.droppableId === destination.droppableId) {
  //     // Reorder dragItems within the same stage (dragBase)
  //     const stageIndex = stagesArray.findIndex(
  //       (stage) => stage.stageId === source.droppableId
  //     );
  //     const [draggedItem] = updatedStagesArray[stageIndex].grades.splice(
  //       source.index,
  //       1
  //     );
  //     updatedStagesArray[stageIndex].grades.splice(
  //       destination.index,
  //       0,
  //       draggedItem
  //     );
  //   } else {
  //     // Move dragItem to a different stage
  //     const sourceStageIndex = stagesArray.findIndex(
  //       (stage) => stage.stageId === source.droppableId
  //     );
  //     const destinationStageIndex = stagesArray.findIndex(
  //       (stage) => stage.stageId === destination.droppableId
  //     );

  //     const [draggedItem] = updatedStagesArray[sourceStageIndex].grades.splice(
  //       source.index,
  //       1
  //     );
  //     updatedStagesArray[destinationStageIndex].grades.splice(
  //       destination.index,
  //       0,
  //       draggedItem
  //     );
  //   }

  //   // Filter out stages with no grades
  //   updatedStagesArray = updatedStagesArray.filter(
  //     (stage) => stage.grades.length > 0
  //   );

  //   // Recalculate stage numbers
  //   updatedStagesArray = updatedStagesArray.map((stage, index) => ({
  //     ...stage,
  //     stageNumber: index + 1,
  //   }));

  //   setStagesArray(updatedStagesArray);
  // };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    // if the item didn't move to a new spot
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // handling stage reordering
    if (type === "STAGE") {
      const newStagesArray = Array.from(stagesArray);
      const [removed] = newStagesArray.splice(source.index, 1);
      newStagesArray.splice(destination.index, 0, removed);

      // to reorder stage number
      newStagesArray.forEach((stage, idx) => {
        stage.stageNumber = idx + 1;
      });

      setStagesArray(newStagesArray);
      return;
    }

    const start = stagesArray.find(
      (stage) => stage.stageId === source.droppableId
    );
    const finish = stagesArray.find(
      (stage) => stage.stageId === destination.droppableId
    );

    // if dropped within the same list
    if (start === finish) {
      const newGradeIds = Array.from(start.grades);
      const [removed] = newGradeIds.splice(source.index, 1);
      newGradeIds.splice(destination.index, 0, removed);

      const newStage = {
        ...start,
        grades: newGradeIds,
      };

      let newStagesArray = stagesArray.map((stage) =>
        stage.stageId === start.stageId ? newStage : stage
      );

      // if grades array is empty after dropping, remove the stage
      newStagesArray = newStagesArray.filter(
        (stage) => stage.grades.length !== 0
      );

      // reorder stage number
      newStagesArray.forEach((stage, idx) => {
        stage.stageNumber = idx + 1;
      });

      setStagesArray(newStagesArray);
      return;
    }

    // if dropped in a different list
    const startGradeIds = Array.from(start.grades);
    const [removed] = startGradeIds.splice(source.index, 1);
    const newStart = {
      ...start,
      grades: startGradeIds,
    };

    const finishGradeIds = Array.from(finish.grades);
    finishGradeIds.splice(destination.index, 0, removed);
    const newFinish = {
      ...finish,
      grades: finishGradeIds,
    };

    let newStagesArray = stagesArray.map((stage) => {
      if (stage.stageId === start.stageId) {
        return newStart;
      }
      if (stage.stageId === finish.stageId) {
        return newFinish;
      }
      return stage;
    });

    // if grades array is empty after dropping, remove the stage
    newStagesArray = newStagesArray.filter(
      (stage) => stage.grades.length !== 0
    );

    // reorder stage number
    newStagesArray.forEach((stage, idx) => {
      stage.stageNumber = idx + 1;
    });

    setStagesArray(newStagesArray);
  };

  const splitStage = (stageId, gradeIndex) => {
    let updatedStagesArray = [...stagesArray];
    const stageIndex = updatedStagesArray.findIndex(
      (stage) => stage.stageId === stageId
    );

    if (stageIndex === -1) return; // stage not found, do nothing

    const [removedGrade] = updatedStagesArray[stageIndex].grades.splice(
      gradeIndex,
      1
    );

    const newStage = {
      stageId: uuidv4(),
      grades: [removedGrade],
    };

    // Insert the new stage after the current one
    updatedStagesArray.splice(stageIndex + 1, 0, newStage);

    // Recalculate stage numbers (optional, as it's not used in state)
    updatedStagesArray = updatedStagesArray.map((stage, index) => ({
      ...stage,
      stageNumber: index + 1,
    }));

    setStagesArray(updatedStagesArray);
  };

  useEffect(() => {
    if (currentContest?.contests) {
      initStage(currentContest.contests.id);
    }
  }, [categoriesArray, gradesArray, playersArray]);

  useEffect(() => {
    if (currentContest?.contests) {
      fetchPool();
    }
  }, [currentContest]);

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg p-2 gap-y-2">
      {isLoading ? (
        <div className="flex w-full h-screen justify-center items-center">
          <LoadingPage />
        </div>
      ) : (
        <>
          <div className="flex w-full h-full ">
            <div className="flex w-full justify-start items-center">
              <div className="flex w-full h-full justify-start lg:px-2 lg:pt-2 flex-col bg-gray-100 rounded-lg gap-y-2">
                <div className="flex w-full gap-x-5">
                  <button className="w-full h-12 bg-gradient-to-l from-green-300 to-green-200 rounded-lg">
                    초기화(계측명단 변동이 있는경우)
                  </button>
                  <button className="w-full h-12 bg-gradient-to-r from-blue-300 to-cyan-200 rounded-lg">
                    저장(대회진행을 위한 최종명단)
                  </button>
                </div>
                <div className="flex w-full h-auto bg-blue-300 flex-col rounded-lg gap-y-2">
                  <div className="flex flex-col p-1 lg:p-2 gap-y-2">
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="stages" type="STAGE">
                        {(provided) => (
                          <div
                            className="flex gap-y-2 flex-col w-full"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {stagesArray.map((stage, sIdx) => {
                              const { stageId, stageNumber, grades } = stage;

                              return (
                                <Draggable
                                  draggableId={stageId}
                                  index={sIdx}
                                  key={stageId}
                                >
                                  {(provided) => (
                                    <div
                                      className="flex w-full h-auto"
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <div className="flex w-full h-auto p-2 flex-col bg-gray-100 rounded-lg">
                                        <div className="flex h-10 items-center px-2">
                                          <span className="text-sm">
                                            무대순서 : {stageNumber}
                                          </span>
                                        </div>
                                        <Droppable
                                          droppableId={stageId}
                                          type="DRAG_ITEM"
                                        >
                                          {(provided) => (
                                            <div
                                              className="flex w-auto gap-2 flex-col"
                                              ref={provided.innerRef}
                                              {...provided.droppableProps}
                                            >
                                              {grades.map((grade, gIdx) => {
                                                const {
                                                  categoryId,
                                                  categoryTitle,
                                                  gradeId,
                                                  gradeTitle,
                                                  playerCount,
                                                } = grade;

                                                return (
                                                  <Draggable
                                                    draggableId={`${stageId}-${gIdx}`}
                                                    index={gIdx}
                                                    key={`${stageId}-${gIdx}`}
                                                  >
                                                    {(provided) => (
                                                      <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                      >
                                                        <div className="flex p-2 w-auto bg-blue-100 rounded-lg gap-x-2">
                                                          <span className="text-sm flex justify-start items-center">
                                                            {`${categoryTitle}(${gradeTitle})`}
                                                            <div className="flex justify-center items-center w-10 h-5 rounded-full bg-blue-500 text-xs text-gray-100 ml-5">
                                                              {playerCount}
                                                            </div>
                                                          </span>
                                                          <button
                                                            className="flex justify-center items-center w-10 h-5 rounded-full bg-blue-500 text-gray-100"
                                                            onClick={(e) => {
                                                              e.preventDefault();
                                                              e.stopPropagation();
                                                              splitStage(
                                                                stageId,
                                                                gIdx
                                                              );
                                                            }}
                                                          >
                                                            <PiSplitHorizontalFill />
                                                          </button>
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
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContestStagetable;
