import styled, { css } from "styled-components";

export default styled.form`
  width: 380px;
  height: 500px;
  background-color: ${(props) => props.theme.backgroundColor || "#720000"};
  clip-path: polygon(50% 5%, 93% 25%, 93% 75%, 50% 95%, 7% 75%, 7% 25%);
  position: relative;
  padding: 6rem 2rem 2rem 2rem; /* Increased top padding */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Start from the top */
  transition: transform 0.3s, box-shadow 0.3s;

  /* Adjusted to position content within the square portion */
  & > * {
    max-width: 80%;
  }

  /* Center the form */
  ${(props) =>
    props.center &&
    css`
      position: absolute;
      top: 50%;
      right: 15%; /* Move form to the right */
      transform: translateY(-50%);
    `}


  /* Responsive design */
  @media screen and (max-width: 400px) {
    width: 360px;
  }

  /* Additional styles */
  span {
    text-align: center;
    display: block;
    margin: 0;
    color: ${(props) => props.theme.secondaryColor || "#FFFFFF"};
  }
`;
