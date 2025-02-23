import React, { useState, useEffect } from "react";
import { TickData, EventData, Instrument, Mode } from "../types";

interface EventDialogProps {
  mode: Mode;
  tickData: TickData;
  eventData?: EventData; // for edit mode, the current event data
  instruments: Instrument[];
  setSongTimeLines: React.Dispatch<React.SetStateAction<EventData[]>>;
  setShowEventDialog: (show: boolean) => void;
}

const EventDialog: React.FC<EventDialogProps> = ({
  mode,
  tickData,
  eventData,
  instruments,
  setSongTimeLines,
  setShowEventDialog,
}) => {
  // Set initial form values (for new or edit modes)
  const [instrument, setInstrument] = useState<string>(
    eventData ? eventData.instrument : instruments[0]?.name || ""
  );
  const [instId, setInstId] = useState<number | null>(
    eventData ? eventData.instrumentId : null
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
      setInstId(eventData.instrumentId);
      setMessage(eventData.message);
      setCountOut(eventData.countOut);
    } else {
      setInstrument(instruments[0]?.name || "");
      setMessage("");
      setCountOut(0);
    }
  }, [eventData, instruments, mode]);

  useEffect(() => {
    if (instruments.length > 0) {
      setInstId(instruments[0].id);
    }

    return () => {
      setInstId(null);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create the event data object with the beat from tickData
    const newEvent: EventData = {
      beat: tickData.beatIndex,
      instrument,
      instrumentId:
        instId === null
          ? instruments.find((inst) => inst.name === instrument)?.id || null
          : instId,
      message,
      countOut,
    };
    if (!newEvent) {
      return;
    }
    setSongTimeLines((prevTimeLines) => [...prevTimeLines, newEvent]);
    // setSongTimeLines([...songTimeLines, newEvent]);

    setShowEventDialog(false);

    // onConfirm(newEvent);
  };

  const handleDelete = () => {
    // When delete is confirmed, call onConfirm with no event data.
    // onConfirm();
  };

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
              <button onClick={() => setShowEventDialog(true)}>Cancel</button>
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
                  <p
                    style={{
                      fontFamily: "Roboto",
                      fontWeight: "bold",
                      marginLeft: "1em",
                      color: color,
                      backgroundColor: bgcolor,
                      padding: "0.2em",
                    }}
                  >
                    SAMPLE TEXT
                  </p>
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
                <button type="button" onClick={() => setShowEventDialog(false)}>
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
