import React, { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

interface RegisterProps {
  setShowRegister: React.Dispatch<React.SetStateAction<boolean>>;
}

const Register: React.FC<RegisterProps> = ({
  setShowRegister,
}: RegisterProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      console.log("User registered:", data.user);
    }

    setLoading(false);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div>
            <label>Email</label>
            <input
              autoComplete="false"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              autoComplete="false"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="button" onClick={() => setShowRegister(false)}>
            Cancel
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
