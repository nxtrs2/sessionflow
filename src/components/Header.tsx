import React from "react";
import { User } from "lucide-react";

import { useSession } from "../hooks/useSession";
interface HeaderProps {
  setShowUserProfile: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({
  setShowUserProfile,
  setShowLogin,
}) => {
  const { isLoggedIn } = useSession();
  return (
    <div className="app-header">
      <h1>Session Flow</h1>

      <div className="header-right">
        {isLoggedIn ? (
          <button
            className="user-icon"
            title="User Profile"
            onClick={() => setShowUserProfile(true)}
          >
            <User size={18} />
          </button>
        ) : (
          <button className="sign-in-button" onClick={() => setShowLogin(true)}>
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
