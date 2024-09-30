import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 80%;
  margin-bottom: 1.5rem;

  input {
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 5px;
    color: ${(props) => props.theme.primaryColor || "#FFFFFF"};
    font-size: 1rem;
    outline: none;

    ::placeholder {
      color: ${(props) => props.theme.placeholderColor || "rgba(255, 255, 255, 0.7)"};
    }

    &:focus {
      color: #FFFFFF;
      border-bottom-color: ${(props) => props.theme.focusColor || "#FF4500"};
    }
  }
`;

const Input = ({
  type = "text",
  text,
  value,
  onChange,
  placeholder = text,
  id = text.toLowerCase().replace(/\s+/g, "-"),
}) => {
  return (
    <Wrapper>
      <input
        id={id}
        aria-label={text}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={type === "password" ? "new-password" : "off"}
      />
    </Wrapper>
  );
};

export default Input;
