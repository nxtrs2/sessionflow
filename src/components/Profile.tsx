import React from "react";
import { useSession } from "../hooks/useSession";

interface ProfileProps {
  closeDialog: () => void;
}

const Profile: React.FC<ProfileProps> = ({ closeDialog }) => {
  const { signOut } = useSession();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      closeDialog();
    } else {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h1>Logout?</h1>
        {/* <ChangePassword username={username} /> */}
        <div>
          <button
            style={{
              fontSize: "1em",
            }}
            type="button"
            onClick={() => closeDialog()}
          >
            No
          </button>
          <button
            style={{
              fontSize: "1em",
            }}
            onClick={handleLogout}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
