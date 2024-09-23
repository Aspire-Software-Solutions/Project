import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  height: 70vh;
  font-size: 1.1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NoSearchResult = ({ text }) => (
  <Wrapper>
    <p>{text}</p>
  </Wrapper>
);

export default NoSearchResult;
