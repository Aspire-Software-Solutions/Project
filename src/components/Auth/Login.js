import React, { useState, useEffect } from "react";
import { 
  getAuth, 
  getMultiFactorResolver, 
  PhoneAuthProvider, 
  RecaptchaVerifier, 
  signInWithEmailAndPassword,
  PhoneMultiFactorGenerator 
} from "firebase/auth"; // Import what we need from Firebase for the Authentication process (login and 2FA SMS)
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState(""); // First factor: email
  const [password, setPassword] = useState(""); // First factor: password
  const [code, setCode] = useState(""); // Verification code for 2FA
  const [verificationId, setVerificationId] = useState(null); // For storing verification ID
  const [resolver, setResolver] = useState(null); // Multi-factor resolver
  const [selectedIndex, setSelectedIndex] = useState(0); // Index of selected 2FA method

  const auth = getAuth(); // Initialize Firebase auth instance

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear(); // Cleanup reCAPTCHA
      }
    };
  }, []);

  // First factor authentication (email/password)
  const signInWithFirstFactor = async () => {
    try {
      // User inputs email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", userCredential);
      toast.success("First factor authentication successful!");

      // If they have 2FA with SMS, they must continue onto the next step of verification
    } catch (error) {
      if (error.code === "auth/multi-factor-auth-required") {

        // Multi-factor authentication required (2FA)
        const resolver = getMultiFactorResolver(auth, error);
        console.log("Multi-factor resolver:", resolver);
        setResolver(resolver);
        toast.info("2FA required. Sending verification code.");

       // SEND THEM HERE if they could not login AND they didn't have 2FA (aka they didn't input their password or email) 
      } else {
        console.error("Error during first factor authentication:", error);
        toast.error("Failed to authenticate. Please try again.");
      }
    }
  };

  // Send the 2FA verification code (SMS)
  const sendVerificationCode = async () => {
    if (!resolver) {
      console.error("Multi-factor resolver is missing.");
      toast.error("Multi-factor resolver is missing.");
      return;
    }

    // Initialize reCAPTCHA if not already initialized
    if (!window.recaptchaVerifier) {
      try {
        // Initialize reCAPTCHA with `auth` as the first argument
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth, // First parameter is auth
          "recaptcha-container", // Second parameter is the recaptcha container ID
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
        await window.recaptchaVerifier.render(); // Ensure it's rendered
      } catch (error) {
        console.error("Error initializing reCAPTCHA:", error);
        toast.error("Failed to initialize reCAPTCHA.");
        return;
      }
    }

    try {
      const phoneInfoOptions = {
        multiFactorHint: resolver.hints[selectedIndex], // Selected phone method
        session: resolver.session, // Multi-factor session from the resolver
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier);
      setVerificationId(verificationId); // Save verification ID
      toast.success("Verification code sent to your phone.");
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Failed to send verification code. Please try again.");
      window.recaptchaVerifier.clear(); // Reset reCAPTCHA on failure
    }
  };

  // Verify the SMS code entered by the user
  const verifyCode = async () => {
    if (!verificationId || !resolver) {
      console.error("Verification ID or resolver missing.");
      toast.error("Verification ID or resolver missing.");
      return;
    }

    try {
      // Create a PhoneAuthCredential
      const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, code);

      // Create a MultiFactorAssertion
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);

      // Complete sign-in with multi-factor assertion
      const userCredential = await resolver.resolveSignIn(multiFactorAssertion);
      console.log("2FA authentication successful. User:", userCredential);

      // Store user token and details in localStorage
      const { user } = userCredential;
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect after successful authentication
      toast.success("Successfully logged in with 2FA!");

    } catch (error) {
      console.error("Error verifying the code:", error);
      toast.error("Invalid verification code. Please try again.");
    }
  };

  return (
    <div>
      {/* First factor authentication: email and password */}
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

      {/* reCAPTCHA container for 2FA */}
      <div id="recaptcha-container"></div>

      {/* Second factor authentication (2FA): send and verify SMS code */}
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
