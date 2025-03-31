import React, { useState } from "react";

import { useSession } from "../hooks/useSession";

interface LoginProps {
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRegister: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login: React.FC<LoginProps> = ({
  setShowLogin,
  setShowRegister,
}: LoginProps) => {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      setError(null);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <button
              style={{
                fontSize: "1em",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
              type="button"
              onClick={() => {
                setShowLogin(false);
                setShowRegister(true);
              }}
            >
              Create an Account
            </button>
          </div>
          {error && <p>{error}</p>}
          <button
            type="button"
            onClick={() => {
              setShowLogin(false);
            }}
          >
            Cancel
          </button>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
