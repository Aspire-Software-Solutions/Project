import React from "react";
import { toast } from "react-toastify";
import useInput from "../../hooks/useInput";
import Input from "../Input";
import Button from "../../styles/Button";
import Form from "../../styles/Form";
import { displayError } from "../../utils";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Firebase import

export default ({ changeToSignup }) => {
  const email = useInput("");
  const password = useInput("");
  const auth = getAuth(); // Firebase auth instance

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.value || !password.value) {
      return toast.error("You need to fill all the fields");
    }

    try {
      // Use Firebase's signInWithEmailAndPassword method
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );
      
      const { user } = userCredential;
      
      // Store the token and user information in localStorage
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`You are logged in`);
    } catch (err) {
      return displayError(err);
    }

    // Clear input fields after successful login
    [email, password].forEach((field) => field.setValue(""));
  };

  return (
    <Form center onSubmit={handleLogin}>
      <h2>Log In</h2>
      <Input
        text="Username/Email"
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

      <Button xl outline type="submit">
        Login
      </Button>
      <span>or</span>
      <Button xl type="button" onClick={changeToSignup}>
        Signup
      </Button>
    </Form>
  );
};
