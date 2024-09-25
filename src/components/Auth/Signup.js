import React from "react";
import { toast } from "react-toastify";
import useInput from "../../hooks/useInput";
import Input from "../Input";
import Button from "../../styles/Button";
import Form from "../../styles/Form";
import { displayError } from "../../utils";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, firestore } from '../../index';

export default ({ changeToLogin }) => {
  const firstname = useInput("");
  const lastname = useInput("");
  const handle = useInput("");
  const email = useInput("");
  const password = useInput("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!firstname.value || !lastname.value || !handle.value || !email.value || !password.value) {
      return toast.error("You need to fill all the fields");
    }

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
      const { user } = userCredential;

      // Send email verification
      await sendEmailVerification(user);
      toast.info("A verification email has been sent. Please verify your email.");

      // Add user data to Firestore with unverified status
      await firestore.collection('users').doc(user.uid).set({
        firstname: firstname.value,
        lastname: lastname.value,
        handle: handle.value,
        email: email.value,
        createdAt: new Date(),
        verified: false, // Mark as unverified until email is confirmed
      });

    } catch (err) {
      console.error("Error signing up:", err);
      return displayError(err);
    }

    // Clear input fields after successful signup
    [firstname, lastname, handle, email, password].forEach((field) => field.setValue(""));
  };

  return (
    <Form center onSubmit={handleSignup}>
      <div className="group-input">
        <Input text="First Name" value={firstname.value} onChange={firstname.onChange} />
        <Input text="Last Name" value={lastname.value} onChange={lastname.onChange} />
      </div>
      <Input text="Handle" value={handle.value} onChange={handle.onChange} />
      <div className="group-input">
        <Input text="Email" type="email" value={email.value} onChange={email.onChange} />
        <Input text="Password" type="password" value={password.value} onChange={password.onChange} />
      </div>
      <Button xl outline type="submit">Sign up</Button>
      <span>or</span>
      <Button xl type="button" onClick={changeToLogin}>Login</Button>
    </Form>
  );
};
