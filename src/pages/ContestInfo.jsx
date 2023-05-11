import React, { useState } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/SideBar";
import { BsInfoLg } from "react-icons/bs";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/esm/locale";

import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

const ContestInfo = () => {
  const [currentContestInfo, setCurrentContestInfo] = useState({
    contestPriceBasic: 0,
    contestPriceExtra: 0,
    contestPriceStudent: 0,
    contestPriceStudent2: 0,
  });
  const [contestInfoForDB, setContestInfoForDB] = useState();
  const [currentContestInfoDate, setcurrentContestInfoDate] = useState(
    new Date()
  );

  const formatNumber = (value) => {
    if (isNaN(value) || value === "") {
      return 0;
    } else {
      return parseInt(value).toLocaleString();
    }
  };

  const unFormatNumber = (value) => {
    return value.replace(",", "");
  };
  const handleContestInfo = (e) => {
    const { name, value } = e.target;
    const newValue = { ...currentContestInfo, [name]: value };
    setCurrentContestInfo({ ...newValue });
  };

  const handelContestInfoPrice = (e) => {
    const { name, value } = e.target;
    const newValue = { ...currentContestInfo, [name]: formatNumber(value) };
    setCurrentContestInfo({ ...newValue });
  };

  const saveContestInfo = () => {
    const dbContestInfo = {
      ...currentContestInfo,
      contestPriceBasic: parseInt(
        currentContestInfo.contestPriceBasic.replaceAll(",", "")
      ),
      contestPriceExtra: parseInt(
        currentContestInfo.contestPriceExtra.replaceAll(",", "")
      ),
      contestPriceType1: parseInt(
        currentContestInfo.contestPriceType1.replaceAll(",", "")
      ),
      contestPriceType2: parseInt(
        currentContestInfo.contestPriceType2.replaceAll(",", "")
      ),
    };
    console.log(dbContestInfo);
    console.log(currentContestInfo);
  };
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
                참가비
              </h3>
            </div>
            <div className="flex w-full h-12 justify-end items-center">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                종복참가비
              </h3>
            </div>
            <div className="flex w-full h-12 justify-end items-center">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                타입1 참가비(예:학생부)
              </h3>
            </div>
            <div className="flex w-full h-12 justify-end items-center">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                타입2 참가비(예:대학생부)
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
              {/* <input
                type="text"
                name="contestDate"
                id="contestDate"
                value={currentContestInfo?.contestDate}
                onChange={(e) => handleContestInfo(e)}
                className="h-10 w-full outline-none mb-1"
              /> */}
              <DatePicker
                selected={
                  currentContestInfo?.contestDate || currentContestInfoDate
                }
                locale={ko}
                dateFormat="yyyy-MM-dd"
                onChange={(date) => {
                  setCurrentContestInfo({
                    ...currentContestInfo,
                    contestDate: date,
                  });
                }}
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
              <h3 className="font-sans font-semibold">기본참가비</h3>
            </div>
            <div className="flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0">
              <input
                type="text"
                name="contestPriceBasic"
                id="contestPriceBasic"
                value={currentContestInfo?.contestPriceBasic}
                onChange={(e) => handleContestInfo(e)}
                onBlur={(e) => handelContestInfoPrice(e)}
                className="h-10 w-full outline-none mb-1"
              />
            </div>
            <div className="flex lg:hidden px-3">
              <h3 className="font-sans font-semibold">중복참가비</h3>
            </div>
            <div className="flex w-full justify-start items-center rounded-lg mb-3 lg:mb-0 gap-x-2">
              <div className="flex w-1/2 lg:w-1/4 h-12 justify-around items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0 ">
                <label htmlFor="contestPriceExtraTypeSum">
                  <input
                    type="radio"
                    name="contestPriceExtraType"
                    id="contestPriceExtraTypeSum"
                    onChange={(e) => handleContestInfo(e)}
                    value="누적"
                  />
                  <span className="ml-1">누적</span>
                </label>
                <label htmlFor="contestPriceExtraTypeFixed">
                  <input
                    type="radio"
                    name="contestPriceExtraType"
                    id="contestPriceExtraTypeFixed"
                    onChange={(e) => handleContestInfo(e)}
                    value="정액"
                  />
                  <span className="ml-1">정액</span>
                </label>
                <label htmlFor="contestPriceExtraTypeNone">
                  <input
                    type="radio"
                    name="contestPriceExtraType"
                    id="contestPriceExtraTypeNone"
                    onChange={(e) => handleContestInfo(e)}
                    value="없음"
                  />
                  <span className="ml-1">없음</span>
                </label>
              </div>
              <div className="flex w-1/2 lg:w-3/4 h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0">
                <input
                  type="text"
                  name="contestPriceExtra"
                  id="contestPriceExtra"
                  value={currentContestInfo?.contestPriceExtra}
                  onChange={(e) => handleContestInfo(e)}
                  onBlur={(e) => handelContestInfoPrice(e)}
                  className="h-10 w-full outline-none mb-1"
                />
              </div>
            </div>
            <div className="flex lg:hidden px-3">
              <h3 className="font-sans font-semibold">
                타입1 참가비(예:학생부)
              </h3>
            </div>
            <div className="flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0">
              <input
                type="text"
                name="contestPriceStudent"
                id="contestPriceStudent"
                value={currentContestInfo?.contestPriceStudent}
                onChange={(e) => handleContestInfo(e)}
                onBlur={(e) => handelContestInfoPrice(e)}
                className="h-10 w-full outline-none mb-1"
              />
            </div>
            <div className="flex lg:hidden px-3">
              <h3 className="font-sans font-semibold">
                타입2 참가비(예:대학생부)
              </h3>
            </div>
            <div className="flex w-full h-12 justify-start items-center border-b-gray-300 border border-b-2 border-r-2 rounded-lg px-3 mb-3 lg:mb-0">
              <input
                type="text"
                name="contestPriceStudent2"
                id="contestPriceStudent2"
                value={currentContestInfo?.contestPriceStudent2}
                onChange={(e) => handleContestInfo(e)}
                onBlur={(e) => handelContestInfoPrice(e)}
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
              <button
                className="w-32 h-12 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-lg mt-2"
                onClick={() => saveContestInfo()}
              >
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
