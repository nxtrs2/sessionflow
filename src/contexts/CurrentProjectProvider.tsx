// InstrumentsProvider.tsx
import React, { useState, ReactNode } from "react";
import {
  CurrentProjectContextType,
  CurrentProjectContext,
} from "./CurrentProjectContext";
import { supabase } from "../supabase/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { Instrument, SongData } from "../types";
import { useProjects } from "../hooks/useProjects";
interface CurrentProjectProviderProps {
  session: Session | null;
  children: ReactNode;
}

export const CurrentProjectProvider: React.FC<CurrentProjectProviderProps> = ({
  children,
  session,
}) => {
  const { currentProject } = useProjects();
  const [loadingProject, setLoadingProject] = useState<boolean>(false);
  const [projectNeedSave, setProjectNeedSave] = useState<boolean>(false);

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);

  const updateProjectSongData = async (songData: SongData) => {
    if (!session) return;
    try {
      setLoadingProject(true);
      const { error } = await supabase
        .from("projects")
        .update({
          user_id: session.user.id,
          title: currentProject?.title,
          notes: currentProject?.notes,
          filename: currentProject?.filename,
          url: session.user.id,
          data: songData,
        })
        .eq("id", currentProject?.id);

      if (error) {
        throw error;
      }
      setProjectNeedSave(false);
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Error updating project.");
    } finally {
      setLoadingProject(false);
    }
  };

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

  const getNextInstrumentIndex = () => {
    return instruments.length + 1;
  };

  const value: CurrentProjectContextType = {
    loadingProject,
    currentProject: currentProject,
    instruments,
    selectedInstrument,
    projectNeedSave,
    setLoadingProject,
    setProjectNeedSave,
    updateProjectSongData,
    setSelectedInstrument,
    setInstruments,
    addInstrument,
    updateInstrument,
    deleteInstrument,
    getNextInstrumentIndex,
  };

  return (
    <CurrentProjectContext.Provider value={value}>
      {children}
    </CurrentProjectContext.Provider>
  );
};
