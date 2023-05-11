import React, { useMemo } from "react";
import { useContext } from "react";
import { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import {
  useFirestoreAddData,
  useFirestoreUpdateData,
} from "../hooks/useFirestores";

import Body from "../assets/img/body4.jpg";

const NewContest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const contestHook = useFirestoreAddData("contests");
  const updateContest = useFirestoreUpdateData("contests");
  const contestNoticeHook = useFirestoreAddData("contest_notice");
  const contestJudgesListHook = useFirestoreAddData("contest_judges_list");
  const contestCategorysListHook = useFirestoreAddData(
    "contest_categorys_list"
  );
  const contestGradesListHook = useFirestoreAddData("contest_grades_list");
  const contestEntrysListHook = useFirestoreAddData("contest_entrys_list");
  const contestInvoicesListHook = useFirestoreAddData("contest_invoices_list");
  const { setCurrentContest } = useContext(CurrentContestContext);
  const navigate = useNavigate();

  const handleStart = async () => {
    setIsLoading(true);

    try {
      const addedContest = await contestHook.addData({ isCompleted: false });

      const [
        contestNoticeData,
        contestJudgesListData,
        contestCategorysListData,
        contestGradesListData,
        contestEntrysListData,
        contestInvoicesListData,
      ] = await Promise.all([
        contestNoticeHook
          .addData({
            refContestId: addedContest.id,
            contestStatus: "접수중",
            contestTitle: "새로운대회",
          })
          .catch((error) => {
            console.error("Error adding contest notice:", error);
            return null;
          }),
        contestJudgesListHook
          .addData({
            refContestId: addedContest.id,
            judges: [],
          })
          .catch((error) => {
            console.error("Error adding contest judges list:", error);
            return null;
          }),
        contestCategorysListHook
          .addData({
            refContestId: addedContest.id,
            categorys: [],
          })
          .catch((error) => {
            console.error("Error adding contest category list:", error);
            return null;
          }),
        contestGradesListHook
          .addData({
            refContestId: addedContest.id,
            grades: [],
          })
          .catch((error) => {
            console.error("Error adding contest grades list:", error);
            return null;
          }),
        contestEntrysListHook
          .addData({
            refContestId: addedContest.id,
            entrys: [],
          })
          .catch((error) => {
            console.error("Error adding contest invoices list:", error);
            return null;
          }),
        contestInvoicesListHook
          .addData({
            refContestId: addedContest.id,
            invoices: [],
          })
          .catch((error) => {
            console.error("Error adding contest invoices list:", error);
            return null;
          }),
      ]);

      // Check if any errors occurred during the Promise.all execution
      if (
        contestNoticeData &&
        contestJudgesListData &&
        contestCategorysListData &&
        contestGradesListData &&
        contestEntrysListData &&
        contestInvoicesListData
      ) {
        await updateContest.updateData(addedContest.id, {
          contestNoticeId: contestNoticeData.id,
          contestJudgesListId: contestJudgesListData.id,
          contestCategorysListId: contestCategorysListData.id,
          contestGradesListId: contestGradesListData.id,
          contestEntrysListId: contestEntrysListData.id,
          contestInvoicesListId: contestInvoicesListData.id,
        });

        setCurrentContest({
          contestId: addedContest.id,
          contestNoticeId: contestNoticeData.id,
          contestJudgesListId: contestJudgesListData.id,
          contestCategorysListId: contestCategorysListData.id,
          contestGradesListId: contestGradesListData.id,
          contestEntrysListId: contestEntrysListData.id,
          contestInvociesListId: contestInvoicesListData.id,
        });

        // Save the contest data to local storage
        localStorage.setItem(
          "currentContest",
          JSON.stringify({
            contestId: addedContest.id,
            contestNoticeId: contestNoticeData.id,
            contestJudgesListId: contestJudgesListData.id,
            contestCategorysListId: contestCategorysListData.id,
            contestGradesListId: contestGradesListData.id,
            contestEntrysListId: contestEntrysListData.id,
            contestInvociesListId: contestInvoicesListData.id,
          })
        );
      } else {
        console.error(
          "One or more errors occurred while adding data to collections."
        );
      }
    } catch (error) {
      console.error("Error during the handleStart process:", error);
    } finally {
      setIsLoading(false);
      navigate("/contestinfo");
    }
  };

  return (
    <div className="flex w-full h-full bg-transparent flex-col justify-center items-center">
      <div
        className="flex w-2/3 h-2/3 flex-col p-10 bg-white rounded-lg shadow-lg"
        style={{
          backgroundImage: `url(${Body})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="flex w-full h-full justify-center items-center flex-col gap-y-5 "></div>
        <div className="flex w-full justify-center items-end mt-5">
          {isLoading ? (
            <button className=" w-40 h-10 md:h-14 bg-gray-900 border text-white text-lg font-bold">
              <span className="flex w-full h-full text-white text-base justify-center items-center">
                <ThreeDots
                  height="40"
                  width="40"
                  radius="9"
                  color="#fff"
                  ariaLabel="three-dots-loading"
                  wrapperStyle={{}}
                  wrapperClassName=""
                  visible={true}
                />
              </span>
            </button>
          ) : (
            <button
              className=" w-40 h-10 md:h-14 bg-gray-900 border text-white text-lg font-bold"
              onClick={() => handleStart()}
            >
              <span>대회개설</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewContest;
