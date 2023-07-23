import {
  BsTrophyFill,
  BsPrinterFill,
  BsFillHandIndexThumbFill,
  BsCpuFill,
  BsCheckAll,
  BsInfoLg,
  BsListOl,
  BsCardChecklist,
} from "react-icons/bs";

import { TiInputChecked } from "react-icons/ti";
import { FaUserEdit } from "react-icons/fa";
import { PiUsersFour } from "react-icons/pi";
import { CgUserList } from "react-icons/cg";
import {
  TbCertificate,
  TbFileCertificate,
  TbHeartRateMonitor,
} from "react-icons/tb";
import { HiUserGroup, HiUsers } from "react-icons/hi";
import {
  MdTimeline,
  MdBalance,
  MdDoneAll,
  MdOutlineScale,
  MdOutlineTouchApp,
} from "react-icons/md";
import { BiAddToQueue, BiUserPlus } from "react-icons/bi";
import { BsClipboardData } from "react-icons/bs";
export const MenuArray = [
  {
    id: 0,
    title: "대회관리",
    icon: <BsTrophyFill />,
    subMenus: [
      {
        id: 1,
        title: "새로운대회개설",
        icon: <BiAddToQueue />,
        link: "/newcontest",
      },
      {
        id: 1,
        title: "대회정보관리",
        icon: <BsInfoLg />,
        link: "/contestinfo",
      },

      {
        id: 2,
        title: "참가신청서",
        icon: <PiUsersFour />,
        link: "/contestinvoicetable",
      },
      {
        id: 3,
        title: "참가신청서 수동작성",
        icon: <BiUserPlus />,
        link: "/contestnewinvoicemanual",
      },
      {
        id: 4,
        title: "계측명단",
        icon: <MdOutlineScale />,
        link: "/contestplayerordertable",
      },
      {
        id: 5,
        title: "출전선수명단",
        icon: <CgUserList />,
        link: "/contestplayerordertableafter",
      },

      {
        id: 6,
        title: "심판선발",
        icon: <MdBalance />,
        link: "/contestjudgetable",
      },
      {
        id: 7,
        title: "대회운영 데이터",
        icon: <BsClipboardData />,
        link: "/contesttimetable",
      },
    ],
  },
  {
    id: 1,
    title: "출력관리",
    icon: <BsPrinterFill />,
    subMenus: [
      { id: 1, title: "계측명단 통합", icon: <MdOutlineScale /> },
      { id: 2, title: "계측명단 종목별", icon: <MdOutlineScale /> },
      { id: 3, title: "선수명단 통합", icon: <HiUserGroup /> },
      { id: 4, title: "선수명단 종목별", icon: <HiUsers /> },
      { id: 5, title: "순위표 통합", icon: <BsListOl /> },
      { id: 6, title: "순위표 종목별", icon: <BsListOl /> },
      { id: 7, title: "집계표 출력", icon: <BsCardChecklist /> },
      { id: 8, title: "상장 출력", icon: <TbCertificate /> },
      { id: 9, title: "상장부여현황", icon: <TbFileCertificate /> },
    ],
  },
  {
    id: 2,
    title: "수동모드",
    icon: <BsFillHandIndexThumbFill />,
    subMenus: [{ id: 1, title: "심사표 입력", icon: <MdOutlineTouchApp /> }],
  },
  {
    id: 3,
    title: "자동모드",
    icon: <BsCpuFill />,
    subMenus: [
      {
        id: 1,
        title: "모니터링 화면",
        icon: <TbHeartRateMonitor />,
        link: "/contestmonitoring",
      },
    ],
  },
];
