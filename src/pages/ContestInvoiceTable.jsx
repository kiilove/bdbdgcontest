import React from "react";
import { useState } from "react";
import { BsCheckAll } from "react-icons/bs";
import { MdOutlineSearch } from "react-icons/md";
import ReactVirtualizedTable from "../components/VirtualizedTable";

const ContestInvoiceTable = () => {
  const [currentTab, setCurrentTab] = useState(1);
  const tabArray = [
    {
      id: 0,
      title: "전체목록",
      subTitle: "접수된 전체 신청서목록입니다.",
      children: "",
    },
    {
      id: 1,
      title: "미확정목록",
      subTitle: "입금확인이 필요한 신청서목록입니다.",
      children: "",
    },
    {
      id: 2,
      title: "확정목록",
      subTitle: "입금확인된 신청서목록입니다.",
      children: "",
    },
    {
      id: 3,
      title: "신청서누락 목록",
      subTitle: "입금확인되었지만 신청서가 없는 목록입니다.",
      children: "",
    },
  ];

  const ContestInvoiceUncompleteRender = (
    <div className="flex flex-col lg:flex-row gap-y-2 w-full h-auto bg-white mb-3 rounded-tr-lg rounded-b-lg p-2 gap-x-4">
      <div className="w-full bg-blue-100 flex rounded-lg flex-col p-2 h-full gap-y-2">
        <div className="flex bg-gray-100 h-auto rounded-lg justify-start categoryIdart lg:items-center gay-y-2 flex-col p-2 gap-y-2">
          <div className="flex w-full justify-start items-center ">
            <div className="h-12 w-full rounded-lg px-3 bg-white">
              <div className="flex w-full justify-start items-center">
                <h1 className="text-2xl text-gray-600 mr-3">
                  <MdOutlineSearch />
                </h1>
                <input
                  type="text"
                  name="contestCategoryTitle"
                  className="h-12 outline-none w-full"
                  placeholder="선수검색(이름, 전화번호, 소속을 지원합니다.)"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex bg-gray-100 h-auto rounded-lg justify-start categoryIdart lg:items-center gay-y-2 flex-col p-2 gap-y-2">
          <div className="flex w-full justify-start items-center ">
            <div className="w-full rounded-lg px-3 bg-blue-200 h-auto py-2">
              <table className="w-full">
                <tr>
                  <th className="text-left w-1/12">
                    <input type="checkbox" />
                  </th>
                  <th className="text-left w-1/12">이름</th>
                  <th className="text-left w-2/12">연락처</th>
                  <th className="text-left w-2/12 hidden lg:table-cell">
                    소속
                  </th>
                  <th className="text-left w-2/12 hidden lg:table-cell">
                    신청종목
                  </th>
                  <th className="text-left w-1/12">참가비용</th>
                </tr>
                <tr>
                  <td className="text-left w-1/12">
                    <input type="checkbox" />
                  </td>
                  <td className="text-left w-1/12">김진배</td>
                  <td className="text-left w-2/12">010-4643-3464</td>
                  <td className="text-left w-2/12 hidden lg:table-cell">
                    제이앤코어
                  </td>
                  <td className="text-left w-2/12 hidden lg:table-cell"></td>
                  <td className="text-left w-1/12">250,000</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg p-3 gap-y-2">
      <div className="flex w-full h-14">
        <div className="flex w-full bg-gray-100 justify-start items-center rounded-lg px-3">
          <span className="font-sans text-lg font-semibold w-6 h-6 flex justify-center items-center rounded-2xl bg-blue-400 text-white mr-3">
            <BsCheckAll />
          </span>
          <h1
            className="font-sans text-lg font-semibold"
            style={{ letterSpacing: "2px" }}
          >
            참가신청서
          </h1>
        </div>
      </div>
      <div className="flex w-full h-full ">
        <div className="flex w-full justify-start items-center">
          <div className="flex w-full h-full justify-start categoryIdart px-3 pt-3 flex-col bg-gray-100 rounded-lg">
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
            {currentTab === 0 && ContestInvoiceUncompleteRender}
            {currentTab === 1 && ContestInvoiceUncompleteRender}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestInvoiceTable;
