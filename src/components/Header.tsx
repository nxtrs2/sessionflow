import React, { useState } from "react";
import { LogOut } from "lucide-react";
import Login from "./Login";
import Register from "./Register";
import { supabase } from "../supabase/supabaseClient"; // Adjust the import path as necessary

interface HeaderProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsLoggedIn(false);
    } else {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="app-header">
      {showLogin && !isLoggedIn && (
        <Login
          setIsLoggedIn={setIsLoggedIn}
          setShowLogin={setShowLogin}
          setShowRegister={setShowRegister}
        />
      )}
      {showRegister && !isLoggedIn && (
        <Register setShowRegister={setShowRegister} />
      )}
      <h1>Session Flow</h1>
      <div className="header-right">
        {isLoggedIn ? (
          <button
            className="user-icon"
            title="User Profile"
            onClick={handleLogout}
          >
            <LogOut size={18} />
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
