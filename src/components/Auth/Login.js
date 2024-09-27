import React, { useState, useEffect } from "react";
import { 
  getAuth, 
  getMultiFactorResolver, 
  PhoneAuthProvider, 
  RecaptchaVerifier, 
  signInWithEmailAndPassword,
  PhoneMultiFactorGenerator 
} from "firebase/auth";
import { toast } from "react-toastify";
import useInput from "../../hooks/useInput";
import Input from "../Input";
import Form from "../../styles/Form";
import { displayError } from "../../utils";
import styled from "styled-components";

const companyLogo = "/companyLogo.png"; // Update the path if necessary

// Styled Components
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${(props) => props.theme.background || "#8B0000"};
`;

const LogoContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 15%; /* Adjust as needed */
  transform: translateY(-50%);
`;

const StyledLogo = styled.img`
  width: 550px; /* Adjust size as needed */
  height: auto;
`;

const Title = styled.h2`
  color: ${(props) => props.theme.titleColor || "#FFFFFF"};
  margin-bottom: 1rem;
  font-size: 3rem;
  font-weight: bold;
`;

const LinksContainer = styled.div`
  margin-top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ClickableSpan = styled.span`
  color: ${(props) => props.theme.linkColor || "#FFFFFF"};
  cursor: pointer;
  margin: 0.5rem 0;

  &:hover {
    color: ${(props) => props.theme.linkHoverColor || "#FF4500"};
  }
`;

export default ({ changeToSignup }) => {
  const email = useInput("");
  const password = useInput("");
  const auth = getAuth();
  
  const [code, setCode] = useState(""); // Verification code for 2FA
  const [verificationId, setVerificationId] = useState(null); // For storing verification ID
  const [resolver, setResolver] = useState(null); // Multi-factor resolver
  const [selectedIndex, setSelectedIndex] = useState(0); // Index of selected 2FA method

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear(); // Cleanup reCAPTCHA
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.value || !password.value) {
      return toast.error("Please fill in all fields.");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
      const { user } = userCredential;
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("You are logged in.");
    } catch (error) {
      if (error.code === "auth/multi-factor-auth-required") {
        const resolver = getMultiFactorResolver(auth, error);
        setResolver(resolver);
        toast.info("2FA required. Sending verification code.");
      } else {
        return displayError(error);
      }
    }
  };

  // Send the 2FA verification code (SMS)
  const sendVerificationCode = async () => {
    if (!resolver) {
      toast.error("Multi-factor resolver is missing.");
      return;
    }

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container", 
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
    }

    try {
      const phoneInfoOptions = {
        multiFactorHint: resolver.hints[selectedIndex], 
        session: resolver.session, 
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier);
      setVerificationId(verificationId);
      toast.success("Verification code sent to your phone.");
    } catch (error) {
      toast.error("Failed to send verification code. Please try again.");
      window.recaptchaVerifier.clear();
    }
  };

  // Verify the SMS code entered by the user
  const verifyCode = async () => {
    if (!verificationId || !resolver) {
      toast.error("Verification ID or resolver missing.");
      return;
    }

    try {
      const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, code);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      const userCredential = await resolver.resolveSignIn(multiFactorAssertion);

      const { user } = userCredential;
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Successfully logged in with 2FA!");
    } catch (error) {
      toast.error("Invalid verification code. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    toast.info("Redirecting to password reset page...");
  };

  return (
    <Container>
      <LogoContainer>
        <StyledLogo src={companyLogo} alt="Company Logo" />
      </LogoContainer>
      <Form center onSubmit={handleLogin}>
        <Title>Log In</Title>
        <Input
          text="Email"
          type="email"
          value={email.value}
          onChange={email.onChange}
        />
        <Input
          text="Password"
          type="password"
          value={password.value}
          onChange={password.onChange}
        />
        <button type="submit" style={{ display: "none" }} aria-hidden="true"></button>

        <LinksContainer>
          <ClickableSpan onClick={handleForgotPassword}>
            Forgot Password?
          </ClickableSpan>
          <ClickableSpan onClick={changeToSignup}>
            Create New Account?
          </ClickableSpan>
        </LinksContainer>
      </Form>

      {/* reCAPTCHA container for 2FA */}
      <div id="recaptcha-container"></div>

      {/* Second factor authentication (2FA): send and verify SMS code */}
      {resolver && (
        <>
          <button onClick={sendVerificationCode}>Send Verification Code</button>
          <Input
            text="Verification Code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={verifyCode}>Verify</button>
        </>
      )}
    </Container>
  );
};
