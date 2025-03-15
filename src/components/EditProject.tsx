import React, { useState } from "react";
import { uploadMP3File, uploadCoverArt } from "../helpers/FileFunctions";
import { supabase } from "../supabase/supabaseClient";
import { useSession } from "../hooks/useSession";

interface EditProjectProps {
  project: {
    id: string;
    title: string;
    filename: string; // Existing master file name
    coverart: string | null; // Existing cover art filename (if any)
  };
  openDialog: React.Dispatch<React.SetStateAction<boolean>>;
  fetchProjects: () => void;
}

const EditProject: React.FC<EditProjectProps> = ({
  project,
  openDialog,
  fetchProjects,
}) => {
  const { session } = useSession();
  const [title, setTitle] = useState(project.title);
  const [newMasterFile, setNewMasterFile] = useState<File | null>(null);
  const [newCoverArt, setNewCoverArt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    if (!session?.user.id) {
      console.error("User ID not found");
      setUploading(false);
      return;
    }

    let masterFileName = project.filename;
    let coverArtFileName = project.coverart;

    // If a new master file was provided, delete the old file and upload the new one.
    if (newMasterFile) {
      // Delete the old master file from Supabase storage.
      const { error: deleteMasterError } = await supabase.storage
        .from("master-files") // adjust bucket name as needed
        .remove([project.filename]);

      if (deleteMasterError) {
        console.error("Error deleting old master file:", deleteMasterError);
        // You might choose to proceed or alert the user depending on your needs.
      }

      // Upload the new master file.
      const upload = await uploadMP3File(newMasterFile, title);
      if (!upload.success) {
        console.error("Error uploading new master file:", upload.error);
        setUploading(false);
        return;
      }
      masterFileName = upload.filename || "";
    }

    // If a new cover art file was provided, delete the old one (if any) and upload the new one.
    if (newCoverArt) {
      if (project.coverart) {
        const { error: deleteCoverError } = await supabase.storage
          .from("cover-art") // adjust bucket name as needed
          .remove([project.coverart]);
        if (deleteCoverError) {
          console.error("Error deleting old cover art file:", deleteCoverError);
          // Decide if you need to proceed or not
        }
      }
      const coverUpload = await uploadCoverArt(newCoverArt, title);
      if (!coverUpload.success) {
        console.error("Error uploading new cover art:", coverUpload.error);
        setUploading(false);
        return;
      }
      coverArtFileName = coverUpload.filename || null;
    }

    // Update the projects table with the new title and file names.
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        title,
        filename: masterFileName,
        coverart: coverArtFileName,
      })
      .eq("id", project.id);

    if (updateError) {
      console.error("Error updating project:", updateError);
    } else {
      fetchProjects();
      openDialog(false);
    }
    setUploading(false);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2 style={{ color: "white" }}>Edit Project</h2>
        <form onSubmit={handleFormSubmit}>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="file"
              accept=".mp3,audio/mpeg"
              onChange={(e) =>
                setNewMasterFile(e.target.files ? e.target.files[0] : null)
              }
              style={{ display: "none" }}
              id="newMasterFileInput"
            />
            <button
              type="button"
              onClick={() =>
                document.getElementById("newMasterFileInput")?.click()
              }
              style={{ fontSize: "0.9em" }}
            >
              Select New Master Song
            </button>
            {newMasterFile ? (
              <span>{newMasterFile.name}</span>
            ) : (
              <span style={{ color: "gray" }}>
                Keeping existing master file: {project.filename}
              </span>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewCoverArt(e.target.files ? e.target.files[0] : null)
              }
              style={{ display: "none" }}
              id="newCoverArtInput"
            />
            <button
              type="button"
              onClick={() =>
                document.getElementById("newCoverArtInput")?.click()
              }
              style={{ fontSize: "0.9em" }}
            >
              Select New Cover Art
            </button>
            {newCoverArt ? (
              <span>{newCoverArt.name}</span>
            ) : (
              <span style={{ color: "gray" }}>
                {project.coverart
                  ? `Keeping existing cover art: ${project.coverart}`
                  : "No cover art currently"}
              </span>
            )}
          </div>
          <div className="dialog-actions">
            <button type="button" onClick={() => openDialog(false)}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{
                opacity: uploading ? 0.5 : 1,
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "Updating..." : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;
