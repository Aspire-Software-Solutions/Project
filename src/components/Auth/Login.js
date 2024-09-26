import React from "react";
import { toast } from "react-toastify";
import useInput from "../../hooks/useInput";
import Input from "../Input";
import Form from "../../styles/Form";
import { displayError } from "../../utils";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.value || !password.value) {
      return toast.error("Please fill in all fields.");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );

      const { user } = userCredential;

      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("You are logged in.");
    } catch (err) {
      return displayError(err);
    }

    email.setValue("");
    password.setValue("");
  };

  const handleForgotPassword = () => {
    toast.info("Redirecting to password reset page...");
    // Implement your forgot password logic here
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
        {/* Hidden submit button to enable form submission on Enter key press */}
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
    </Container>
  );
};