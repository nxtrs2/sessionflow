import React from "react";
import { User } from "lucide-react";

interface HeaderProps {
  isLoggedIn: boolean;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn }) => {
  return (
    <div className="app-header">
      <h1>Session Flow</h1>
      <div className="header-right">
        {isLoggedIn ? (
          <button className="user-icon" title="User Profile">
            <User size={18} />
          </button>
        ) : (
          <button className="sign-in-button">Sign In</button>
        )}
      </div>
    </div>
  );
};

export default Header;
