import React, { useState } from "react";
import { useSession } from "../hooks/useSession";

interface RegisterProps {
  setShowRegister: React.Dispatch<React.SetStateAction<boolean>>;
}

const Register: React.FC<RegisterProps> = ({
  setShowRegister,
}: RegisterProps) => {
  const { signUp } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCheckEmail, setShowCheckEmail] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      console.log("User registered:", data?.user);
    }

    setLoading(false);
    setShowCheckEmail(true);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Register</h2>
        {showCheckEmail ? (
          <div>
            <p>
              Please check your email for a verification link to complete your
              registration.
            </p>
            <button onClick={() => setShowRegister(false)}>Close</button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Register;
