import React from "react";

interface ProjectsListProps {
  isPlaying: boolean;
  handleLoadSongJSON: (path: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  isPlaying,
  handleLoadSongJSON,
  onFileChange,
}) => {
  return (
    <div>
      <button
        disabled={isPlaying}
        onClick={() => {
          handleLoadSongJSON("/data/song2.json");
        }}
      >
        Signals
      </button>
      <button
        disabled={isPlaying}
        onClick={() => {
          handleLoadSongJSON("/data/song.json");
        }}
      >
        Untitled2
      </button>
      <input
        type="file"
        accept="audio/*"
        onChange={onFileChange}
        style={{ display: "none" }}
        id="fileInput"
      />
      <button onClick={() => document.getElementById("fileInput")?.click()}>
        Load Master File
      </button>
    </div>
  );
};

export default ProjectsList;
