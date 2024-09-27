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
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { displayError } from "../../utils";
import 'bootstrap/dist/css/bootstrap.min.css';

// Adjust the path if necessary
const companyLogo = "/companyLogo.png";

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
  <Container fluid className="d-flex align-items-center justify-content-center" style={{ height: "100vh", backgroundColor: "#5F0000" }}>
      <Row className="align-items-center" style={{ width: "100%" }}>
        {/* Logo Column */}
        <Col xs={6} md={6} className="text-center">
          {/* Remove the image since it's causing an issue */}
          <h1 className="text-white">RIVAL</h1>
        </Col>

        {/* Form Column */}
        <Col xs={6} md={6} className="text-white">
          <Form onSubmit={handleLogin}>
            <h2 className="text-center mb-4" style={{ fontSize: "3rem", fontWeight: "bold" }}>Log In</h2>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Enter email" value={email.value} onChange={email.onChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Enter password" value={password.value} onChange={password.onChange} />
            </Form.Group>

            <Button type="submit" className="w-100 btn btn-primary" style={{ display: "none" }} aria-hidden="true"></Button>

            <div className="text-center mt-3">
              <span className="text-white" style={{ cursor: "pointer" }} onClick={handleForgotPassword}>Forgot Password?</span>
            </div>
            <div className="text-center mt-2">
              <span className="text-white" style={{ cursor: "pointer" }} onClick={changeToSignup}>Create New Account?</span>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
