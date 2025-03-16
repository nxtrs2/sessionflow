import React from "react";
import { Project, SongData } from "../types";
import EditProject from "./EditProject";
import { useSession } from "../hooks/useSession";
import { Edit2, Trash2Icon, Save, File, RefreshCcw } from "lucide-react";
import {
  convertTitleToFilename,
  handleDeleteProject,
} from "../helpers/FileFunctions";

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
  fetchProjects: () => void;
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
  fetchProjects,
}) => {
  const { isLoggedIn } = useSession();
  const [showEditProject, setShowEditProject] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(
    null
  );

  return (
    <div className="settings">
      {showEditProject && selectedProject && (
        <EditProject
          project={selectedProject}
          openDialog={setShowEditProject}
          fetchProjects={fetchProjects}
        />
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

        <div>
          {isLoggedIn && (
            <button
              disabled={isPlaying}
              onClick={() => {
                setShowNewProjectDialog(true);
              }}
            >
              <File size={18} />
            </button>
          )}
          {!demoLoaded && projectLoaded && isLoggedIn && selectedProject && (
            <>
              <button
                disabled={isPlaying}
                onClick={() => {
                  handleSaveProject();
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
                  if (selectedProject) {
                    const confirmDelete = window.confirm(
                      `Are you sure you want to delete the project "${selectedProject.title}"?`
                    );
                    if (confirmDelete) {
                      handleDeleteProject(selectedProject);
                      fetchProjects();
                    }
                  }
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
                const title = convertTitleToFilename(project.title);
                return (
                  <div key={project.id} className="projects-list-item">
                    <button
                      style={{
                        fontSize: "1em",
                        outline:
                          selectedProject?.id === project.id
                            ? "2px solid green"
                            : "none",
                      }}
                      disabled={isPlaying || selectedProject?.id === project.id}
                      onClick={() => {
                        setSelectedProject(project);
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
