import { createContext } from "react";
import { Project, SongData } from "../types";

export interface ProjectsContextProps {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  loadingMsg: string;
  fetchProjects: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  createProject: (params: {
    title: string;
    masterFile: File;
    coverArt?: File;
    tempo: number;
    numerator: number;
    denominator: number;
  }) => Promise<void>;
  updateProject: (params: {
    title?: string;
    newMasterFile?: File;
    newCoverArt?: File;
  }) => Promise<void>;
  updateProjectSongData: (songData: SongData) => Promise<void>;
  deleteProject: () => Promise<boolean>;
}

export const ProjectsContext = createContext<ProjectsContextProps | undefined>(
  undefined
);
