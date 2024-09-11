import React, { useContext, useEffect, useState, useMemo } from "react";
import {
  useFirestoreGetDocument,
  useFirestoreQuery,
  useFirestoreUpdateData,
} from "../hooks/useFirestores";
import { where } from "firebase/firestore";
import LoadingPage from "./LoadingPage";
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import ConfirmationModal from "../messageBox/ConfirmationModal";
import { generateUUID } from "../functions/functions";

const ContestJudgeAssignTable = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubTab, setCurrentSubTab] = useState("0");
  const [msgOpen, setMsgOpen] = useState(false);
  const [message, setMessage] = useState({});
  const [judgesAssignInfo, setJudgesAssignInfo] = useState({});
  const [judgesPoolArray, setJudgesPoolArray] = useState([]);
  const [categoriesArray, setCategoriesArray] = useState([]);
  const [gradesArray, setGradesArray] = useState([]);

  const { currentContest } = useContext(CurrentContestContext);
  const fetchJudgesAssign = useFirestoreGetDocument("contest_judges_assign");
  const fetchCategories = useFirestoreGetDocument("contest_categorys_list");
  const fetchGrades = useFirestoreGetDocument("contest_grades_list");
  const fetchJudgesPoolQuery = useFirestoreQuery();
  const updateJudgesAssign = useFirestoreUpdateData("contest_judges_assign");

  // 데이터 가져오기 함수
  const fetchPool = async (contestId) => {
    try {
      const [judgesPool, judgesAssign, categories, grades] = await Promise.all([
        fetchJudgesPoolQuery.getDocuments("contest_judges_pool", [
          where("contestId", "==", contestId),
        ]),
        fetchJudgesAssign.getDocument(
          currentContest.contests.contestJudgesAssignId
        ),
        fetchCategories.getDocument(
          currentContest.contests.contestCategorysListId
        ),
        fetchGrades.getDocument(currentContest.contests.contestGradesListId),
      ]);

      setJudgesPoolArray(judgesPool);
      setJudgesAssignInfo(judgesAssign);
      setCategoriesArray(categories.categorys);
      setGradesArray(grades.grades);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 심사위원 할당 업데이트 함수
  const handleUpdateJudgesAssign = async () => {
    try {
      setMessage({ body: "저장중...", isButton: false });
      setMsgOpen(true);
      await updateJudgesAssign.updateData(
        judgesAssignInfo.id,
        judgesAssignInfo
      );
      setMessage({
        body: "저장되었습니다.",
        isButton: true,
        confirmButtonText: "확인",
      });
    } catch (error) {
      console.log(error);
    }
  };

  // 심사위원 할당 및 삭제 처리 함수
  const updateAssignArray = (
    originArr,
    seatIndex,
    grades,
    judgeInfo,
    isAdding
  ) => {
    const updatedArr = originArr.filter(
      (assign) =>
        !grades.some(
          (grade) =>
            assign.contestGradeId === grade.contestGradeId &&
            assign.seatIndex === seatIndex
        )
    );

    if (isAdding) {
      grades.forEach((grade) => {
        updatedArr.push({
          ...grade,
          judgeName: judgeInfo.judgeName,
          judgeUid: judgeInfo.judgeUid,
          onedayPassword: judgeInfo.onedayPassword,
          isHead: judgeInfo.isHead,
          seatIndex,
          categoryId: grade.refCategoryId,
          judgesAssignId: generateUUID(),
          contestId: currentContest.contests.id,
        });
      });
    }

    return updatedArr;
  };

  // 심사위원 선택 핸들러
  const handleSelectJudge = (sectionName, seatIndex, judgeUid) => {
    console.log("선택한 심사위원 UID:", judgeUid);

    // 선택한 심사위원 정보 가져오기
    const selectedJudge = judgesPoolArray.find(
      (judge) => judge.judgeUid === judgeUid
    );
    console.log("선택한 심사위원 정보:", selectedJudge);

    // 선택한 섹션에서 해당 좌석의 등급 정보 가져오기
    const sectionGrades = filteredBySection.find(
      (section) => section.sectionName === sectionName
    )?.sectionGrades;
    console.log("선택된 섹션 정보:", sectionGrades);

    if (sectionGrades && selectedJudge) {
      // 기존 할당 배열에서 선택된 좌석의 심사위원 정보 업데이트
      const newAssignArray = updateAssignArray(
        judgesAssignInfo.judges,
        seatIndex,
        sectionGrades,
        selectedJudge,
        true
      );

      console.log("업데이트된 할당 배열:", newAssignArray);

      // 업데이트된 할당 배열을 상태에 저장
      setJudgesAssignInfo((prev) => ({ ...prev, judges: newAssignArray }));
      console.log("상태 업데이트 완료:", judgesAssignInfo);
    }
  };

  // 섹션별 필터링
  const filteredBySection = useMemo(() => {
    return categoriesArray.reduce((acc, curr) => {
      const section = acc.find(
        (item) => item.sectionName === curr.contestCategorySection
      );
      const matchingGrades = gradesArray.filter(
        (grade) => grade.refCategoryId === curr.contestCategoryId
      );

      if (!section) {
        acc.push({
          sectionName: curr.contestCategorySection,
          sectionCategory: [curr],
          sectionGrades: matchingGrades,
        });
      } else {
        section.sectionCategory.push(curr);
        section.sectionGrades.push(...matchingGrades);
      }

      return acc;
    }, []);
  }, [categoriesArray, gradesArray]);

  useEffect(() => {
    if (currentContest?.contests?.id) {
      fetchPool(currentContest.contests.id);
    }
    setCurrentSubTab("0");
  }, [currentContest]);

  return (
    <div className="flex flex-col lg:flex-row gap-y-2 w-full h-auto bg-white mb-3 rounded-t-lg rounded-b-lg p-2 gap-x-4">
      {isLoading ? (
        <LoadingPage />
      ) : (
        <>
          <div className="w-full bg-gray-100 flex rounded-lg flex-col p-2 h-full gap-y-2">
            <ConfirmationModal
              isOpen={msgOpen}
              message={message}
              onCancel={() => setMsgOpen(false)}
              onConfirm={() => setMsgOpen(false)}
            />
            <div className="flex w-full h-auto justify-start items-center">
              {["섹션별", "종목별", "체급별"].map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSubTab(idx.toString())}
                  className={`w-40 h-10 ${
                    currentSubTab === idx.toString()
                      ? "bg-blue-500 text-gray-100"
                      : "bg-white text-gray-700 border-t border-r"
                  } rounded-t-lg`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex bg-gray-100 h-auto rounded-lg justify-start items-center flex-col gap-y-2">
              <button
                className="w-full h-12 bg-gradient-to-r from-blue-300 to-cyan-200 rounded-lg"
                onClick={handleUpdateJudgesAssign}
              >
                저장
              </button>

              {currentSubTab === "0" && filteredBySection.length > 0 && (
                <div className="flex w-full flex-col bg-gray-100 rounded-lg gap-y-2">
                  {filteredBySection.map((section, sectionIdx) => (
                    <div
                      key={sectionIdx}
                      className="flex w-full flex-col bg-blue-200 rounded-lg"
                    >
                      <div className="h-auto w-full flex items-center flex-col lg:flex-row">
                        <div className="flex w-1/6 h-14 justify-start items-center pl-4">
                          {section.sectionName}
                        </div>
                      </div>
                      <div className="flex p-2">
                        <div className="flex bg-gray-100 w-full gap-2 p-2 rounded-lg flex-col">
                          <div className="flex w-full bg-white rounded-lg p-2">
                            <div className="w-1/6">좌석</div>
                            <div className="w-5/6">선택</div>
                          </div>
                          {Array.from(
                            {
                              length:
                                section.sectionCategory[0]
                                  ?.contestCategoryJudgeCount || 0,
                            },
                            (_, seatIdx) => seatIdx + 1
                          ).map((seatNumber) => {
                            const selectedJudge = judgesAssignInfo.judges.find(
                              (assign) =>
                                assign.sectionName === section.sectionName &&
                                assign.seatIndex === seatNumber
                            ) || { judgeUid: undefined };

                            return (
                              <div
                                key={seatNumber}
                                className="flex bg-gray-100 w-full px-4 rounded-lg h-auto items-center"
                              >
                                <div className="flex w-1/6">{seatNumber}</div>
                                <div className="flex w-5/6">
                                  <select
                                    className="w-full text-sm"
                                    value={selectedJudge.judgeUid || "unselect"}
                                    onChange={(e) =>
                                      handleSelectJudge(
                                        section.sectionName,
                                        seatNumber,
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="unselect">선택</option>
                                    {judgesPoolArray.map((judge) => (
                                      <option
                                        key={judge.judgeUid}
                                        value={judge.judgeUid}
                                      >
                                        {judge.isHead && "위원장 / "}
                                        {judge.judgeName} ({judge.judgePromoter}{" "}
                                        / {judge.judgeTel})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContestJudgeAssignTable;
