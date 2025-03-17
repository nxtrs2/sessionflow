import React, { useState } from "react";
// import { uploadMP3File, uploadCoverArt } from "../helpers/FileFunctions";
// import { SongData, UploadResponse } from "../types";
// import { supabase } from "../supabase/supabaseClient";
// import { useSession } from "../hooks/useSession";
import { useProjects } from "../hooks/useProjects";

interface NewProjectProps {
  openDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewProject: React.FC<NewProjectProps> = ({ openDialog }) => {
  // const { session } = useSession();
  const { createProject } = useProjects();
  const [title, setTitle] = useState("");
  const [tempo, setTempo] = useState(144);
  const [numerator, setNumerator] = useState(4);
  const [denominator, setDenominator] = useState(4);
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    if (!masterFile) {
      console.error("Master file is required");
      setUploading(false);
      return;
    }
    try {
      await createProject({
        title,
        masterFile,
        coverArt: coverArt || undefined,
        tempo,
        numerator,
        denominator,
      });
      openDialog(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
    setUploading(false);
  };

  // const handleFormSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setUploading(true);
  //   if (!masterFile) return;

  //   if (!session?.user.id) {
  //     console.error("User ID not found");
  //     return;
  //   }

  //   let coverArtUpload: UploadResponse = {
  //     success: false,
  //     filename: null,
  //     url: "",
  //     error: "",
  //   };

  //   const upload = await uploadMP3File(masterFile, title);

  //   if (coverArt) {
  //     coverArtUpload = await uploadCoverArt(coverArt, title);
  //     if (!coverArtUpload.success) {
  //       console.error("Error uploading cover art:", coverArtUpload.error);
  //       return;
  //     }
  //   }

  //   if (!upload.success) {
  //     console.error("Error uploading file:", upload.error);
  //     return;
  //   }

  //   const { filename } = upload;

  //   const songData: SongData = {
  //     project: {
  //       title,
  //       filename: filename || "",
  //       url: session.user.id,
  //       tempo,
  //       numerator,
  //       denominator,
  //       countIn: 0,
  //       skipBeatsBy: 0,
  //       skipBeats: 0,
  //       masterVolume: 40,
  //       masterPan: 0,
  //       masterMute: false,
  //       masterSolo: false,
  //     },
  //     notes: "",
  //     structure: [],
  //     instruments: [],
  //     timeline: [],
  //     markers: [],
  //   };

  //   const { error: insertError } = await supabase.from("projects").insert([
  //     {
  //       user_id: session.user.id,
  //       title,
  //       filename: filename,
  //       url: session.user.id,
  //       data: songData,
  //       coverart: coverArtUpload?.filename || null,
  //     },
  //   ]);

  //   if (insertError) {
  //     console.error("Error inserting record:", insertError);
  //   } else {
  //     // console.log("Record inserted successfully");
  //     fetchProjects();
  //     openDialog(false);
  //   }
  //   setUploading(false);
  // };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2 style={{ color: "white" }}>New Project</h2>
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
            <label>Tempo:</label>
            <input
              type="number"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label>Time Signature:</label>
            <select
              value={numerator}
              onChange={(e) => setNumerator(Number(e.target.value))}
              required
            >
              <option value={4}>4</option>
              <option value={3}>3</option>

              {/* Add more options as needed */}
            </select>
            <span>/</span>
            <select
              value={denominator}
              onChange={(e) => setDenominator(Number(e.target.value))}
              required
            >
              <option value={4}>4</option>
              <option value={8}>8</option>

              {/* Add more options as needed */}
            </select>
          </div>
          <div>
            <input
              type="file"
              accept=".mp3,audio/mpeg"
              onChange={(e) =>
                setMasterFile(e.target.files ? e.target.files[0] : null)
              }
              required
              style={{ display: "none" }}
              id="masterFileInput"
            />
            <button
              style={{
                fontSize: "0.9em",
              }}
              type="button"
              onClick={() =>
                document.getElementById("masterFileInput")?.click()
              }
            >
              Select Master Song
            </button>
            {masterFile && <span>{masterFile.name}</span>}
            {!masterFile && (
              <span style={{ color: "gray" }}>Required: Master Song</span>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setCoverArt(e.target.files ? e.target.files[0] : null)
              }
              style={{ display: "none" }}
              id="coverArtInput"
            />
            <button
              style={{
                fontSize: "0.9em",
              }}
              type="button"
              onClick={() => document.getElementById("coverArtInput")?.click()}
            >
              Select Cover Art
            </button>
            {coverArt && <span>{coverArt.name}</span>}
            {!coverArt && (
              <span style={{ color: "gray" }}>Optional: Select Cover Art</span>
            )}
          </div>
          <div className="dialog-actions">
            <button type="button" onClick={() => openDialog(false)}>
              Cancel
            </button>
            <button
              style={{
                opacity: !masterFile || !title ? 0.5 : 1,
                cursor: !masterFile || !title ? "not-allowed" : "pointer",
              }}
              disabled={!masterFile && !title}
              type="submit"
            >
              {uploading ? "Uploading..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProject;
