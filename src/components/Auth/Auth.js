import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

const Auth = () => {
  const [authAction, setAuthAction] = useState("LOGIN");
  const [user, setUser] = useState(null);  // Hold the user info for 2FA

  const changeToLogin = () => setAuthAction("LOGIN");
  const changeToSignup = () => setAuthAction("SIGNUP");

  return (
    <>
      {authAction === "LOGIN" ? (
        <Login changeToSignup={changeToSignup} setUser={setUser} setAuthAction={setAuthAction} />
      ) : authAction === "SIGNUP" ? (
        <Signup changeToLogin={changeToLogin} setUser={setUser} />
      ) : (
        <TwoFactorAuth user={user} />
      )}
    </>
  );
};

export default Auth;
