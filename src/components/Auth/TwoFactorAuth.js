import React, { useState, useEffect } from "react";
import { getAuth, RecaptchaVerifier, PhoneAuthProvider } from "firebase/auth";
import { toast } from "react-toastify";
import { auth} from "../../index";

const TwoFactorAuth = ({ user }) => {
  const [code, setCode] = useState(""); // Code entered by the user
  const [verificationId, setVerificationId] = useState(null); // Holds the verification ID for 2FA
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false); // Track recaptcha verification
  const auth = getAuth(); // Initialize Firebase authentication

  useEffect(() => {
    // Cleanup Recaptcha when the component unmounts
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  // Send verification SMS to user’s phone number via resolver
  const sendVerificationCode = async () => {
    if (!user || !user.resolver) {
      toast.error("Multi-factor authentication resolver is missing.");
      return;
    }
  
    try {
      const recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            setIsRecaptchaVerified(true);
            console.log("Recaptcha solved");
          },
        },
        auth  // Use the initialized auth instance from index.js
      );
  
      const phoneInfoOptions = user.resolver.hints[0];
  
      const confirmationResult = await user.resolver.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifier
      );
  
      setVerificationId(confirmationResult.verificationId);
      toast.success("SMS sent successfully. Please enter the code.");
    } catch (error) {
      console.error("Error sending SMS: ", error);
      toast.error("Failed to send SMS. Please try again.");
    }
  };

  // Verify the code entered by the user
  const verifyCode = async () => {
    if (!verificationId || !user.resolver) {
      toast.error("Please send the verification code first.");
      return;
    }

    try {
      const phoneAuthCredential = PhoneAuthProvider.credential(
        verificationId,
        code
      );

      // Resolve the multi-factor sign-in using the resolver
      const userCredential = await user.resolver.resolveSignIn(phoneAuthCredential);
      toast.success("Multi-factor authentication successful!");

      console.log("User authenticated", userCredential);
    } catch (error) {
      console.error("Error verifying the code: ", error);
      toast.error("Invalid verification code. Please try again.");
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
        placeholder="Enter the verification code"
      />
      <button onClick={verifyCode}>Verify</button>
    </div>
  );
};

export default TwoFactorAuth;
