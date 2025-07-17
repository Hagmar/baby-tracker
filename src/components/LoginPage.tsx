import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [babyName, setBabyName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [error, setError] = useState("");
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        await register(
          username,
          password,
          babyName,
          dateOfBirth,
          invitationCode
        );
        // After successful registration, switch to login mode
        setIsRegistering(false);
        setError("");
        setPassword("");
      } else {
        await login(username, password);
        // If we get here, login was successful
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setUsername("");
    setPassword("");
    setBabyName("");
    setDateOfBirth("");
    setInvitationCode("");
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{isRegistering ? "Register" : "Login"}</h2>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {isRegistering && (
          <>
            <div className="form-group">
              <label htmlFor="babyName">Baby's Name</label>
              <input
                type="text"
                id="babyName"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Baby's Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="invitationCode">Invitation Code</label>
              <input
                type="text"
                id="invitationCode"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="button">
          {isRegistering ? "Register" : "Login"}
        </button>

        <div className="form-footer">
          <button type="button" onClick={toggleMode} className="link-button">
            {isRegistering
              ? "Already have an account? Login"
              : "Need an account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
