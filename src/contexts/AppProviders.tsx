import React from "react";
import { useSession } from "../hooks/useSession";
import { ProjectsProvider } from "./ProjectsProvider";
import { CurrentProjectProvider } from "./CurrentProjectProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const { session } = useSession();
  return (
    <ProjectsProvider session={session}>
      <CurrentProjectProvider session={session}>
        {children}
      </CurrentProjectProvider>
    </ProjectsProvider>
  );
};

export default AppProviders;
