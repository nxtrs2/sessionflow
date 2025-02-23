import React, { useState } from "react";
import { Instrument } from "../types";
import { Trash } from "lucide-react";

interface SettingsProps {
  instruments: Instrument[];
  handleInstrumentsUpdate: (
    instrument: Instrument,
    deleteInstrument: boolean
  ) => void;
}

const Settings: React.FC<SettingsProps> = ({
  instruments,
  handleInstrumentsUpdate,
}) => {
  // Set initial form values (for new or edit modes)
  const [instrument, setInstrument] = useState<string>("");
  const [instId, setInstId] = useState<number | null>(null);
  const [newColor, setNewColor] = useState<string>("#000000");
  const [newBgColor, setNewBgColor] = useState<string>("#FFFFFF");
  const [color, setColor] = useState<string>(
    instruments.length > 0 ? instruments[0].color || "#000000" : "#000000"
  );
  const [bgcolor, setBgColor] = useState<string>(
    instruments.length > 0 ? instruments[0].bgcolor || "#FFFFFF" : "#FFFFFF"
  );
  //   const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  // Reset form when eventData or mode changes
  // useEffect(() => {
  //   if (eventData) {
  //     setInstrument(eventData.instrument);
  //     setMessage(eventData.message);
  //     setCountOut(eventData.countOut);
  //   } else {
  //     setInstrument(instruments[0]?.name || "");
  //     setMessage("");
  //     setCountOut(0);
  //   }
  // }, [eventData, instruments, mode]);

  const handleSetInstrument = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedInstrument = instruments.find(
      (inst) => inst.name === e.target.value
    );
    if (selectedInstrument) {
      setInstrument(selectedInstrument.name);
      setInstId(selectedInstrument.id);
      setColor(selectedInstrument.color);
      setBgColor(selectedInstrument.bgcolor);
    }
  };

  const handleUpdateInstrument = (newInstrument: Instrument) => {
    handleInstrumentsUpdate(newInstrument, false);
    setInstrument(newInstrument.name);
    setColor(newInstrument.color);
    setBgColor(newInstrument.bgcolor);
  };

  const handleAddNewInstrument = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const newInstrument = e.currentTarget.value.trim();
      if (newInstrument !== "") {
        const newInst: Instrument = {
          id: instruments.length,
          name: newInstrument,
          color: newColor || "#000000",
          bgcolor: newBgColor || "#FFFFFF",
        };
        handleInstrumentsUpdate(newInst, false);
        setInstrument(newInstrument);
        setColor(newColor);
        setBgColor(newBgColor);
        e.currentTarget.value = "";
      }
    }
  };

  const handleDeleteInstrument = () => {
    if (
      window.confirm(
        `This will erase all events for this instrument. \n"Are you sure you want to delete the instrument "${instrument}"?`
      )
    ) {
      const instrumentToDelete = instruments.find(
        (inst) => inst.name === instrument
      );
      if (instrumentToDelete) {
        handleInstrumentsUpdate(instrumentToDelete, true);
      }
    }
  };

  return (
    <div className="settings">
      <h2>Instruments</h2>

      <div className="settings-section">
        <div>
          <input
            type="text"
            placeholder="Add new instrument"
            onKeyDown={(e) => {
              handleAddNewInstrument(e);
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
            }}
          />
        </div>
        <div>
          <label>Back: </label>
          <input
            type="color"
            value={newBgColor}
            onChange={(e) => {
              const newColor = e.target.value;
              setNewBgColor(newColor);
            }}
          />
        </div>
      </div>
      <div className="settings-section">
        <label>
          Instrument:
          <select value={instrument} onChange={(e) => handleSetInstrument(e)}>
            {instruments.map((inst, idx) => (
              <option key={idx} value={inst.name}>
                {inst.name}
              </option>
            ))}
          </select>
        </label>
        <div>
          <input
            type="text"
            value={instrument}
            onChange={(e) => {
              const newName = e.target.value;
              setInstrument(newName);
              handleUpdateInstrument({
                id: instId || 0,
                name: newName,
                color,
                bgcolor,
              });
            }}
          />
        </div>
        <div>
          <button
            style={{ border: "none" }}
            disabled={instrument === ""}
            type="button"
            onClick={() => {
              handleDeleteInstrument();
            }}
          >
            <Trash size={18} style={{ color: "orange" }} />
          </button>
        </div>
        <div>
          <label>Text Colour:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              const newColor = e.target.value;
              handleUpdateInstrument({
                id: instId || 0,
                name: instrument,
                color: newColor,
                bgcolor,
              });
            }}
          />
        </div>
        <div>
          <label>Bg Colour:</label>
          <input
            type="color"
            value={bgcolor}
            onChange={(e) => {
              const newColor = e.target.value;
              handleUpdateInstrument({
                id: instId || 0,
                name: instrument,
                color,
                bgcolor: newColor,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
