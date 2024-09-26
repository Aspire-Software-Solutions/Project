import React, { useState } from "react";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, multiFactor } from "firebase/auth";
import { toast } from "react-toastify";

const TwoFactorAuth = ({ user }) => {
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const auth = getAuth();

  // Setup RecaptchaVerifier for SMS
  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          // Proceed after recaptcha is solved
          console.log("Recaptcha Solved");
        },
      },
      auth
    );
  };

  // Send verification SMS to user’s phone number
  const sendVerificationCode = async () => {
    const phoneNumber = user.phoneNumber;

    setupRecaptcha();  // Initialize reCAPTCHA
    const recaptchaVerifier = window.recaptchaVerifier;

    try {
      const multiFactorSession = await multiFactor(user).getSession(); // Get session for MFA
      const phoneInfoOptions = {
        phoneNumber: phoneNumber,
        session: multiFactorSession,
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
      setVerificationId(verificationId);
      toast.success("SMS sent successfully");
    } catch (error) {
      console.error("Error sending SMS: ", error);
      toast.error("Failed to send SMS. Please try again.");
    }
  };

  // Verify the code entered by the user
  const verifyCode = async () => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
      await multiFactor(user).enroll(multiFactorAssertion, "My personal phone number");
      toast.success("Phone number verified!");
    } catch (error) {
      console.error("Error verifying code: ", error);
      toast.error("Verification failed. Please try again.");
    }
  };

  return (
    <div>
      <div id="recaptcha-container"></div>
      <button onClick={sendVerificationCode}>Send Verification Code</button>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter the code"
      />
      <button onClick={verifyCode}>Verify</button>
    </div>
  );
};

export default TwoFactorAuth;