// InstrumentsContext.tsx
import { createContext } from "react";
import { Instrument } from "../types";

export interface InstrumentsContextType {
  instruments: Instrument[];
  selectedInstrument: Instrument | null;
  setSelectedInstrument: React.Dispatch<
    React.SetStateAction<Instrument | null>
  >;
  setInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>;
  addInstrument(instrument: Instrument): void;
  updateInstrument(instrument: Instrument): void;
  deleteInstrument(instrument: Instrument): void;
}

export const InstrumentsContext = createContext<
  InstrumentsContextType | undefined
>(undefined);
