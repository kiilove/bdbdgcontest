import React, { useContext, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { MenuArray } from "./Menus";
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import { MdLogout } from "react-icons/md";

const Drawbar = ({ setOpen }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ userGroup: "" });
  const [menuVisible, setMenuVisible] = useState({
    menuIndex: 0,
    isHidden: true,
  });
  const [menuItem, setMenuItem] = useState([...MenuArray]);

  const userParser = JSON.parse(sessionStorage.getItem("user"));
  const { currentContest } = useContext(CurrentContestContext);
  const contestId = currentContest?.contests?.id;
  const handleMenuClick = (idx) => {
    // 하위 메뉴가 있는 경우
    if (MenuArray[idx].subMenus) {
      setMenuVisible((prevState) => ({
        // 클릭된 메뉴가 이미 열려있다면 닫기, 그렇지 않으면 열기
        menuIndex: idx,
        isHidden: prevState.menuIndex === idx ? !prevState.isHidden : false,
      }));
    } else {
      // 하위 메뉴가 없는 경우
      const link = MenuArray[idx].link.includes("/screen1")
        ? `${MenuArray[idx].link}/${contestId}`
        : MenuArray[idx].link;

      navigate(link);

      setMenuVisible({
        menuIndex: idx,
        isHidden: true, // 메뉴를 열지 않고 닫기
      });
    }
  };

  const handleSubMenuClick = (parentIdx, subIdx) => {
    const subMenuLink = MenuArray[parentIdx].subMenus[subIdx].link;
    const linkWithContestId = subMenuLink.includes("/screen1")
      ? `${subMenuLink}/${contestId}`
      : subMenuLink;

    console.log("Navigating to:", linkWithContestId); // 콘솔 로그로 확인
    setOpen();
    navigate(linkWithContestId);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user"); // 세션에서 사용자 정보 삭제
    navigate("/login"); // 로그인 페이지로 리다이렉트
  };

  useEffect(() => {
    if (userParser?.userGroup === "") {
      setUser(() => ({ ...userParser }));
    }
  }, [userParser]);

  useEffect(() => {
    setMenuVisible({ menuIndex: 0, isHidden: true });
  }, []);

  return (
    <div className="flex flex-col w-full bg-sky-800 h-screen">
      <div className="flex w-full justify-center items-center h-16 ">
        <h1 className="text-white" style={{ fontSize: 21 }}>
          대회관리시스템
        </h1>
      </div>
      {menuItem
        .filter((menu) => menu.isActive === true)
        .map((menu, idx) => (
          <div key={menu.index} className="flex flex-col ">
            <div
              className={`${
                menuVisible.index === menu.index && "bg-sky-800 "
              } flex w-full h-14 justify-start items-center hover:bg-sky-900 hover:text-white  text-gray-300 md:px-1 lg:px-3`}
              onClick={() => handleMenuClick(idx)}
            >
              <div className="flex justify-between w-full items-center">
                <div className="flex">
                  <button className="flex w-full h-10 justify-start items-center ml-4">
                    <div className="flex justify-start items-center">
                      <span className="mr-2">{menu.icon}</span>
                      <span className="">{menu.title}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            {menuVisible.menuIndex === idx &&
              menuVisible.isHidden === false &&
              menu?.subMenus && (
                <div className="flex flex-col text-gray-200 text-base bg-sky-700 w-full">
                  {menu.subMenus
                    .filter((sub) => sub.isActive === true)
                    .map((subMenu, sIdx) => (
                      <div className="flex w-full">
                        <div className="flex w-full h-12" key={subMenu.id}>
                          <button
                            className="py-2 px-10 hover:text-gray-200 w-full flex justify-start items-center "
                            onClick={() => {
                              handleSubMenuClick(idx, sIdx);
                            }}
                          >
                            <div className="flex justify-start items-center">
                              <span className="text-base text-white mr-2">
                                {subMenu?.icon}
                              </span>
                              <span className="text-sm text-white">
                                {subMenu.title}
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
          </div>
        ))}
      <div className="flex w-full justify-between items-end h-16 px-5">
        <button onClick={() => setOpen(false)}>
          <span className="text-base text-gray-200">닫기</span>
        </button>
        <button onClick={() => handleLogout()}>
          <span className="text-lg text-gray-200">
            <MdLogout />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Drawbar;
