import React from "react";
import { Session } from "@supabase/supabase-js";

interface ProjectsListProps {
  session: Session | null;
  isPlaying: boolean;
  handleLoadSongJSON: (path: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  session,
  isPlaying,
  handleLoadSongJSON,
  onFileChange,
}) => {
  return (
    <>
      <div>
        <button
          disabled={isPlaying}
          onClick={() => {
            handleLoadSongJSON("/data/song2.json");
          }}
        >
          DEMO
        </button>
        {/* <button
        disabled={isPlaying}
        onClick={() => {
          handleLoadSongJSON("/data/song.json");
        }}
      >
        Untitled2
      </button> */}
        <input
          type="file"
          accept="audio/*"
          onChange={onFileChange}
          style={{ display: "none" }}
          id="fileInput"
        />
        <button onClick={() => document.getElementById("fileInput")?.click()}>
          Load Master Track
        </button>
      </div>
      <div>
        {session && (
          <div>
            {/* Code to load and display projects from Supabase */}
            {/* Example: */}
            <p>Loading projects...</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectsList;
