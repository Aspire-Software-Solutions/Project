import { useState } from "react";

const useInput = (defaultValue = "", type = "text") => {
  const [value, setValue] = useState(defaultValue);

  const onChange = (e) => {
    if (type === "checkbox") {
      setValue(e.target.checked);
    } else {
      setValue(e.target.value);
    }
  };

  const reset = () => {
    setValue(defaultValue);
  };

  return { value, setValue, onChange, reset };
};

export default useInput;
