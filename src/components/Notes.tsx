import React from "react";
interface ProfileProps {
  closeDialog: () => void;
  notes: string;
}

const Notes: React.FC<ProfileProps> = ({ closeDialog, notes }) => {
  return (
    <div className="dialog-overlay">
      <div className="dialog" style={{ width: "80vw", maxWidth: "600px" }}>
        <h1>Project Notes</h1>
        {/* <ChangePassword username={username} /> */}
        <div>
          <p>{notes}</p>
        </div>
        <div className="dialog-actions">
          <button
            style={{
              fontSize: "1em",
            }}
            type="button"
            onClick={() => closeDialog()}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notes;
