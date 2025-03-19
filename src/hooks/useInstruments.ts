// useInstruments.ts
import { useContext } from "react";
import { InstrumentsContext } from "../contexts/InstrumentsContext";

export const useInstruments = () => {
  const context = useContext(InstrumentsContext);
  if (context === undefined) {
    throw new Error(
      "useInstruments must be used within an InstrumentsProvider"
    );
  }
  return context;
};
