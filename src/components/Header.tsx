import React, { useState } from "react";
import { User } from "lucide-react";
import Login from "./Login";

interface HeaderProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <div className="app-header">
      {showLogin && !isLoggedIn && <Login setIsLoggedIn={setIsLoggedIn} />}
      <h1>Session Flow</h1>
      <div className="header-right">
        {isLoggedIn ? (
          <button className="user-icon" title="User Profile">
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
