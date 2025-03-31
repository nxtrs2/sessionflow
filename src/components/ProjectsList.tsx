import React from "react";
import { DemoProject, Project, SongData } from "../types";
import EditProject from "./EditProject";
import { useSession } from "../hooks/useSession";
import { useProjects } from "../hooks/useProjects";
import { useCurrentProject } from "../hooks/useCurrentProject";
import useConfirm from "../hooks/useConfirm";
import { Edit2, Trash2Icon, Save, File, RefreshCcw } from "lucide-react";

interface ProjectsListProps {
  isPlaying: boolean;
  projectLoaded: boolean;
  setShowNewProjectDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleLoadSongJSONFile: (path: string) => void;
  handleLoadSongJSON: (data: SongData) => void;
  setDemoProject: React.Dispatch<React.SetStateAction<DemoProject | null>>;
  handleUpdateProjectSongData: () => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  isPlaying,
  projectLoaded,
  setShowNewProjectDialog,
  handleLoadSongJSONFile,
  handleLoadSongJSON,
  setDemoProject,
  handleUpdateProjectSongData,
}) => {
  const { isLoggedIn } = useSession();
  const { confirm, Prompt } = useConfirm();
  const {
    projects,
    currentProject,
    isDemoLoaded,
    setSelectedProject,
    fetchProjects,
    deleteProject,
    setIsDemoLoaded,
  } = useProjects();
  const { projectNeedSave, setProjectNeedSave } = useCurrentProject();
  const [showEditProject, setShowEditProject] = React.useState(false);

  const handleLoadProject = async (project: Project) => {
    if (projectNeedSave) {
      const confirmLoad = await confirm(
        "You have unsaved changes. Proceed without saving?"
      );
      if (!confirmLoad) {
        return;
      }
      setProjectNeedSave(false);
    }
    setSelectedProject(project);
    setIsDemoLoaded(false);
    handleLoadSongJSON(project.data);
  };

  const handleLoadDemoProject = async (url: string) => {
    if (projectNeedSave) {
      const confirmLoad = await confirm(
        "You have unsaved changes. Proceed loading Demo?"
      );
      if (!confirmLoad) {
        return;
      }
      setProjectNeedSave(false);
    }
    setIsDemoLoaded(true);
    setSelectedProject(null);
    handleLoadSongJSONFile(url);
  };

  const handleNewProject = async () => {
    if (projectNeedSave) {
      const confirmLoad = await confirm("You have unsaved changes. Proceed?");
      if (!confirmLoad) {
        return;
      }
      setProjectNeedSave(false);
    }
    // setSelectedProject(null);
    // setIsDemoLoaded(false);
    setShowNewProjectDialog(true);
  };

  const handleDeleteProject = async () => {
    if (currentProject) {
      const confirmDelete = await confirm(
        `Are you sure you want to delete the project "${currentProject.title}"?`
      );
      if (confirmDelete) {
        deleteProject();
      }
    }
  };

  return (
    <div className="settings">
      <Prompt />
      {showEditProject && currentProject && (
        <EditProject openDialog={setShowEditProject} />
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
                setDemoProject({
                  title: "Demo: Signals",
                  url: "/data/song2.json",
                  filename: "demo/signals-master.mp3",
                });
                handleLoadDemoProject("/data/song2.json");
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
                setDemoProject({
                  title: "Demo: $ide $croller",
                  url: "/data/song.json",
                  filename: "demo2/side-scroller-master.mp3",
                });
                handleLoadDemoProject("/data/song.json");
              }}
            >
              <img
                // src={coverartUrls[projects.indexOf(project)]}
                src={`${process.env.REACT_SUPABASE_URL}/storage/v1/object/project_files/demo2/coverart-sidescroller.jpeg`}
                style={{ width: "100px", height: "100px" }}
              />
            </button>
            <h3>$ide $croller</h3>
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
        {isLoggedIn && (
          <button
            style={{
              fontSize: "1em",
              marginLeft: "auto",
            }}
            disabled={isPlaying}
            onClick={() => {
              fetchProjects();
            }}
          >
            <RefreshCcw size={18} />
          </button>
        )}

        <div>
          {isLoggedIn && (
            <button
              disabled={isPlaying}
              onClick={() => {
                handleNewProject();
              }}
            >
              <File size={18} />
            </button>
          )}
          {!isDemoLoaded && projectLoaded && isLoggedIn && currentProject && (
            <>
              <button
                disabled={isPlaying || !projectNeedSave}
                onClick={() => {
                  handleUpdateProjectSongData();
                }}
              >
                <Save size={18} />
              </button>

              <button
                disabled={isPlaying}
                onClick={() => {
                  setShowEditProject(true);
                }}
              >
                <Edit2 size={18} />
              </button>

              <button
                disabled={isPlaying}
                onClick={() => {
                  handleDeleteProject();
                }}
                style={{
                  color: isPlaying ? "rgb(93, 93, 93)" : "red",
                }}
              >
                <Trash2Icon size={18} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="settings-section">
        {projects && (
          <div className="projects-list">
            <>
              {projects.map((project) => {
                return (
                  <div key={project.id} className="projects-list-item">
                    <button
                      style={{
                        fontSize: "1em",
                        outline:
                          currentProject?.id === project.id
                            ? "2px solid green"
                            : "none",
                      }}
                      disabled={isPlaying || currentProject?.id === project.id}
                      onClick={() => {
                        handleLoadProject(project);
                      }}
                    >
                      <img
                        src={
                          project.coverart
                            ? `${process.env.REACT_SUPABASE_URL}/storage/v1/object/project_files/${project.user_id}/${project.id}/${project.coverart}`
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
