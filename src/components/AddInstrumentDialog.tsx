import React, { useState } from "react";
import { Instrument, Project } from "../types";

interface DialogProps {
  //   selectedInstrument: Instrument;
  project: Project;
  instCount: number;
  handleUpdateInstrument: (newInstrument: Instrument) => void;
  setAddInstrument: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddInstrumentDialog: React.FC<DialogProps> = ({
  // project,
  instCount,
  handleUpdateInstrument,
  setAddInstrument,
}) => {
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
  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Add New Instrument</h2>
        <form onSubmit={(e) => e.preventDefault()}>
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
                    // Handle file upload logic here
                    console.log(file);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  document.getElementById("track-upload")?.click();
                }}
              >
                Add Track
              </button>
            </div>
          </div>
          <div style={{ marginTop: "1em" }}>Track File is Optional</div>
          <div className="dialog-actions">
            {" "}
            <button type="button" onClick={() => setAddInstrument(false)}>
              Cancel
            </button>
            <button
              disabled={!instName}
              type="submit"
              onClick={() => {
                handleUpdateInstrument(newInst);
                setAddInstrument(false);
              }}
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInstrumentDialog;
