import React, { useState } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";

import { MdTimeline } from "react-icons/md";

const ContestTimetable = () => {
  const [currentOrders, setCurrentOrders] = useState();
  const [currentTab, setCurrentTab] = useState(0);
  const [currentSection, setSection] = useState([{ id: 0, title: "전체" }]);
  const tabArray = [
    {
      id: 0,
      title: "종목/체급진행순서",
      subTitle: "대회진행순서를 먼저 설정합니다.",
      children: "",
    },
    {
      id: 1,
      title: "선수배정현황",
      subTitle: "선수의 출전 순서를 설정합니다.",
      children: "",
    },
    {
      id: 2,
      title: "심판배정현황",
      subTitle: "종목/체급 심사를 위한 심판을 배정합니다.",
      children: "",
    },
  ];
  const handleContestInfo = () => {};
  const ContestOrdersRender = (
    <div className="flex flex-col lg:flex-row gap-y-2 w-full h-auto bg-white mb-3 rounded-tr-lg rounded-b-lg p-2 gap-x-4">
      <div className="w-full lg:w-1/3 bg-blue-100 flex rounded-lg flex-col p-2 h-full gap-y-2">
        <div className="flex bg-gray-100 h-auto rounded-lg justify-start items-start lg:items-center gay-y-2 flex-col p-2 gap-y-2">
          <div className="flex w-full justify-start items-center gap-x-3">
            <input
              type="number"
              name="categoryIndex"
              className="h-12 w-full rounded-lg px-3"
              placeholder="진행순서"
            />
            <input
              type="text"
              name="categorySection"
              className="h-12 w-full rounded-lg px-3"
              placeholder="진행그룹(ex:1부, 2부)"
            />
          </div>
          <div className="flex w-full justify-start items-center gap-x-3">
            <input
              type="text"
              name="contestCategoryTitle"
              className="h-12 w-full rounded-lg px-3"
              placeholder="종목명"
            />
          </div>
          <div className="flex w-full justify-start items-center gap-x-3">
            <button className="w-full h-12 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-lg">
              종목추가
            </button>
          </div>
        </div>
        <div className="flex bg-blue-200 w-full h-auto rounded-lg px-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-sky-300 h-10">
                <th className="w-1/4 h-10 text-left font-normal">개최순서</th>
                <th className="w-2/4 h-10 text-left font-normal">종목명</th>
                <th className="w-1/4 h-10"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="h-10">
                <td className="w-1/4 h-10">1</td>
                <td className="w-2/4 h-10">학생부</td>
                <td className="w-1/4 h-10"></td>
              </tr>
              <tr className="h-10">
                <td className="w-1/4 h-10">1</td>
                <td className="w-2/4 h-10">학생부</td>
                <td className="w-1/4 h-10"></td>
              </tr>
              <tr className="h-10">
                <td className="w-1/4 h-10">1</td>
                <td className="w-2/4 h-10">학생부</td>
                <td className="w-1/4 h-10"></td>
              </tr>
              <tr className="h-10">
                <td className="w-1/4 h-10">1</td>
                <td className="w-2/4 h-10">학생부</td>
                <td className="w-1/4 h-10"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-1/3 bg-blue-200 flex rounded-lg">2</div>
      <div className="w-1/3 bg-blue-300 flex rounded-lg">3</div>
    </div>
  );
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg p-3 gap-y-2">
      <div className="flex w-full h-14">
        <div className="flex w-full bg-gray-100 justify-start items-center rounded-lg px-3">
          <span className="font-sans text-lg font-semibold w-6 h-6 flex justify-center items-center rounded-2xl bg-blue-400 text-white mr-3">
            <MdTimeline />
          </span>
          <h1
            className="font-sans text-lg font-semibold"
            style={{ letterSpacing: "2px" }}
          >
            타임테이블
          </h1>
        </div>
      </div>
      <div className="flex w-full h-full ">
        <div className="flex w-full justify-start items-center">
          <div className="flex w-full h-full justify-start items-start px-3 pt-3 flex-col bg-gray-100 rounded-lg">
            <div className="flex w-full">
              {tabArray.map((tab, tIdx) => (
                <>
                  <button
                    className={`${
                      currentTab === tab.id
                        ? " flex w-auto h-10 bg-white px-4"
                        : " flex w-auto h-10 bg-gray-100 px-4"
                    }  h-14 rounded-t-lg justify-center items-center`}
                    onClick={() => setCurrentTab(tIdx)}
                  >
                    <span>{tab.title}</span>
                  </button>
                </>
              ))}
            </div>
            {currentTab === 0 && ContestOrdersRender}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestTimetable;
