import React from "react";
import { Project, SongData } from "../types";
import NewProject from "./NewProject";

interface ProjectsListProps {
  isPlaying: boolean;
  isLoggedIn: boolean;
  projects: Project[];
  projectLoaded: boolean;
  demoLoaded: boolean;
  setDemoLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  handleLoadSongJSONFile: (path: string) => void;
  handleLoadSongJSON: (data: SongData) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  isPlaying,
  isLoggedIn,
  projects,
  projectLoaded,
  demoLoaded,
  setDemoLoaded,
  handleLoadSongJSONFile,
  handleLoadSongJSON,
}) => {
  const [showNewProjectDialog, setShowNewProjectDialog] =
    React.useState<boolean>(false);

  return (
    <div className="settings">
      {showNewProjectDialog && (
        <NewProject setShowNewProjectDialog={setShowNewProjectDialog} />
      )}
      <div className="settings-heading">Demo Projects</div>
      <div className="settings-section">
        <div className="projects-list">
          <div
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
                handleLoadSongJSONFile("/data/song2.json");
                setDemoLoaded(true);
              }}
            >
              <img
                // src={coverartUrls[projects.indexOf(project)]}
                src={`${process.env.REACT_SUPABASE_URL}/storage/v1/object/project_files/demo/coverart-signals.jpeg`}
                style={{ width: "100px", height: "100px" }}
              />
            </button>
            <h3>Signals</h3>
          </div>
          {/* <button
        disabled={isPlaying}
        onClick={() => {
          handleLoadSongJSON("/data/song.json");
        }}
      >
        Untitled2
      </button> */}
        </div>
      </div>

      <div className="settings-heading">
        {isLoggedIn
          ? projects.length > 0
            ? "Your Projects"
            : "No Projects Found"
          : "Log in to view your projects"}

        <div>
          {isLoggedIn && (
            <button
              onClick={() => {
                setShowNewProjectDialog(true);
              }}
            >
              New
            </button>
          )}
          {!demoLoaded && projectLoaded && isLoggedIn && (
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
                const title = project.title
                  .replace(/[^a-zA-Z0-9]/g, "_")
                  .toLowerCase();
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
                        src={`${process.env.REACT_SUPABASE_URL}/storage/v1/object/project_files/${project.user_id}/${title}/${project.coverart}`}
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
