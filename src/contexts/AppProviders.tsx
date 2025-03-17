import React from "react";
import { useSession } from "../hooks/useSession";
import { ProjectsProvider } from "./ProjectsProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const { session } = useSession();
  return <ProjectsProvider session={session}>{children}</ProjectsProvider>;
};

export default AppProviders;
