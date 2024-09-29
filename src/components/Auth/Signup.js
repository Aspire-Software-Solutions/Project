import React, { useState } from "react";
import { toast } from "react-toastify";
import PhoneInput from 'react-phone-input-2'; // Import Phone Input
import 'react-phone-input-2/lib/style.css'; // Import Phone Input CSS
import { Form, Button, Container, Row, Col } from "react-bootstrap"; // Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap 5 CSS
import '../../styles/Login.css'
import { displayError } from "../../utils";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  PhoneAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default ({ changeToLogin }) => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(""); // Verification code input

  const auth = getAuth();
  const db = getFirestore();

  const [verificationId, setVerificationId] = useState(null);
  const [isCodeSent, setIsCodeSent] = useState(false);

  // Send SMS Verification Code
  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      return toast.error("Please enter your phone number.");
    }

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth, // Firebase Auth instance should be passed first
        "recaptcha-container", // Container ID
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA solved.");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired.");
          },
        }
      );
    }    

    try {
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        `+${phoneNumber}`,
        window.recaptchaVerifier
      );
      setVerificationId(verificationId);
      setIsCodeSent(true);
      toast.success("Verification code sent to your phone.");
    } catch (error) {
      toast.error("Failed to send verification code. Please try again.");
      window.recaptchaVerifier.clear();
    }
  };

  // Verify SMS Code and Create Account
  const verifyAndCreateAccount = async (e) => {
    e.preventDefault();

    if (
      !firstname ||
      !lastname ||
      !handle ||
      !email ||
      !password ||
      !verificationId ||
      !code
    ) {
      return toast.error("Please fill in all the fields and verify your phone number.");
    }

    try {
      const phoneAuthCredential = PhoneAuthProvider.credential(
        verificationId,
        code
      );

      // After successful verification, proceed with account creation
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const { user } = userCredential;

      await updateProfile(user, {
        displayName: `${firstname} ${lastname}`,
      });

      // Create a new profile in Firestore
      const profileRef = doc(db, "profiles", user.uid);
      await setDoc(profileRef, {
        userId: user.uid,
        fullname: `${firstname} ${lastname}`,
        handle,
        avatarUrl: user.photoURL || "",
        createdAt: serverTimestamp(),
        quickieCount: 0,
        followersCount: 0,
        followingCount: 0,
        followers: [],
        following: [],
        bio: "",
        location: "",
        website: "",
        bookmarks: [],
        likes: [],
      });

      // Store user data in localStorage
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("You are signed up and logged in");
    } catch (err) {
      console.error("Error signing up:", err);
      return displayError(err);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center vh-100">
      <Row className="d-flex align-items-center justify-content-center" style={{ width: "100%" }}>
        <Col xs={12} md={6} lg={5} className="p-4 border rounded shadow" id="verticalHexagonSignup">
          <h2 className="text-center mb-4" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>Sign Up</h2>
          <Form onSubmit={verifyAndCreateAccount}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                className="customInput"
                placeholder="Enter first name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                className="customInput"
                placeholder="Enter last name"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Handle</Form.Label>
              <Form.Control
                type="text"
                className="customInput"
                placeholder="Enter a unique handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                className="customInput"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3 phoneInputContainer">
              <Form.Label>Phone Number</Form.Label>
              <PhoneInput
                country={'us'} // Default country (can be changed)
                value={phoneNumber}
                onChange={(phone) => setPhoneNumber(phone)}
                containerClass="phoneInputContainer" // Container styling
                inputClass="customInput" // Apply the .customInput styling
                buttonClass="flagDropdown" // Apply a class for the dropdown button styling
                dropdownClass="countryList" // Apply a class for the dropdown list styling
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                className="customInput"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <div id="recaptcha-container"></div>

            {!isCodeSent ? (
              <Button
                variant="primary"
                className="loginButton w-100 mt-3"
                onClick={sendVerificationCode}
              >
                Send Verification Code
              </Button>
            ) : (
              <>
                <Form.Group className="mt-3 mb-3">
                  <Form.Label>Verification Code</Form.Label>
                  <Form.Control
                    className="loginButton"
                    placeholder="Enter the verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </Form.Group>
                <Button variant="success" type="submit" className="w-100">
                  Verify and Sign Up
                </Button>
              </>
            )}
            <div className="text-center mt-3">
              <span style={{ cursor: "pointer" }} onClick={changeToLogin}>
                Already have an account? Login
              </span>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
