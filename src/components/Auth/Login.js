import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../index";  // Firebase auth and Firestore
import Input from "../Input";
import Button from "../../styles/Button";
import Form from "../../styles/Form";
import Modal from "../Modal";  // Modal for verification input

// Custom Hook for handling input values
const useInput = (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return {
    value,
    onChange: handleChange,
  };
};

export default () => {
  const email = useInput("");  
  const password = useInput("");
  const [modalOpen, setModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Firebase sign-in method
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
      const { user } = userCredential;
  
      // Generate a random 6-digit verification code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
  
      // Call Firebase Cloud Function to send verification email
      const functions = getFunctions();
      const sendVerificationEmail = httpsCallable(functions, 'send_verification_email');
      const result = await sendVerificationEmail({
        email: user.email,
        verificationCode: generatedCode,
      });
  
      // If the Cloud Function call fails, prevent login
      if (!result || !result.data || !result.data.success) {
        throw new Error("Verification email failed to send. Please try again.");
      }
  
      // Store the verification code in Firestore with a 5-minute expiration
      await setDoc(doc(firestore, "verificationCodes", user.uid), {
        code: generatedCode,
        expiresAt: Date.now() + 5 * 60 * 1000,  // 5 minutes from now
      });
  
      // Show modal for the user to input the verification code
      setVerificationEmail(user.email);
      setModalOpen(true);
  
    } catch (err) {
      // Handle the error if the API call or login fails
      console.error('Error during login:', err);
      alert(err.message || 'An error occurred during login. Please try again.');
    }
  };
  

  const validateCode = async (inputCode) => {
    try {
      const user = auth.currentUser;
      const docRef = doc(firestore, "verificationCodes", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { code, expiresAt } = docSnap.data();

        // Check if the code is valid and not expired
        if (code === inputCode && Date.now() < expiresAt) {
          alert("Code is correct. You are now logged in.");
          localStorage.setItem("token", await user.getIdToken());
          setModalOpen(false);
        } else {
          alert("Invalid or expired verification code.");
        }
      } else {
        alert("No verification code found.");
      }
    } catch (err) {
      console.error("Error validating code:", err);
    }
  };

  return (
    <>
      <Form center onSubmit={handleLogin}>
        <Input text="Email" type="email" value={email.value} onChange={email.onChange} />
        <Input text="Password" type="password" value={password.value} onChange={password.onChange} />
        <Button xl type="submit">Login</Button>
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
