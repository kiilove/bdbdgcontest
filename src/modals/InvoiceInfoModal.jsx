import React, { useContext, useEffect, useRef, useState } from "react";
import { BiCategory } from "react-icons/bi";
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import { v4 as uuidv4 } from "uuid";
import {
  useFirestoreGetDocument,
  useFirestoreUpdateData,
} from "../hooks/useFirestores";
import { TbUsers } from "react-icons/tb";
import { BsCheckAll } from "react-icons/bs";

const initPlayerInfo = {
  contestPlayerIndex: "",
  contestPlayerId: "",
  contestPlayerName: "",
  contestPlayerPromoter: "",
  contestPlayerText: "",
  contestPlayerGender: "남",
  contestPlayerPhoneNumber: "",
  contestPlayerEmail: "",
};

const InvoiceInfoModal = ({ setClose, propState, setState }) => {
  const { currentContest, setCurrentContest } = useContext(
    CurrentContestContext
  );
  const [invoiceInfo, setInvoiceInfo] = useState({
    ...initPlayerInfo,
  });
  const [playerList, setPlayerList] = useState({});
  const [playerArray, setPlayerArray] = useState([]);

  const invoiceInfoRef = useRef({});

  const contestInvoiceDocument = useFirestoreGetDocument("invoices_pool");

  const getInvoice = async () => {
    console.log(propState.info.id);
    const returnInvoices = await contestInvoiceDocument.getDocument(
      propState.info.id
    );
    console.log(returnInvoices);
    //setInvoiceInfo({ ...returnInvoices[0] });
  };

  const handleInputValues = (e) => {
    const { name, value } = e.target;

    setInvoiceInfo({
      ...invoiceInfo,
      [name]: value,
    });
  };

  useEffect(() => {
    //getInvoice();

    invoiceInfoRef.current.playerName.focus();
  }, []);

  useEffect(() => {
    console.log(propState);
    setInvoiceInfo({ ...propState.info });
  }, [propState]);

  return (
    <div className="flex w-full flex-col gap-y-2 h-auto">
      <div className="flex w-full h-14">
        <div className="flex w-full bg-gray-100 justify-start items-center rounded-lg px-3">
          <span className="font-sans text-lg font-semibold w-6 h-6 flex justify-center items-center rounded-2xl bg-blue-400 text-white mr-3">
            <BsCheckAll />
          </span>
          <h1
            className="font-sans text-lg font-semibold"
            style={{ letterSpacing: "2px" }}
          >
            {propState?.title || ""}
          </h1>
        </div>
      </div>
      <div className="flex bg-gradient-to-r from-blue-200 to-cyan-200 p-3 rounded-lg">
        <div className="flex w-full bg-gray-100 h-auto rounded-lg justify-start items-start lg:items-center gay-y-2 flex-col p-2 gap-y-2">
          <div className="flex w-full justify-start items-center ">
            <div className="flex w-1/4 justify-end mr-2">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                이름
              </h3>
            </div>
            <div className="h-12 w-3/4 rounded-lg px-3 bg-white">
              <div className="flex w-full justify-start items-center">
                <input
                  type="text"
                  value={invoiceInfo.playerName}
                  onChange={(e) => handleInputValues(e)}
                  ref={(ref) => (invoiceInfoRef.current.playerName = ref)}
                  name="playerName"
                  className="h-12 outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex w-full justify-start items-center ">
            <div className="flex w-1/4 justify-end mr-2">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                연락처
              </h3>
            </div>
            <div className="h-12 w-3/4 rounded-lg px-3 bg-white">
              <div className="flex w-full justify-start items-center">
                <input
                  type="text"
                  name="playerTel"
                  value={invoiceInfo.playerTel}
                  onChange={(e) => handleInputValues(e)}
                  ref={(ref) => (invoiceInfoRef.current.playerTel = ref)}
                  className="h-12 outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex w-full justify-start items-center ">
            <div className="flex w-1/4 justify-end mr-2">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                소속
              </h3>
            </div>
            <div className="h-12 w-3/4 rounded-lg px-3 bg-white">
              <div className="flex w-full justify-start items-center">
                <input
                  type="text"
                  name="playerGym"
                  value={invoiceInfo.playerGym}
                  onChange={(e) => handleInputValues(e)}
                  ref={(ref) => (invoiceInfoRef.current.playerGym = ref)}
                  className="h-12 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex w-full justify-start items-center ">
            <div className="flex w-1/4 justify-end mr-2">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                성별
              </h3>
            </div>
            <div className="h-12 w-3/4 rounded-lg ">
              <div className="flex w-full justify-start items-center h-12">
                <select
                  name="playerGender"
                  onChange={(e) => handleInputValues(e)}
                  //value={invoiceInfo.playerGender}

                  ref={(ref) => (invoiceInfoRef.current.playerGender = ref)}
                  className="w-full h-full pl-2"
                >
                  <option selected={invoiceInfo.playerGender === "m"} value="m">
                    남
                  </option>
                  <option selected={invoiceInfo.playerGender === "f"} value="f">
                    여
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-start items-center ">
            <div className="flex w-1/4 justify-end mr-2">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                이메일
              </h3>
            </div>
            <div className="h-12 w-3/4 rounded-lg px-3 bg-white">
              <div className="flex w-full justify-start items-center">
                <input
                  type="email"
                  name="playerEmail"
                  value={invoiceInfo.playerEmail}
                  onChange={(e) => handleInputValues(e)}
                  ref={(ref) => (invoiceInfoRef.current.playerEmail = ref)}
                  className="h-12 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex w-full justify-start items-center h-auto ">
            <div className="flex w-1/4 justify-end mr-2 h-14 items-start">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                출전동기
              </h3>
            </div>
            <div className="h-14 w-3/4 rounded-lg px-3 bg-white pt-1">
              <div className="flex w-full justify-start items-center">
                <textarea
                  name="playerText"
                  value={invoiceInfo.playerText}
                  onChange={(e) => handleInputValues(e)}
                  ref={(ref) => (invoiceInfoRef.current.playerText = ref)}
                  className="h-14 outline-none w-full"
                />
              </div>
            </div>
          </div>
          <div className="flex w-full justify-start items-center h-auto ">
            <div className="flex w-1/4 justify-end mr-2 h-auto items-start">
              <h3
                className="font-sans font-semibold"
                style={{ letterSpacing: "2px" }}
              >
                참가신청종목
              </h3>
            </div>
            <div className="h-auto w-3/4 rounded-lg px-3 bg-white pt-1">
              <div className="flex w-full justify-start items-center"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full gap-x-2 h-auto">
        <button
          className="w-full h-12 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-lg"
          // onClick={() => handleUpdatePlayers()}
        >
          저장
        </button>
        <button
          className="w-full h-12 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-lg"
          onClick={() => setClose()}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default InvoiceInfoModal;
