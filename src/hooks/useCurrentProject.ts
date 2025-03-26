// useInstruments.ts
import { useContext } from "react";
import { CurrentProjectContext } from "../contexts/CurrentProjectContext";

export const useCurrentProject = () => {
  const context = useContext(CurrentProjectContext);
  if (context === undefined) {
    throw new Error(
      "useCurrentProject must be used within an InstrumentsProvider"
    );
  }
  return context;
};
