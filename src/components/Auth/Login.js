import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../index";  // Firebase auth and Firestore
import Input from "../Input";
import Button from "../../styles/Button";
import Form from "../../styles/Form";
import Modal from "../Modal";  // Modal for verification input

export default () => {
  const email = useInput("");  
  const password = useInput("");
  const [modalOpen, setModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
      const { user } = userCredential;

      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

      const functions = getFunctions();
      const sendVerificationEmail = httpsCallable(functions, 'send_verification_email');
      await sendVerificationEmail({
        email: user.email,
        verificationCode: generatedCode,
      });

      await setDoc(doc(firestore, "verificationCodes", user.uid), {
        code: generatedCode,
        expiresAt: Date.now() + 5 * 60 * 1000, 
      });

      setVerificationEmail(user.email);
      setModalOpen(true);

    } catch (err) {
      console.error('Error during login:', err);
    }
  };

  const validateCode = async (inputCode) => {
    try {
      const user = auth.currentUser;
      const docRef = doc(firestore, "verificationCodes", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { code, expiresAt } = docSnap.data();

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
