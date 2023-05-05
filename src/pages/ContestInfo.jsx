import React, { useState } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import {
  BsTrophyFill,
  BsPrinterFill,
  BsFillHandIndexThumbFill,
  BsCpuFill,
  BsCheckAll,
  BsInfoSquareFill,
  BsInfo,
  BsInfoLg,
  BsListOl,
  BsCardChecklist,
} from "react-icons/bs";

const ContestInfo = () => {
  const [currentContestInfo, setCurrentContestInfo] = useState();
  const handleContestInfo = () => {};
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg p-3 gap-y-2">
      <div className="flex w-full h-14">
        <div className="flex w-full bg-gray-100 justify-start items-center rounded-lg px-3">
          <span className="font-sans text-lg font-semibold w-6 h-6 flex justify-center items-center rounded-2xl bg-blue-400 text-white mr-3">
            <BsInfoLg />
          </span>
          <h1
            className="font-sans text-lg font-semibold"
            style={{ letterSpacing: "2px" }}
          >
            대회정보관리
          </h1>
        </div>
      </div>
      <div className="flex w-full h-full">
        <div className="flex w-full  justify-start items-center">
          <div className="hidden lg:flex w-1/4 h-full justify-start items-end pr-3 pt-3 flex-col gap-y-3 bg-gray-100 rounded-lg">
            <div className="flex w-full h-12 justify-end items-center">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                대회명
              </h3>
            </div>
            <div className="flex w-full h-12 justify-end items-center">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                짧은대회명
              </h3>
            </div>
            <div className="flex w-full h-12 justify-end items-center">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                대회장소
              </h3>
            </div>
            <div className="flex w-full h-12 justify-end items-center">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                대회일자
              </h3>
            </div>
            <div className="flex w-full h-12 justify-end items-center">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                주관
              </h3>
            </div>
            <div className="flex w-full h-12 justify-end items-center">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                주최
              </h3>
            </div>
            <div className="flex w-full h-12 justify-end items-center">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                컬렉션이름(임의수정금지)
              </h3>
            </div>
          </div>
          <div className="flex w-full lg:w-3/4 h-full justify-start items-start bg-white px-3 pt-3 lg:gap-y-3 flex-col">
            <div className="flex lg:hidden px-3">
              <h3 className="font-sans font-semibold">대회명</h3>
            </div>
            <div className="flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0">
              <input
                type="text"
                name="contestTitle"
                id="contestTitle"
                value={currentContestInfo?.contestTitle}
                onChange={(e) => handleContestInfo(e)}
                className="h-10 w-full outline-none mb-1"
              />
            </div>
            <div className="flex lg:hidden px-3">
              <h3 className="font-sans font-semibold">짧은대회명</h3>
            </div>
            <div className="flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0">
              <input
                type="text"
                name="contestTitleShort"
                id="contestTitleShort"
                value={currentContestInfo?.contestTitleShort}
                onChange={(e) => handleContestInfo(e)}
                className="h-10 w-full outline-none mb-1"
              />
            </div>
            <div className="flex lg:hidden px-3">
              <h3 className="font-sans font-semibold">대회장소</h3>
            </div>
            <div className="flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0">
              <input
                type="text"
                name="contestLoaction"
                id="contestLocation"
                value={currentContestInfo?.contestLocation}
                onChange={(e) => handleContestInfo(e)}
                className="h-10 w-full outline-none mb-1"
              />
            </div>
            <div className="flex lg:hidden px-3">
              <h3 className="font-sans font-semibold">대회일자</h3>
            </div>
            <div className="flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0">
              <input
                type="text"
                name="contestDate"
                id="contestDate"
                value={currentContestInfo?.contestDate}
                onChange={(e) => handleContestInfo(e)}
                className="h-10 w-full outline-none mb-1"
              />
            </div>
            <div className="flex lg:hidden px-3">
              <h3 className="font-sans font-semibold">주관</h3>
            </div>
            <div className="flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0">
              <input
                type="text"
                name="contestAssociate"
                id="contestAssociate"
                value={currentContestInfo?.contestAssociate}
                onChange={(e) => handleContestInfo(e)}
                className="h-10 w-full outline-none mb-1"
              />
            </div>
            <div className="flex lg:hidden px-3">
              <h3 className="font-sans font-semibold">주최</h3>
            </div>
            <div className="flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0">
              <input
                type="text"
                name="contestPromoter"
                id="contestPromoter"
                value={currentContestInfo?.contestPromoter}
                onChange={(e) => handleContestInfo(e)}
                className="h-10 w-full outline-none mb-1"
              />
            </div>
            <div className="flex lg:hidden px-3">
              <h3 className="font-sans font-semibold">
                컬렉션이름(임의수정금지)
              </h3>
            </div>
            <div className="flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0">
              <input
                type="text"
                name="contestCollectionName"
                id="contestCollectionName"
                value={currentContestInfo?.contestCollectionName}
                onChange={(e) => handleContestInfo(e)}
                className="h-10 w-full outline-none mb-1"
              />
            </div>
            <div className="flex w-full h-12 justify-end items-center">
              <button className="w-32 h-12 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-lg mt-2">
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestInfo;
