import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import { ProjectsContext, ProjectsContextProps } from "./ProjectsContext";
import { Project, SongData, UploadResponse } from "../types";
import type { Session } from "@supabase/supabase-js";
import { uploadMP3File, uploadCoverArt } from "../helpers/FileFunctions"; // adjust your import as needed

interface ProjectsProviderProps {
  session: Session | null;
  children: React.ReactNode;
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({
  children,
  session,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>("");
  const [projectNeedSave, setProjectNeedSave] = useState<boolean>(false);

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    setLoadingMsg("Loading Projects");
    if (session) {
      try {
        setLoading(true);
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
    } else {
      setProjects([]);
      setLoading(false);
    }
  };

  const createProject = async (params: {
    title: string;
    masterFile: File;
    coverArt?: File;
    tempo: number;
    numerator: number;
    denominator: number;
  }): Promise<void> => {
    const { title, masterFile, coverArt, tempo, numerator, denominator } =
      params;
    if (!session?.user.id) throw new Error("User not logged in");

    const initialSongData: SongData = {
      project: {
        tempo,
        numerator,
        denominator,
        countIn: 0,
        skipBeatsBy: 0,
        skipBeats: 0,
        masterVolume: 40,
        masterPan: 0,
        masterMute: false,
        masterSolo: false,
      },
      notes: "",
      structure: [],
      instruments: [],
      timeline: [],
      markers: [],
    };

    const { data, error: insertError } = await supabase
      .from("projects")
      .insert([
        {
          user_id: session.user.id,
          title,
          filename: "",
          url: session.user.id,
          data: initialSongData,
          coverart: null,
        },
      ])
      .select("*")
      .single();

    if (insertError || !data) {
      throw insertError || new Error("Error inserting project");
    }

    const newProjectId = data.id;

    const masterUpload = await uploadMP3File(masterFile, newProjectId);
    if (!masterUpload.success) {
      throw new Error("Error uploading master file: " + masterUpload.error);
    }
    const masterFileName = masterUpload.filename || "";

    let coverArtUpload: UploadResponse = {
      success: false,
      filename: null,
      url: "",
      error: "",
    };

    // If a cover art file is provided, upload it using the new project ID.
    if (coverArt) {
      coverArtUpload = await uploadCoverArt(coverArt, newProjectId);
      if (!coverArtUpload.success) {
        throw new Error("Error uploading cover art: " + coverArtUpload.error);
      }
    }

    // Update the newly inserted project with the real file names.
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        filename: masterFileName,
        coverart: coverArtUpload?.filename || null,
      })
      .eq("id", newProjectId);

    if (updateError) {
      throw updateError;
    }

    // Refresh projects list
    await fetchProjects();
  };

  //   const createProject = async (params: {
  //     title: string;
  //     masterFile: File;
  //     coverArt?: File;
  //     tempo: number;
  //     numerator: number;
  //     denominator: number;
  //   }): Promise<void> => {
  //     const { title, masterFile, coverArt, tempo, numerator, denominator } =
  //       params;
  //     if (!session?.user.id) throw new Error("User not logged in");

  //     let coverArtUpload: UploadResponse = {
  //       success: false,
  //       filename: null,
  //       url: "",
  //       error: "",
  //     };

  //     // Upload the master file
  //     const upload = await uploadMP3File(masterFile, title);
  //     if (coverArt) {
  //       coverArtUpload = await uploadCoverArt(coverArt, title);
  //       if (!coverArtUpload.success) {
  //         throw new Error("Error uploading cover art: " + coverArtUpload.error);
  //       }
  //     }
  //     if (!upload.success) {
  //       throw new Error("Error uploading file: " + upload.error);
  //     }
  //     const { filename } = upload;

  //     // Create song data
  //     const songData: SongData = {
  //       project: {
  //         title,
  //         filename: filename || "",
  //         url: session.user.id,
  //         tempo,
  //         numerator,
  //         denominator,
  //         countIn: 0,
  //         skipBeatsBy: 0,
  //         skipBeats: 0,
  //         masterVolume: 40,
  //         masterPan: 0,
  //         masterMute: false,
  //         masterSolo: false,
  //       },
  //       notes: "",
  //       structure: [],
  //       instruments: [],
  //       timeline: [],
  //       markers: [],
  //     };

