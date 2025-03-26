// CurrentProjectContext.tsx
import { createContext } from "react";
import { Instrument, SongData, Project } from "../types";

export interface CurrentProjectContextType {
  loadingProject: boolean;

  currentProject: Project | null;
  instruments: Instrument[];
  selectedInstrument: Instrument | null;
  projectNeedSave: boolean;
  setLoadingProject: (loading: boolean) => void;
  setProjectNeedSave: (value: boolean) => void;

  updateProjectSongData: (songData: SongData) => Promise<void>;
  setSelectedInstrument: React.Dispatch<
    React.SetStateAction<Instrument | null>
  >;
  setInstruments: React.Dispatch<React.SetStateAction<Instrument[]>>;
  // setCurrentProject: (project: Project | null) => void;
  addInstrument(instrument: Instrument): void;
  updateInstrument(instrument: Instrument): void;
  deleteInstrument(instrument: Instrument): void;
  getNextInstrumentIndex(): number;
}

export const CurrentProjectContext = createContext<
  CurrentProjectContextType | undefined
>(undefined);
