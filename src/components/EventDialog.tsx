import React, { useState, useEffect } from "react";
import { TickData, EventData, Instrument, Mode } from "../types";

interface EventDialogProps {
  mode: Mode;
  tickData: TickData;
  eventData?: EventData; // for edit mode, the current event data
  instruments: Instrument[];
  onConfirm: (data?: EventData) => void;
  onCancel: () => void;
}

const EventDialog: React.FC<EventDialogProps> = ({
  mode,
  tickData,
  eventData,
  instruments,
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

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>
          {mode === "new" && "Create New Event"}
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
          <form onSubmit={handleSubmit}>
            <div>
              <label>
                Beat: <strong>{tickData.beatIndex}</strong>
              </label>
            </div>
            <div>
              <label>
                Instrument:
                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                >
                  {instruments.map((inst, idx) => (
                    <option key={idx} value={inst.name}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label>
                Message:
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message"
                />
              </label>
            </div>
            <div>
              <label>
                Count-Out:
                <input
                  type="number"
                  value={countOut}
                  onChange={(e) => setCountOut(parseInt(e.target.value, 10))}
                />
              </label>
            </div>
            <div className="dialog-actions">
              <button type="submit">
                {mode === "new" ? "Create Event" : "Save Changes"}
              </button>
              <button type="button" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EventDialog;
