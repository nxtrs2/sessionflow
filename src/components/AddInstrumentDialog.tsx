import React, { useState } from "react";
import { Instrument } from "../types";
import { uploadMP3File } from "../helpers/FileFunctions";
import { useProjects } from "../hooks/useProjects";

interface DialogProps {
  user_id?: string;
  instCount: number;
  handleUpdateInstrument: (newInstrument: Instrument) => void;
  handleUpdateProjectSongData: () => void;
  setShowAddInstrument: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddInstrumentDialog: React.FC<DialogProps> = ({
  user_id,
  instCount,
  handleUpdateInstrument,
  handleUpdateProjectSongData,
  setShowAddInstrument,
}) => {
  const { currentProject } = useProjects();
  const [newInst, setNewInst] = useState<Instrument>({
    id: instCount + 1,
    name: "",
    filename: "",
    url: "",
    color: "#000000",
    bgcolor: "#FFFFFF",
    volume: 0,
    pan: 0,
    mute: false,
    solo: false,
  });
  const [newColor, setNewColor] = useState<string>("#000000");
  const [newBgColor, setNewBgColor] = useState<string>("#FFFFFF");
  const [instName, setInstName] = useState<string>("");
  const [instFile, setInstFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    if (!instFile) {
      handleUpdateInstrument(newInst);
      setShowAddInstrument(false);
      return;
    }

    if (!user_id || !currentProject) {
      console.error("User ID not found");
      setUploading(false);
      return;
    }

    const uploadFile = await uploadMP3File(
      instFile,
      currentProject.id.toString()
    );

    if (!uploadFile.success) {
      console.error("Error uploading file:", uploadFile.error);
      setUploading(false);
      return;
    }

    const { filename } = uploadFile;

    if (!filename) {
      console.error("Filename not found");
      setUploading(false);
      return;
    }

    // console.log("File uploaded:", filename);

    handleUpdateInstrument({
      ...newInst,
      filename,
      url: user_id,
    });

    handleUpdateProjectSongData();
    setShowAddInstrument(false);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Add New Instrument</h2>
        {instFile && (
          <div className="media-player">
            <audio controls style={{ width: "100%" }}>
              <source src={URL.createObjectURL(instFile)} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
            {instFile.name}
          </div>
        )}
        <form onSubmit={handleFormSubmit}>
          <div className="settings-section">
            <div>
              <input
                type="text"
                value={instName}
                placeholder="Instrument Name"
                onChange={(e) => {
                  const newName = e.target.value;
                  setInstName(newName);
                  setNewInst({
                    ...newInst,
                    name: newName,
                  });
                }}
              />
            </div>
            <div>
              <label>Text: </label>
              <input
                type="color"
                value={newColor}
                onChange={(e) => {
                  const newColor = e.target.value;
                  setNewColor(newColor);
                  setNewInst({
                    ...newInst,
                    color: newColor,
                  });
                }}
              />
            </div>
            <div>
              <label>Bg: </label>
              <input
                type="color"
                value={newBgColor}
                onChange={(e) => {
                  const newColor = e.target.value;
                  setNewBgColor(newColor);
                  setNewInst({
                    ...newInst,
                    bgcolor: newColor,
                  });
                }}
              />
            </div>
            <div>
              <input
                type="file"
                accept=".mp3"
                style={{ display: "none" }}
                id="track-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setInstFile(file);
                  }
                }}
              />
              {!instFile ? (
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("track-upload")?.click();
                  }}
                >
                  Add Track
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setInstFile(null);
                  }}
                >
                  Remove Track
                </button>
              )}
            </div>
          </div>
          <div style={{ marginTop: "1em" }}>Track File is Optional</div>
          <div className="dialog-actions">
            {" "}
            <button type="button" onClick={() => setShowAddInstrument(false)}>
              Cancel
            </button>
            <button
              disabled={!instName}
              type="submit"
              style={{
                opacity: !instName ? 0.5 : 1,
                cursor: !instName ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "Uploading..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInstrumentDialog;
