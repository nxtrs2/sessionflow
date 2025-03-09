import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase/supabaseClient";

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
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (session) {
        try {
          const { data, error } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", session.user.id);

          if (error) {
            throw error;
          }

          setProjects(data);
        } catch (error) {
          console.error("Error fetching projects:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProjects();
  }, [session]);

  return (
    <div className="settings">
      <h2>Demo Projects</h2>
      <div className="settings-section">
        <button
          style={{
            fontSize: "1em",
          }}
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
        <button
          style={{
            fontSize: "1em",
          }}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          Load Master Track
        </button>
      </div>
      <h2>Your Projects</h2>
      <div className="settings-section">
        {session && (
          <div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                {projects.map((project) => (
                  <div key={project.id}>
                    <h3>{project.name}</h3>
                    <button
                      style={{
                        fontSize: "1em",
                      }}
                      disabled={isPlaying}
                      onClick={() => {
                        handleLoadSongJSON(project.data);
                      }}
                    >
                      {project.title}
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
