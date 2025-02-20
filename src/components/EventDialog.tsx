import React, { useState, useEffect } from "react";
import { TickData, EventData, Instrument, Mode } from "../types";
import { Delete, Trash } from "lucide-react";

interface EventDialogProps {
  mode: Mode;
  tickData: TickData;
  eventData?: EventData; // for edit mode, the current event data
  instruments: Instrument[];
  setInstruments: (instruments: Instrument[]) => void;
  onConfirm: (data?: EventData) => void;
  onCancel: () => void;
}

const EventDialog: React.FC<EventDialogProps> = ({
  mode,
  tickData,
  eventData,
  instruments,
  setInstruments,
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

  const handleAddNewInstrument = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      setInstruments([...instruments, { name: e.currentTarget.value.trim() }]);
      setInstrument(e.currentTarget.value.trim());
      e.currentTarget.value = "";
      e.preventDefault();
    }
  };

  const handleDeleteInstrument = () => {
    if (
      window.confirm(
        `This will erase all events for this instrument. \n"Are you sure you want to delete the instrument "${instrument}"?`
      )
    ) {
      setInstruments(instruments.filter((inst) => inst.name !== instrument));
      setInstrument(instruments[0]?.name || "");
    }
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
          <div className="event-form">
            <form onSubmit={handleSubmit}>
              <div>
                <label>
                  Beat: <strong>{tickData.beatIndex}</strong>
                </label>
              </div>
              <div className="instrument-row">
                <label>
                  Instrument:
                  <select
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                  >
                    <option value="">None</option>
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
                    type="button"
                    onClick={() => {
                      handleDeleteInstrument();
                    }}
                  >
                    <Trash size={15} />
                  </button>
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
                <button type="submit">
                  {mode === "new" ? "Create Event" : "Save Changes"}
                </button>
                <button type="button" onClick={onCancel}>
                  Cancel
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
