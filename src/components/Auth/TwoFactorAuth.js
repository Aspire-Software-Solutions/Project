import React, { useState, useEffect } from "react";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider } from "firebase/auth";
import { toast } from "react-toastify";

const TwoFactorAuth = ({ user }) => {
  const [code, setCode] = useState("");  // Code entered by the user
  const [verificationId, setVerificationId] = useState(null);  // Holds the verification ID for 2FA
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);  // Track recaptcha verification
  const auth = getAuth();  // Initialize Firebase authentication

  useEffect(() => {
    // Cleanup Recaptcha when the component unmounts
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  // Send verification SMS to user’s phone number
  const sendVerificationCode = async () => {
    if (!user || !user.phoneNumber) {
      toast.error("Phone number is missing for this user.");
      return;
    }

    // Setup RecaptchaVerifier
    const recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {
      size: "invisible",
      callback: () => {
        setIsRecaptchaVerified(true);  // Mark Recaptcha as solved
        console.log("Recaptcha solved");
      },
    }, auth);

    try {
      // Send the SMS with Recaptcha solved
      const confirmationResult = await signInWithPhoneNumber(auth, user.phoneNumber, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);  // Store verificationId to be used in verifyCode
      toast.success("SMS sent successfully. Please enter the code.");
    } catch (error) {
      console.error("Error sending SMS: ", error);
      toast.error("Failed to send SMS. Please try again.");
    }
  };

  // Verify the code entered by the user
  const verifyCode = async () => {
    if (!verificationId) {
      toast.error("Please send the verification code first.");
      return;
    }

    if (!code) {
      toast.error("Please enter the code.");
      return;
    }

    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);  // Generate the credential from the code
      if (auth.currentUser) {
        await auth.currentUser.linkWithCredential(credential);  // Link the phone number to the signed-in user
        toast.success("Phone number verified and linked to your account!");
      } else {
        toast.error("No user is currently signed in.");
      }
    } catch (error) {
      console.error("Error verifying code: ", error);
      toast.error("Verification failed. Please try again.");
    }
  };

  return (
    <div>
      {/* Recaptcha container (invisible but required for Recaptcha validation) */}
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