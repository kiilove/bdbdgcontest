import React, { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { CurrentContestContext } from "../contexts/CurrentContestContext";
import {
  useFirestoreAddData,
  useFirestoreGetDocument,
} from "../hooks/useFirestores";
import {
  FEMALE_NAMES,
  FITNESS_CLUBS,
  HIGH_SCHOOLS,
  MALE_NAMES,
  SURNAMES,
} from "../functions/human";
import { PHONE_NUMBERS } from "../functions/mobileNumber";
import dayjs from "dayjs"; // Import dayjs for date formatting

const RandomPlayerGenerator = () => {
  const { currentContest } = useContext(CurrentContestContext);
  const [players, setPlayers] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState({});
  const [gradeDistribution, setGradeDistribution] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorysArray, setCategorysArray] = useState([]);
  const [gradesArray, setGradesArray] = useState([]);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);

  const fetchCategoryDocument = useFirestoreGetDocument(
    "contest_categorys_list"
  );
  const fetchGradeDocument = useFirestoreGetDocument("contest_grades_list");

  const addInvoice = useFirestoreAddData("invoices_pool");

  const fetchPool = async () => {
    try {
      if (currentContest.contests.contestCategorysListId) {
        const returnCategorys = await fetchCategoryDocument.getDocument(
          currentContest.contests.contestCategorysListId
        );
        setCategorysArray([...returnCategorys?.categorys]);

        const returnGrades = await fetchGradeDocument.getDocument(
          currentContest.contests.contestGradesListId
        );
        setGradesArray([...returnGrades?.grades]);

        setTimeout(() => {
          setIsButtonEnabled(true);
        }, 2000);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const filterCategories = (age, isFemale) => {
    let availableCategories = [];

    if (age <= 19) {
      availableCategories = categorysArray.filter(
        (category) =>
          category.contestCategoryTitle.includes("학생부") &&
          category.contestCategoryGender === (isFemale ? "여" : "남")
      );
    } else if (age >= 20 && age <= 44) {
      availableCategories = categorysArray.filter(
        (category) =>
          !category.contestCategoryTitle.includes("학생부") &&
          !category.contestCategoryTitle.includes("장년부") &&
          (category.contestCategoryGender === (isFemale ? "여" : "남") ||
            category.contestCategoryGender === "무관")
      );
    } else if (age >= 45) {
      availableCategories = categorysArray.filter(
        (category) =>
          !category.contestCategoryTitle.includes("학생부") &&
          ((category.contestCategoryTitle.includes("장년부") && !isFemale) ||
            category.contestCategoryGender === (isFemale ? "여" : "남") ||
            category.contestCategoryGender === "무관")
      );
    }

    return availableCategories;
  };

  const calculateAge = (birthDate) => {
    const today = dayjs();
    const birthDay = dayjs(birthDate);
    let age = today.year() - birthDay.year();

    // 만 나이 계산
    if (
      today.month() < birthDay.month() ||
      (today.month() === birthDay.month() && today.date() < birthDay.date())
    ) {
      age--;
    }
    return age;
  };

  const generateAgeBasedOnDistribution = () => {
    const random = Math.random();

    if (random < 0.1) {
      // 17세 ~ 19세 (10%)
      const age = Math.floor(Math.random() * 3) + 17;
      return age;
    } else if (random < 0.7) {
      // 20세 ~ 30세 (60%)
      const age = Math.floor(Math.random() * 11) + 20;
      return age;
    } else if (random < 0.8) {
      // 31세 ~ 44세 (10%)
      const age = Math.floor(Math.random() * 14) + 31;
      return age;
    } else {
      // 45세 이상 (20%)
      const age = Math.floor(Math.random() * 36) + 45;
      return age;
    }
  };

  const generatePlayer = () => {
    const age = generateAgeBasedOnDistribution();
    const currentYear = dayjs().year();
    const birthYear = currentYear - age;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const birthDate = dayjs(`${birthYear}-${birthMonth}-${birthDay}`).format(
      "YYYY-MM-DD"
    );

    const isFemale = Math.random() < 0.3;
    const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    const givenName = isFemale
      ? FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)]
      : MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)];
    const name = `${surname}${givenName}`;

    const phoneNumber =
      PHONE_NUMBERS[Math.floor(Math.random() * PHONE_NUMBERS.length)];
    const email = `${name.toLowerCase()}@example.com`;

    const gym =
      Math.random() < 0.1
        ? "무소속"
        : FITNESS_CLUBS[Math.floor(Math.random() * FITNESS_CLUBS.length)];

    let school = null;
    if (age <= 19) {
      school = HIGH_SCHOOLS[Math.floor(Math.random() * HIGH_SCHOOLS.length)];
    }

    const playerTexts = [
      "우승하자",
      "최고를 향해!",
      "한계를 넘어서!",
      "최고의 순간을 위해",
      "끝까지 포기하지 않는다!",
    ];
    const playerText =
      playerTexts[Math.floor(Math.random() * playerTexts.length)];

    const newPlayer = {
      playerUid: uuidv4(),
      playerName: name,
      playerTel: phoneNumber,
      playerEmail: email,
      playerBirth: birthDate,
      playerGym: school || gym,
      playerGender: isFemale ? "f" : "m",
      playerText: playerText,
      isPriceCheck: false,
      isCanceled: false,
      joins: [],
      createBy: "manual",
      invoiceCreateAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      ...currentContest?.contestInfo,
    };

    const availableCategories = filterCategories(age, isFemale);

    if (availableCategories.length === 0) {
      console.log("No valid categories found for this player");
      return;
    }

    const numberOfCategories =
      age <= 19 ? 1 : Math.floor(Math.random() * 3) + 1;
    const selectedCategories = [];
    const selectedGrades = [];

    while (selectedCategories.length < numberOfCategories) {
      const randomCategory =
        availableCategories[
          Math.floor(Math.random() * availableCategories.length)
        ];

      if (!selectedCategories.includes(randomCategory)) {
        selectedCategories.push(randomCategory);

        // 여기에서 randomGrade를 정의하고 그레이드를 선택합니다.
        const relatedGrades = gradesArray.filter(
          (grade) => grade.refCategoryId === randomCategory.contestCategoryId
        );

        if (relatedGrades.length > 0) {
          const randomGrade =
            relatedGrades[Math.floor(Math.random() * relatedGrades.length)];
          selectedGrades.push({
            contestCategoryId: randomCategory.contestCategoryId,
            contestCategoryTitle: randomCategory.contestCategoryTitle,
            contestGradeId: randomGrade.contestGradeId,
            contestGradeTitle: randomGrade.contestGradeTitle,
          });

          // 카테고리 및 그레이드 분포 업데이트
          setCategoryDistribution((prev) => ({
            ...prev,
            [randomCategory.contestCategoryTitle]:
              (prev[randomCategory.contestCategoryTitle] || 0) + 1,
          }));

          setGradeDistribution((prev) => ({
            ...prev,
            [randomCategory.contestCategoryTitle]: {
              ...(prev[randomCategory.contestCategoryTitle] || {}),
              [randomGrade.contestGradeTitle]:
                (prev[randomCategory.contestCategoryTitle]?.[
                  randomGrade.contestGradeTitle
                ] || 0) + 1,
            },
          }));
        }
      }
    }

    newPlayer.joins = selectedGrades;

    return newPlayer;
  };

  const handleGeneratePlayers = () => {
    const newPlayers = [];
    for (let i = 0; i < playerCount; i++) {
      const player = generatePlayer();
      if (player) {
        newPlayers.push(player);
      }
    }
    setPlayers([...players, ...newPlayers]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPlayers(players.map((player) => player.playerUid));
    } else {
      setSelectedPlayers([]);
    }
  };

  const handleSelectPlayer = (e, playerUid) => {
    if (e.target.checked) {
      setSelectedPlayers([...selectedPlayers, playerUid]);
    } else {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerUid));
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    fetchPool();
  }, [currentContest]);

  return (
    <div style={{ backgroundColor: "white", padding: "20px" }}>
      <h1>Random Player Generator</h1>
      <div>
        <label>Number of Players to Generate: </label>
        <input
          type="number"
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
        />
        <button onClick={handleGeneratePlayers} disabled={!isButtonEnabled}>
          Generate Players
        </button>
      </div>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  players.length > 0 &&
                  selectedPlayers.length === players.length
                }
              />
            </th>
            <th>Name</th>
            <th>Gym</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Birth Date</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Categories</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.playerUid}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedPlayers.includes(player.playerUid)}
                  onChange={(e) => handleSelectPlayer(e, player.playerUid)}
                />
              </td>
              <td>{player.playerName}</td>
              <td>{player.playerGym}</td>
              <td>{player.playerTel}</td>
              <td>{player.playerEmail}</td>
              <td>{player.playerBirth}</td>
              <td>{calculateAge(player.playerBirth)}</td>
              <td>{player.playerGender === "f" ? "Female" : "Male"}</td>
              <td>
                {player.joins.map((join) => (
                  <div key={join.contestGradeId}>
                    {join.contestCategoryTitle} - {join.contestGradeTitle}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Category Distribution</h2>
      <ul>
        {Object.keys(categoryDistribution).map((category) => (
          <li key={category}>
            <button onClick={() => handleCategoryClick(category)}>
              {category}: {categoryDistribution[category]} players
            </button>
          </li>
        ))}
      </ul>

      {selectedCategory && (
        <div>
          <h3>{selectedCategory} - Grade Distribution</h3>
          <ul>
            {gradeDistribution[selectedCategory] &&
              Object.keys(gradeDistribution[selectedCategory]).map((grade) => (
                <li key={grade}>
                  {grade}: {gradeDistribution[selectedCategory][grade]} players
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RandomPlayerGenerator;
