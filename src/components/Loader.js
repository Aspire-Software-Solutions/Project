import React from "react";
import styled, { keyframes } from "styled-components";
import { LoadingIcon } from "./Icons";

const rotateABD = keyframes`
  from {
    transform: rotate(-360deg);
  }

  to {
    transform: rotate(0deg);
  }
`;

const Wrapper = styled.div`
  svg {
    fill: ${(props) => props.theme.accentColor};
    width: 34px;
    height: 34px;
    position: absolute;
    top: 50%; /* Center vertically */
    left: 50%; /* Center horizontally */
    opacity: 0.8;
    transform: translate(-50%, -50%); /* Keep centered */
    animation: ${rotateABD} 2s linear infinite;
  }
`;

const Loader = () => (
  <Wrapper>
    <LoadingIcon aria-label="Loading" role="img" />
  </Wrapper>
);

export default Loader;
