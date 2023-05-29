import React, { useContext } from "react";
import { useState } from "react";
import { BsCheckAll } from "react-icons/bs";
import { MdOutlineSearch } from "react-icons/md";
import ReactVirtualizedTable from "../components/VirtualizedTable";
import { useFirestoreQuery } from "../hooks/useFirestores";
import { where } from "firebase/firestore";
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import { useEffect } from "react";
import { useMemo } from "react";

const ContestInvoiceTable = () => {
  const [currentTab, setCurrentTab] = useState(1);
  const [invoiceList, setInvoiceList] = useState([]);
  const [searchInfo, setSearchInfo] = useState();
  const [searchKeyword, setSearchKeyword] = useState("");
  //const [filteredInvoiceList, setFilteredInvoiceList] = useState([]);
  const { currentContest } = useContext(CurrentContestContext);
  const getQuery = useFirestoreQuery();

  const fetQuery = async () => {
    const condition = [where("contestId", "==", currentContest.contests.id)];
    const data = await getQuery.getDocuments("invoices_pool", condition);
    if (data?.length > 0) {
      setInvoiceList([...data]);
    }
  };

  const filteredData = useMemo(() => {
    let newData = [];
    if (invoiceList?.length > 0) {
      switch (currentTab) {
        case 0:
          newData = invoiceList.filter((invoice) =>
            invoice.playerName.includes(searchKeyword)
          );
          break;
        case 1:
          newData = invoiceList.filter(
            (invoice) =>
              !invoice.isPriceCheck &&
              invoice.playerName.includes(searchKeyword)
          );
          break;
        case 2:
          newData = invoiceList.filter(
            (invoice) =>
              invoice.isPriceCheck && invoice.playerName.includes(searchKeyword)
          );
          break;
        default:
          break;
      }
    }
    return newData;
  }, [currentTab, invoiceList, searchKeyword]);

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

  const handleSearchKeyword = () => {
    setSearchKeyword(searchInfo);
  };

  useEffect(() => {
    fetQuery();
  }, [currentContest?.contests?.id]);

  useEffect(() => {
    console.log(filteredData);
  }, [filteredData]);

  const ContestInvoiceUncompleteRender = (
    <div className="flex flex-col lg:flex-row gap-y-2 w-full h-auto bg-white mb-3 rounded-tr-lg rounded-b-lg p-2 gap-x-4">
      <div className="w-full bg-blue-100 flex rounded-lg flex-col p-2 h-full gap-y-2">
        <div className="flex bg-gray-100 h-auto rounded-lg justify-start categoryIdart lg:items-center gay-y-2 flex-col p-2 gap-y-2">
          <div className="flex w-full justify-start items-center ">
            <div className="h-12 w-full rounded-lg px-3 bg-white">
              <div className="flex w-full justify-start items-center h-full">
                <h1 className="text-2xl text-gray-600 mr-3">
                  <MdOutlineSearch />
                </h1>
                <input
                  type="text"
                  name="contestCategoryTitle"
                  value={searchInfo}
                  onChange={(e) => setSearchInfo(e.target.value.trim())}
                  onKeyDown={(e) => {
                    e.key === "Enter" && handleSearchKeyword();
                  }}
                  className="h-12 outline-none w-full"
                  placeholder="선수검색(이름, 전화번호, 소속을 지원합니다.)"
                />
                <button
                  className="w-20 bg-blue-200 h-full"
                  onClick={handleSearchKeyword}
                >
                  검색
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex bg-gray-100 h-auto rounded-lg justify-start categoryIdart lg:items-center gay-y-2 flex-col p-2 gap-y-2">
          <div className="flex w-full justify-start items-center ">
            <div className="w-full rounded-lg px-3  h-auto py-2">
              <table className="w-full bg-white">
                <tr className="bg-gray-200 h-10">
                  <th className="w-1/12 text-center">입금확인</th>
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
                {filteredData?.length > 0 &&
                  filteredData.map((filtered, fIdx) => {
                    const {
                      id,
                      joins,
                      playerName,
                      playerTel,
                      playerGym,
                      isPriceCheck,
                      contestPriceSum,
                    } = filtered;

                    return (
                      <tr className="border border-t-0 border-x-0" key={id}>
                        <td className="text-center w-1/12 h-10">
                          <input type="checkbox" checked={isPriceCheck} />
                        </td>
                        <td className="text-left w-1/12">{playerName}</td>
                        <td className="text-left w-2/12">{playerTel}</td>
                        <td className="text-left w-2/12 hidden lg:table-cell">
                          {playerGym}
                        </td>
                        <td className="text-left w-2/12 hidden lg:table-cell">
                          {joins?.length > 0 &&
                            joins.map((join, jIdx) => {
                              const {
                                contestCategoryTitle,
                                contestGradeTitle,
                              } = join;

                              return (
                                <div className="flex w-full h-10 justify-start items-center">
                                  {contestCategoryTitle +
                                    "(" +
                                    contestGradeTitle +
                                    ")"}
                                </div>
                              );
                            })}
                        </td>
                        <td className="text-left w-1/12">
                          {contestPriceSum &&
                            parseInt(contestPriceSum).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
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
