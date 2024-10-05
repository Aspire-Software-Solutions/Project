import React, { useState, useEffect } from "react"; // Import React
import { 
  getAuth, 
  getMultiFactorResolver, 
  PhoneAuthProvider, 
  RecaptchaVerifier, 
  signInWithEmailAndPassword,
  PhoneMultiFactorGenerator 
} from "firebase/auth"; // Import authentication suite of products
import { toast } from "react-toastify"; // App notifications
import { Form, Button, Container, Row, Col } from "react-bootstrap"; // Bootstrap 5 UI Framework
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap 5 CSS
import { displayError } from "../../utils"; // Errors (that will be displayed as a notification)
import useInput from "../../hooks/useInput"; // User input
import '../../styles/Login.css' // Specific Styles for Login.CSS

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
  const [sendCodeDisabled, setSendCodeDisabled] = useState(false);  // Added state hook for disabling the send button
  const [countdown, setCountdown] = useState(15);  // Added state hook for countdown

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear(); // Cleanup reCAPTCHA
      }
    };
  }, []);

  // Automatically send verification code once resolver is set
  useEffect(() => {
    if (resolver) {
      sendVerificationCode(resolver);
    }
  }, [resolver]);


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
        // Extract and store the multi-factor resolver properly
        const resolverInstance = getMultiFactorResolver(auth, error);
        setResolver(resolverInstance);  // Set resolver to the state
        toast.info("2FA required. Sending verification code.");
        sendVerificationCode(resolverInstance);  // Automatically send verification code if 2FA is required
      } 
      else {
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
      setSendCodeDisabled(true);
      setCountdown(15);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setSendCodeDisabled(false);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);

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
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
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
    <Container fluid className="d-flex align-items-center justify-content-center" id="overallContainer">
      <Row className="d-flex align-items-center justify-content-center">
        {/* Logo Column */}
        <Col xs={12} md={6} className="d-none d-sm-block d-flex justify-content-center align-items-center">
          <img src={companyLogo} className="col-md-8 col-lg-6" alt="Company Logo" />
        </Col>
  
        {/* Form Column */}
        <Col xs={12} md={6} id="verticalHexagon">
          <Form onSubmit={handleLogin}>
            <h2 className="text-center mb-4" style={{ fontSize: "3rem", fontWeight: "bold" }}>Log In</h2>
            
            {/* First factor: email and password */}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control className="customInput" type="email" placeholder="Enter email" value={email.value} onChange={email.onChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control className="customInput" type="password" placeholder="Enter password" value={password.value} onChange={password.onChange} />
            </Form.Group>
  
            <Button type="submit" className="w-100 btn loginButton">Sign In</Button>
  
            {/* reCAPTCHA container for 2FA */}
            <div id="recaptcha-container"></div>
  
            {/* Second factor authentication (2FA): send and verify SMS code */}
            {resolver && (
              <>
                <Button onClick={sendVerificationCode} className="mt-3" disabled={sendCodeDisabled}>
                  {sendCodeDisabled ? `Send Verification Code (${countdown}s)` : "Send Verification Code"}
                </Button>
                <Form.Group className="mt-3">
                  <Form.Label>Verification Code</Form.Label>
                  <Form.Control 
                    type="text"
                    placeholder="Enter the verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </Form.Group>
                <Button onClick={verifyCode} className="mt-3">Verify</Button>
              </>
            )}
  
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