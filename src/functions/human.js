const SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"];
const MALE_NAMES = [
  "민준",
  "서준",
  "도윤",
  "예준",
  "시우",
  "하준",
  "주원",
  "지호",
  "지훈",
  "준우",
  "준서",
  "현우",
  "지후",
  "도현",
  "유준",
  "건우",
  "승우",
  "우진",
  "태윤",
  "민재",
  "서진",
  "윤우",
  "현준",
  "민성",
  "성민",
  "태민",
  "지환",
  "시윤",
  "하민",
  "우빈",
  "재윤",
  "은우",
  "시현",
  "경민",
  "민혁",
  "준영",
  "세준",
  "승현",
  "영준",
  "하윤",
  "수호",
  "승민",
  "정우",
  "동현",
  "지성",
  "서우",
  "동훈",
  "태현",
  "지민",
  "도영",
  "성현",
  "수현",
  "윤호",
  "한결",
  "재민",
  "경준",
  "시원",
  "재영",
  "민호",
  "태호",
  "유빈",
  "우석",
  "성준",
  "은찬",
  "재현",
  "시훈",
  "도준",
  "태경",
  "승호",
  "상민",
  "성빈",
  "하람",
  "현성",
  "형준",
  "우영",
  "시완",
  "지완",
  "성훈",
  "우혁",
  "재훈",
  "동욱",
  "태율",
  "도영",
  "진우",
  "찬우",
  "서율",
  "수혁",
  "재훈",
  "정민",
  "승빈",
  "경호",
  "유성",
  "현수",
  "지용",
  "우람",
  "수민",
  "영호",
  "찬호",
  "찬혁",
  "세찬",
];
const FEMALE_NAMES = [
  "서연",
  "지우",
  "서윤",
  "하은",
  "하윤",
  "민서",
  "지아",
  "예은",
  "수아",
  "수빈",
  "다은",
  "예린",
  "유진",
  "지민",
  "채원",
  "은서",
  "윤서",
  "서현",
  "은채",
  "하린",
  "지안",
  "서영",
  "서하",
  "나윤",
  "소율",
  "하영",
  "나은",
  "예진",
  "지윤",
  "유나",
  "하연",
  "다윤",
  "수연",
  "하윤",
  "다인",
  "소연",
  "시은",
  "하윤",
  "지현",
  "은수",
  "연우",
  "민지",
  "시연",
  "하늘",
  "서린",
  "윤지",
  "지후",
  "주하",
  "유림",
  "서연",
  "아린",
  "수연",
  "서은",
  "채은",
  "소윤",
  "연지",
  "다연",
  "유빈",
  "서희",
  "수현",
  "예나",
  "세연",
  "지유",
  "하영",
  "유민",
  "채윤",
  "아영",
  "연희",
  "서율",
  "수영",
  "민서",
  "서우",
  "지나",
  "유하",
  "서정",
  "유은",
  "해린",
  "수안",
  "채림",
  "세나",
  "소라",
  "민아",
  "하연",
  "다현",
  "수희",
  "민정",
  "소정",
  "은빈",
  "현지",
  "나연",
  "다빈",
  "다솜",
  "윤아",
  "소민",
  "채빈",
  "이안",
  "가은",
  "다온",
  "시현",
  "연아",
  "수지",
  "혜민",
  "민채",
  "은지",
  "시현",
  "예담",
  "아진",
  "은하",
  "하은",
  "채리",
];

export { SURNAMES, MALE_NAMES, FEMALE_NAMES };

const FITNESS_CLUBS = [
  "에너지짐",
  "스파르탄짐",
  "바디앤소울 피트니스",
  "파워짐",
  "짐헤븐",
  "스마트핏",
  "마블짐",
  "피트니스 팩토리",
  "헬스매니아",
  "스카이짐",
  "탑핏 피트니스",
  "웨이브짐",
  "바디코드 피트니스",
  "맥스짐",
  "트라이엄프 피트니스",
  "아이언짐",
  "핏코리아",
  "엑스퍼트짐",
  "머슬타임 피트니스",
  "헬로우 피트니스",
  "에브리짐",
  "체인지 피트니스",
  "올스타짐",
  "피트존",
  "엠파이어짐",
  "피지컬 100 피트니스",
  "드림짐",
  "다이나믹짐",
  "원더짐",
  "핏스토리 피트니스",
  "라이트짐",
  "텐타임즈 피트니스",
  "헬스앤뷰티짐",
  "아레나 피트니스",
  "카리스짐",
  "에이스짐",
  "피트니스 스퀘어",
  "포커스짐",
  "보디밸런스 피트니스",
  "비전짐",
  "리얼핏 피트니스",
  "골드스타짐",
  "디파이 피트니스",
  "에볼루션짐",
  "바디핏 피트니스",
  "무브 피트니스",
  "액티브짐",
  "챔피언 피트니스",
  "더 베스트짐",
  "아이언피트 피트니스",
];

export { FITNESS_CLUBS };

const HIGH_SCHOOLS = [
  "서울고등학교",
  "용산고등학교",
  "경기고등학교",
  "대원외국어고등학교",
  "한영고등학교",
  "세화여자고등학교",
  "휘문고등학교",
  "덕수고등학교",
  "잠실고등학교",
  "숭실고등학교",
];

export { HIGH_SCHOOLS };
