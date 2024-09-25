import React, { useState } from "react";
import Modal from "../Modal";  // Import modal for code input
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "../../index";  // Firebase auth and Firestore
import { toast } from "react-toastify";
import useInput from "../../hooks/useInput";  // For input handling
import Input from "../Input";
import Button from "../../styles/Button";
import Form from "../../styles/Form";
import { displayError } from "../../utils";
import { doc, setDoc, getDoc } from "firebase/firestore";  // Firestore functions

export default ({ changeToSignup }) => {
  const email = useInput("");
  const password = useInput("");
  const [modalOpen, setModalOpen] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
      const { user } = userCredential;

      // Generate a random code for email verification
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Send code to email (via your email sending service, e.g., SMTP or Firebase)
      // await sendEmailVerificationCode(user.email, verificationCode);  // Implement this function

      // Store the code in Firestore with an expiration time
      await setDoc(doc(firestore, "verificationCodes", user.uid), {
        code: verificationCode,
        expiresAt: Date.now() + 5 * 60 * 1000, // Code valid for 5 minutes
      });

      // Open modal for the user to input the code
      setVerificationEmail(user.email);
      setCodeSent(true);
      setModalOpen(true);

    } catch (err) {
      return displayError(err);
    }
  };

  const validateCode = async (inputCode) => {
    try {
      const user = auth.currentUser;
      const docRef = doc(firestore, "verificationCodes", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { code, expiresAt } = docSnap.data();

        // Check if code matches and is not expired
        if (code === inputCode && Date.now() < expiresAt) {
          toast.success("Code is correct. You are logged in.");
          localStorage.setItem("token", await user.getIdToken());
          localStorage.setItem("user", JSON.stringify(user));
          setModalOpen(false);
        } else {
          toast.error("Invalid or expired code.");
        }
      } else {
        toast.error("No code found. Please try again.");
      }
    } catch (err) {
      console.error("Error validating code:", err);
      toast.error("An error occurred while validating the code.");
    }
  };

  return (
    <>
      <Form center onSubmit={handleLogin}>
        <Input text="Email" type="email" value={email.value} onChange={email.onChange} />
        <Input text="Password" type="password" value={password.value} onChange={password.onChange} />
        <Button xl type="submit">Login</Button>
        <span>or</span>
        <Button xl outline type="button" onClick={changeToSignup}>Sign up</Button>
      </Form>

      <Modal
        isOpen={modalOpen}
        email={verificationEmail}
        onCodeSubmit={validateCode}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
