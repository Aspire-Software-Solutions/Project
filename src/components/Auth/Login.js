import React, { useState, useEffect } from "react";
import { getAuth, getMultiFactorResolver, PhoneAuthProvider, RecaptchaVerifier, signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");  // User email for first factor auth
  const [password, setPassword] = useState("");  // User password for first factor auth
  const [code, setCode] = useState("");  // Verification code entered by user for 2FA
  const [verificationId, setVerificationId] = useState(null);  // Verification ID returned from Firebase after sending SMS
  const [resolver, setResolver] = useState(null);  // Firebase MFA resolver
  const [selectedIndex, setSelectedIndex] = useState(0);  // Index of the selected phone MFA method

  const auth = getAuth();  // Initialize Firebase auth instance

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();  // Cleanup the recaptcha verifier when the component is unmounted
      }
    };
  }, []);

  // Handle sign-in with email and password (first factor)
  const signInWithFirstFactor = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", userCredential);
      toast.success("First factor authentication successful!");
      // If successful, no MFA required.
    } catch (error) {
      if (error.code === 'auth/multi-factor-auth-required') {
        // User needs to complete multi-factor authentication (MFA)
        const resolver = getMultiFactorResolver(auth, error);
        console.log("Multi-factor resolver:", resolver);
        setResolver(resolver);  // Store resolver for MFA
        toast.info("Multi-factor authentication required. Sending verification code.");
      } else {
        console.error("Error during first factor authentication:", error);
        toast.error("Failed to authenticate. Please try again.");
      }
    }
  };

  // Send the MFA verification code (second factor)
  const sendVerificationCode = async () => {
    if (!resolver) {
      console.error("Multi-factor resolver is missing.");
      toast.error("Multi-factor resolver is missing.");
      return;
    }

    // Check if reCAPTCHA is already initialized or reinitialize it if necessary
    if (!window.recaptchaVerifier) {
      try {
        // Modify the RecaptchaVerifier initialization with auth as the first parameter
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,  // First parameter is auth
          'recaptcha-container',  // Second parameter is the recaptcha container ID
          {
            size: "invisible",
            callback: (response) => {
              console.log("reCAPTCHA solved.");
            },
            "expired-callback": () => {
              console.log("reCAPTCHA expired.");
            },
          }
        );
      } catch (error) {
        console.error("Error initializing reCAPTCHA:", error);
        toast.error("Failed to initialize reCAPTCHA.");
        return;
      }
    }

    try {
      const phoneInfoOptions = {
        multiFactorHint: resolver.hints[selectedIndex],  // Assuming single MFA method for now
        session: resolver.session
      };

      // Send SMS with verification code
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier);
      console.log("Verification code sent, verificationId:", verificationId);
      setVerificationId(verificationId);
      toast.success("SMS sent. Please enter the verification code.");

    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error("Failed to send SMS. Please try again.");
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();  // Reset reCAPTCHA
    }
  };

  // Verify the code and complete sign-in (second factor)
  const verifyCode = async () => {
    if (!verificationId || !resolver) {
      console.log("Verification ID or multi-factor resolver missing.");
      toast.error("Verification ID or multi-factor resolver missing.");
      return;
    }

    try {
      const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, code);
      console.log("Phone auth credential generated:", phoneAuthCredential);

      const userCredential = await resolver.resolveSignIn(phoneAuthCredential);
      console.log("Multi-factor authentication successful. User:", userCredential);
      toast.success("Multi-factor authentication successful!");

      // Redirect or move to the next part of your application here.
      // For example:
      // navigate("/dashboard"); // If using React Router or similar navigation.

    } catch (error) {
      console.error("Error verifying the code:", error);
      toast.error("Invalid verification code. Please try again.");
    }
  };

  return (
    <div>
      {/* First factor login: email and password */}
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />
      <button onClick={signInWithFirstFactor}>Sign In</button>

      {/* reCAPTCHA container for MFA */}
      <div id="recaptcha-container"></div>  {/* Ensure this container is rendered before initializing reCAPTCHA */}

      {/* Second factor (MFA): send and verify SMS code */}
      {resolver && (
        <>
          <button onClick={sendVerificationCode}>Send Verification Code</button>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the verification code"
          />
          <button onClick={verifyCode}>Verify</button>
        </>
      )}
    </div>
  );
};

export default Login;
