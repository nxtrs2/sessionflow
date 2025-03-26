import { createContext } from "react";
import { Project } from "../types";

export interface ProjectsContextProps {
  projects: Project[];
  currentProject: Project | null;
  loadingProjects: boolean;
  loadingMsg: string;
  setLoadingProjects: (loading: boolean) => void;
  fetchProjects: () => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
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

  deleteProject: () => Promise<boolean>;
}

export const ProjectsContext = createContext<ProjectsContextProps | undefined>(
  undefined
);
