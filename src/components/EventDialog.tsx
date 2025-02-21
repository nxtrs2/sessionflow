import React, { useState, useEffect } from "react";
import { TickData, EventData, Instrument, Mode } from "../types";
import { Trash } from "lucide-react";

interface EventDialogProps {
  mode: Mode;
  tickData: TickData;
  eventData?: EventData; // for edit mode, the current event data
  instruments: Instrument[];
  handleInstrumentsUpdate: (
    instrument: Instrument,
    deleteInstrument: boolean
  ) => void;
  onConfirm: (data?: EventData) => void;
  onCancel: () => void;
}

const EventDialog: React.FC<EventDialogProps> = ({
  mode,
  tickData,
  eventData,
  instruments,
  handleInstrumentsUpdate,
  onConfirm,
  onCancel,
}) => {
  // Set initial form values (for new or edit modes)
  const [instrument, setInstrument] = useState<string>(
    eventData ? eventData.instrument : instruments[0]?.name || ""
  );
  const [message, setMessage] = useState<string>(
    eventData ? eventData.message : ""
  );
  const [countOut, setCountOut] = useState<number>(
    eventData ? eventData.countOut : 0
  );
  const [color, setColor] = useState<string>(
    instruments.length > 0 ? instruments[0].color || "#000000" : "#000000"
  );
  const [bgcolor, setBgColor] = useState<string>(
    instruments.length > 0 ? instruments[0].bgcolor || "#FFFFFF" : "#FFFFFF"
  );
  //   const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  // Reset form when eventData or mode changes
  useEffect(() => {
    if (eventData) {
      setInstrument(eventData.instrument);
      setMessage(eventData.message);
      setCountOut(eventData.countOut);
    } else {
      setInstrument(instruments[0]?.name || "");
      setMessage("");
      setCountOut(0);
    }
  }, [eventData, instruments, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create the event data object with the beat from tickData
    const newEvent: EventData = {
      beat: tickData.beatIndex,
      instrument,
      message,
      countOut,
    };
    onConfirm(newEvent);
  };

  const handleDelete = () => {
    // When delete is confirmed, call onConfirm with no event data.
    onConfirm();
  };

  const handleSetInstrument = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedInstrument = instruments.find(
      (inst) => inst.name === e.target.value
    );
    if (selectedInstrument) {
      setInstrument(selectedInstrument.name);
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
          name: newInstrument,
          color: color || "#000000",
          bgcolor: bgcolor || "#FFFFFF",
        };
        handleInstrumentsUpdate(newInst, false);
        setInstrument(newInstrument);
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
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>
          {mode === "new" && "Create New Event at beat " + tickData.beatIndex}
          {mode === "edit" && "Edit Event"}
          {mode === "delete" && "Delete Event"}
        </h2>
        {mode === "delete" ? (
          <div>
            <p>
              Are you sure you want to delete this event at beat{" "}
              {tickData.beatIndex}?
            </p>
            <div className="dialog-actions">
              <button onClick={handleDelete}>Yes, Delete</button>
              <button onClick={onCancel}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="event-form">
            <form onSubmit={handleSubmit}>
              <div className="instrument-row">
                <label>
                  Instrument:
                  <select
                    value={instrument}
                    onChange={(e) => handleSetInstrument(e)}
                  >
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
                    placeholder="Add new instrument"
                    onKeyDown={(e) => {
                      handleAddNewInstrument(e);
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
              </div>
              <div className="instrument-row">
                <div>
                  <label>Text Colour:</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      handleUpdateInstrument({
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
                        name: instrument,
                        color,
                        bgcolor: newColor,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="instrument-row">
                <label>Message:</label>
                <div>
                  <input
                    style={{ width: "100%" }}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter message"
                  />
                </div>
              </div>
              <div>
                <label>
                  Count-Out:
                  <input
                    style={{ width: "50px" }}
                    type="number"
                    value={countOut}
                    onChange={(e) => {
                      const value = Math.max(0, parseInt(e.target.value, 10));
                      setCountOut(value);
                    }}
                  />
                </label>
              </div>
              <div className="dialog-actions">
                <button type="button" onClick={onCancel}>
                  Cancel
                </button>{" "}
                <button disabled={message.trim() === ""} type="submit">
                  {mode === "new" ? "Create Event" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDialog;
