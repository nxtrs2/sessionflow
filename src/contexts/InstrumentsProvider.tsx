// InstrumentsProvider.tsx
import React, { useState, ReactNode } from "react";
import {
  InstrumentsContext,
  InstrumentsContextType,
} from "./InstrumentsContext";
import { Instrument } from "../types";

interface InstrumentsProviderProps {
  children: ReactNode;
}

export const InstrumentsProvider: React.FC<InstrumentsProviderProps> = ({
  children,
}) => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);

  const addInstrument = (instrument: Instrument) => {
    setInstruments((prevInstruments) => [...prevInstruments, instrument]);
  };

  const updateInstrument = (instrument: Instrument) => {
    setInstruments((prevInstruments) => {
      const existingInstrumentIndex = prevInstruments.findIndex(
        (inst) => inst.id === instrument.id
      );
      if (existingInstrumentIndex !== -1) {
        const updatedInstruments = [...prevInstruments];
        updatedInstruments[existingInstrumentIndex] = instrument;
        return updatedInstruments;
      }
      return prevInstruments;
    });
  };

  const deleteInstrument = (instrument: Instrument) => {
    setInstruments((prevInstruments) =>
      prevInstruments.filter((inst) => inst.id !== instrument.id)
    );
  };

  const value: InstrumentsContextType = {
    instruments,
    selectedInstrument,
    setSelectedInstrument,
    setInstruments,
    addInstrument,
    updateInstrument,
    deleteInstrument,
  };

  return (
    <InstrumentsContext.Provider value={value}>
      {children}
    </InstrumentsContext.Provider>
  );
};