  //     // Insert the new project into Supabase
  //     const { error: insertError } = await supabase.from("projects").insert([
  //       {
  //         user_id: session.user.id,
  //         title,
  //         filename: filename,
  //         url: session.user.id,
  //         data: songData,
  //         coverart: coverArtUpload?.filename || null,
  //       },
  //     ]);

  //     if (insertError) {
  //       throw insertError;
  //     } else {
  //       await fetchProjects();
  //     }
  //   };

  const updateProject = async (params: {
    title?: string;
    newMasterFile?: File;
    newCoverArt?: File;
  }): Promise<void> => {
    const { title, newMasterFile, newCoverArt } = params;

    if (currentProject === null) {
      throw new Error("No project selected");
      return;
    }
    let masterFileName = currentProject.filename;
    let coverArtFileName = currentProject.coverart;

    // If a new master file is provided, delete the old one and upload the new file.
    if (newMasterFile) {
      const { error: deleteMasterError } = await supabase.storage
        .from("project_files") // adjust bucket name as needed
        .remove([currentProject.filename]);

      if (deleteMasterError) {
        console.error("Error deleting old master file:", deleteMasterError);
        // Optionally, decide whether to continue or abort here.
      }

      const upload = await uploadMP3File(
        newMasterFile,
        currentProject.id.toString()
      );
      if (!upload.success) {
        throw new Error("Error uploading new master file: " + upload.error);
      }
      masterFileName = upload.filename || "";
    }

    // If a new cover art file is provided, delete the old cover art (if it exists) and upload the new one.
    if (newCoverArt) {
      if (currentProject.coverart) {
        const { error: deleteCoverError } = await supabase.storage
          .from("cover-art") // adjust bucket name as needed
          .remove([currentProject.coverart]);
        if (deleteCoverError) {
          console.error("Error deleting old cover art file:", deleteCoverError);
          // Optionally, decide whether to continue or abort here.
        }
      }
      const coverUpload = await uploadCoverArt(
        newCoverArt,
        currentProject.id.toString()
      );
      if (!coverUpload.success) {
        throw new Error("Error uploading new cover art: " + coverUpload.error);
      }
      coverArtFileName = coverUpload.filename || "";
    }

    // Update the project record in Supabase
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        title,
        filename: masterFileName,
        coverart: coverArtFileName,
      })
      .eq("id", currentProject.id);

    if (updateError) {
      throw updateError;
    }
    // Refresh projects list after successful update.
    await fetchProjects();
  };

  const updateProjectSongData = async (songData: SongData) => {
    if (!session) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from("projects")
        .update({
          user_id: session.user.id,
          title: currentProject?.title,
          filename: currentProject?.filename,
          url: session.user.id,
          data: songData,
        })
        .eq("id", currentProject?.id);

      if (error) {
        throw error;
      }
      setProjectNeedSave(false);
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Error updating project.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    const folderPath = `${currentProject?.user_id}/${currentProject?.id}`;

    const { data: files, error: listError } = await supabase.storage
      .from("project_files")
      .list(folderPath, { limit: 100 });

    if (listError) {
      console.error("Error listing files in folder:", listError);
    }

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${folderPath}/${file.name}`);
      const { error: removeError } = await supabase.storage
        .from("project_files")
        .remove(filePaths);
      if (removeError) {
        console.error("Error deleting master files:", removeError);
      }
    }

    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", currentProject?.id);

    if (deleteError) {
      console.error("Error deleting project from database:", deleteError);
      return false;
    } else {
      console.log("Project deleted successfully.");
      setCurrentProject(null);
      fetchProjects();
      return true;
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Provide all values to the context consumers
  const contextValue: ProjectsContextProps = {
    projects,
    currentProject,
    loading,
    loadingMsg,
    projectNeedSave,
    fetchProjects,
    setCurrentProject,
    setProjectNeedSave,
    createProject,
    updateProject,
    updateProjectSongData,
    deleteProject,
  };

  return (
    <ProjectsContext.Provider value={contextValue}>
      {children}
    </ProjectsContext.Provider>
  );
};
