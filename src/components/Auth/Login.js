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
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ height: "100vh", backgroundColor: "#8B0000" }}>
      <Row>
        <Col md={6} className="text-center">
          <img src={companyLogo} alt="Company Logo" style={{ width: "550px" }} />
        </Col>
        <Col md={6}>
          <Form onSubmit={handleLogin} className="text-white">
            <h2 className="text-center mb-4" style={{ fontSize: "3rem", fontWeight: "bold" }}>Log In</h2>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                value={email.value} 
                onChange={email.onChange} 
                placeholder="Enter email" 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                value={password.value} 
                onChange={password.onChange} 
                placeholder="Enter password" 
              />
            </Form.Group>

            <Button type="submit" className="w-100" style={{ display: "none" }} aria-hidden="true"></Button>

            <div className="text-center mt-3">
              <span className="text-white" onClick={handleForgotPassword} style={{ cursor: "pointer" }}>
                Forgot Password?
              </span>
            </div>
            <div className="text-center mt-2">
              <span className="text-white" onClick={changeToSignup} style={{ cursor: "pointer" }}>
                Create New Account?
              </span>
            </div>
          </Form>

          {/* reCAPTCHA container for 2FA */}
          <div id="recaptcha-container"></div>

          {/* Second factor authentication (2FA): send and verify SMS code */}
          {resolver && (
            <>
              <Button className="mt-4" onClick={sendVerificationCode}>
                Send Verification Code
              </Button>
              <Form.Group className="mt-3">
                <Form.Label>Verification Code</Form.Label>
                <Form.Control 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  placeholder="Enter verification code"
                />
              </Form.Group>
              <Button className="mt-3" onClick={verifyCode}>
                Verify
              </Button>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};
