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

// Constants
const SURNAMES_ARRAY = [...SURNAMES];
const MALE_NAMES_ARRAY = [...MALE_NAMES];
const FEMALE_NAMES_ARRAY = [...FEMALE_NAMES];
const PHONE_NUMBERS_ARRAY = [...PHONE_NUMBERS];
const FITNESS_NAMES_ARRAY = [...FITNESS_CLUBS];
const HIGH_SCHOOLS_ARRAY = [...HIGH_SCHOOLS];

const RandomPlayerGenerator = () => {
  const { currentContest } = useContext(CurrentContestContext);
  const [players, setPlayers] = useState([]);
  const [categorysArray, setCategorysArray] = useState([]);
  const [gradesArray, setGradesArray] = useState([]);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false); // Button enable state

  const fetchCategoryDocument = useFirestoreGetDocument(
    "contest_categorys_list"
  );
  const fetchGradeDocument = useFirestoreGetDocument("contest_grades_list");

  const addInvoice = useFirestoreAddData("invoices_pool");

  // Function to fetch categories and grades
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

        // Set button to be enabled after data is loaded
        setTimeout(() => {
          setIsButtonEnabled(true); // Enable the button after 2 seconds
        }, 2000);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Function to filter categories based on player's attributes
  const filterCategories = (age, isFemale) => {
    let availableCategories = [];

    if (age <= 19) {
      // Players 19 years old or younger: only "학생부", no duplicate entry
      availableCategories = categorysArray.filter(
        (category) =>
          category.contestCategoryTitle.includes("학생부") &&
          category.contestCategoryGender === "남"
      );
    } else if (age >= 20 && age <= 44) {
      // Players 20-44 years old: exclude "학생부" and "장년부", allow 1-3 categories
      availableCategories = categorysArray.filter(
        (category) =>
          !category.contestCategoryTitle.includes("학생부") &&
          !category.contestCategoryTitle.includes("장년부") &&
          (category.contestCategoryGender === (isFemale ? "여" : "남") ||
            category.contestCategoryGender === "무관")
      );
    } else if (age >= 45) {
      // Players 45 years old or older: allow "장년부" and others, exclude "학생부"
      availableCategories = categorysArray.filter(
        (category) =>
          !category.contestCategoryTitle.includes("학생부") &&
          (category.contestCategoryTitle.includes("장년부") ||
            category.contestCategoryGender === (isFemale ? "여" : "남") ||
            category.contestCategoryGender === "무관")
      );
    }

    return availableCategories;
  };

  // Function to generate random player
  const generatePlayer = () => {
    const birthYear = Math.floor(Math.random() * 50) + 1970; // Between 1970-2020
    const birthDate = `${birthYear}-${Math.floor(Math.random() * 12) + 1}-${
      Math.floor(Math.random() * 28) + 1
    }`;
    const age = new Date().getFullYear() - birthYear;

    const isFemale = Math.random() < 0.3; // 30% chance for female
    const surname =
      SURNAMES_ARRAY[Math.floor(Math.random() * SURNAMES_ARRAY.length)];
    const givenName = isFemale
      ? FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)]
      : MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)];
    const name = `${surname}${givenName}`; // Combine surname and given name without space

    const phoneNumber =
      PHONE_NUMBERS[Math.floor(Math.random() * PHONE_NUMBERS.length)];
    const email = `${name.toLowerCase()}@example.com`;
    const gym =
      Math.random() < 0.5
        ? FITNESS_NAMES_ARRAY[
            Math.floor(Math.random() * FITNESS_NAMES_ARRAY.length)
          ]
        : "무소속";

    let school = null;
    if (age <= 19) {
      school =
        HIGH_SCHOOLS_ARRAY[
          Math.floor(Math.random() * HIGH_SCHOOLS_ARRAY.length)
        ];
    }

    // Generate player object before filtering categories
    const newPlayer = {
      playerUid: uuidv4(),
      playerName: name,
      playerTel: phoneNumber,
      playerEmail: email,
      playerBirth: birthDate,
      playerGym: school || gym,
      playerGender: isFemale ? "f" : "m",
      playerText: "우승하자",
      isPriceCheck: false,
      isCanceled: false,
      joins: [], // This will be filled with categories and grades later
      createBy: "manual",
      invoiceCreateAt: new Date().toISOString(),
    };

    // Log player info before category filtering
    console.log("Generated player before category filtering:", newPlayer);

    // Filter contest categories based on player's age and gender
    const availableCategories = filterCategories(age, isFemale);

    if (availableCategories.length === 0) {
      console.log("No valid categories found for this player");
      return;
    }

    // Determine the number of categories (1 for students, 1-3 for others)
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
        }
      }
    }

    // Update player with selected categories and grades
    newPlayer.joins = selectedGrades;

    // Log final player object with selected categories
    console.log("Generated player after category selection:", newPlayer);

    setPlayers([...players, newPlayer]);
  };

  // Fetch data once when the component is mounted
  useEffect(() => {
    fetchPool();
  }, []);

  return (
    <div>
      <h1>Random Player Generator</h1>
      <button
        onClick={() => {
          if (isButtonEnabled) {
            generatePlayer(); // Generate player only if the button is enabled
          } else {
            console.log("Data is still loading...");
          }
        }}
        disabled={!isButtonEnabled} // Disable the button until data is loaded
      >
        Generate Random Player
      </button>
      <pre>{JSON.stringify(players, null, 2)}</pre>
    </div>
  );
};

export default RandomPlayerGenerator;
