import React, { useState } from "react";
import { PhoneAuthProvider, PhoneMultiFactorGenerator } from "firebase/auth";

export default function MultiFactorLogin({ resolver, setUser }) {
  const [verificationCode, setVerificationCode] = useState("");

  const handleVerification = async () => {
    const phoneFactor = resolver.hints[0];  // Assuming first factor is phone
    const phoneAuthProvider = new PhoneAuthProvider();
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      {
        multiFactorHint: phoneFactor,
        session: resolver.session,
      },
      window.recaptchaVerifier
    );

    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const assertion = PhoneMultiFactorGenerator.assertion(cred);

    const userCredential = await resolver.resolveSignIn(assertion);
    setUser(userCredential.user);  // Successful 2FA login
  };

  return (
    <div>
      <input
        type="text"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        placeholder="Enter verification code"
      />
      <button onClick={handleVerification}>Verify</button>
    </div>
  );
}
