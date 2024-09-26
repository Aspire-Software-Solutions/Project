import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, getMultiFactorResolver } from "firebase/auth";
import { toast } from "react-toastify";

export default function Login({ setUser, setAuthAction }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Check if multi-factor authentication is required
      if (user.multiFactor.enrolledFactors.length > 0) {
        toast.info("Multi-factor authentication required. Sending SMS...");
        setUser(user);
        setAuthAction("2FA"); // Redirect to 2FA flow
      } else {
        // Normal login if no 2FA required
        toast.success("Logged in successfully!");
        setUser(user);
      }
    } catch (error) {
      if (error.code === "auth/multi-factor-auth-required") {
        const resolver = getMultiFactorResolver(auth, error);
        toast.info("Multi-factor authentication required. Please verify.");
        setUser(resolver);  // Store resolver for further MFA flow
        setAuthAction("2FA");
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
