import React, { createContext, useState } from "react";

export const CurrentContestContext = createContext();

export const CurrentContestProvider = ({ children }) => {
  const [currentContest, setCurrentContest] = useState(null);

  return (
    <CurrentContestContext.Provider value={{ currentContest, setCurrentContest }}>
      {children}
    </CurrentContestContext.Provider>
  );
};
