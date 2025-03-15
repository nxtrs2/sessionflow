import React from "react";
import { Project, SongData } from "../types";
import { useSession } from "../hooks/useSession";

interface ProjectsListProps {
  isPlaying: boolean;
  projects: Project[];
  projectLoaded: boolean;
  demoLoaded: boolean;
  setProjectId: React.Dispatch<React.SetStateAction<number | null>>;
  setDemoLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setShowNewProjectDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleLoadSongJSONFile: (path: string) => void;
  handleLoadSongJSON: (data: SongData) => void;
  handleSaveProject: () => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  isPlaying,
  projects,
  projectLoaded,
  demoLoaded,
  setProjectId,
  setDemoLoaded,
  setShowNewProjectDialog,
  handleLoadSongJSONFile,
  handleLoadSongJSON,
  handleSaveProject,
}) => {
  const { isLoggedIn } = useSession();
  return (
    <div className="settings">
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
                handleSaveProject();
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
                        setProjectId(project.id);
                        setDemoLoaded(false);
                        handleLoadSongJSON(project.data);
                      }}
                    >
                      <img
                        src={
                          project.coverart
                            ? `${process.env.REACT_SUPABASE_URL}/storage/v1/object/project_files/${project.user_id}/${title}/${project.coverart}`
                            : "/not-found.jpg"
                        }
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
