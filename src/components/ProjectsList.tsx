import React from "react";
import { Project, SongData } from "../types";

interface ProjectsListProps {
  isPlaying: boolean;
  projects: Project[];
  projectLoaded: boolean;
  demoLoaded: boolean;
  setDemoLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  handleLoadSongJSONFile: (path: string) => void;
  handleLoadSongJSON: (data: SongData) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  isPlaying,
  projects,
  projectLoaded,
  demoLoaded,
  setDemoLoaded,
  handleLoadSongJSONFile,
  handleLoadSongJSON,
  onFileChange,
}) => {
  return (
    <div className="settings">
      <div className="settings-heading">Demo Projects</div>
      <div className="settings-section">
        <button
          style={{
            fontSize: "1em",
          }}
          disabled={isPlaying}
          onClick={() => {
            handleLoadSongJSONFile("/data/song2.json");
            setDemoLoaded(true);
          }}
        >
          Signals
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
        <button
          style={{
            fontSize: "1em",
          }}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          Load Master Track
        </button>
      </div>

      <div className="settings-heading">
        Your Projects
        <div>
          <button
            onClick={() => {
              // Add your new project creation logic here
              console.log("New Project button clicked");
            }}
          >
            New
          </button>
          {!demoLoaded && projectLoaded && (
            <button
              onClick={() => {
                // Add your new project creation logic here
                console.log("Save Project button clicked");
              }}
            >
              Save
            </button>
          )}
        </div>
      </div>
      <div className="settings-section">
        {projects && (
          <div className="projects-list">
            <>
              {projects.map((project) => {
                return (
                  <div
                    key={project.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <button
                      style={{
                        fontSize: "1em",
                      }}
                      disabled={isPlaying}
                      onClick={() => {
                        setDemoLoaded(false);
                        handleLoadSongJSON(project.data);
                      }}
                    >
                      <img
                        // src={coverartUrls[projects.indexOf(project)]}
                        src={`${process.env.REACT_SUPABASE_URL}/storage/v1/object/project_files/coverart/${project.coverart}`}
                        alt={`${project.title} cover art`}
                        style={{ width: "100px", height: "100px" }}
                      />
                    </button>
                    <h3>{project.title}</h3>
                  </div>
                );
              })}
            </>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
