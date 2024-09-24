import React from "react";
import styled, { css } from "styled-components";

const Wrapper = styled.div`
  width: 315px;
  background: ${(props) => props.theme.tertiaryColor2};
  padding: 0.2rem 0.4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-bottom: 1px solid ${(props) => props.theme.accentColor};
  margin-bottom: 2rem;

  input {
    width: 100%;
    background: inherit;
    border: none;
    font-size: 1rem;
    font-family: ${(props) => props.theme.font};
    color: ${(props) => props.theme.primaryColor};
  }

  label {
    color: ${(props) => props.theme.secondaryColor};
    margin-bottom: 2px;
  }

  ${(props) =>
    props.lg &&
    css`
      width: 100%;
    `}
`;

const Input = ({
  lg = false,
  type = "text",
  text,
  value,
  onChange,
  placeholder,
  id = text.toLowerCase().replace(/\s+/g, "-"), // default id from text label
}) => {
  return (
    <Wrapper lg={lg}>
      <label htmlFor={id}>{text}</label>
      <input
        id={id}
        aria-label={text} // Accessibility for screen readers
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={type === "password" ? "new-password" : "off"} // Conditional autocomplete for passwords
      />
    </Wrapper>
  );
};

export default Input;
