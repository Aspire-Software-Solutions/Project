import React, { useContext } from "react";
import { toast } from "react-toastify";
import { UserIcon } from "../Icons";
import { ThemeContext } from "../../context/ThemeContext";
import { Wrapper } from "../ToggleTheme";
import { getAuth, signOut } from "firebase/auth"; // Firebase import

const Logout = () => {
  const { theme } = useContext(ThemeContext);
  const auth = getAuth(); // Initialize Firebase Auth

  const handleLogout = async () => {
    try {
      // Firebase sign out
      await signOut(auth);
      
      // Clear localStorage
      localStorage.clear();
      
      // Show success message and redirect
      toast.success("You are logged out");
      setTimeout(() => {
        window.location = "/";
      }, 2100);
    } catch (error) {
      toast.error("Failed to log out");
      console.error("Logout error:", error);
    }
  };

  return (
    <Wrapper onClick={handleLogout}>
      <UserIcon sm color={theme.accentColor} />
      <p>Logout</p>
    </Wrapper>
  );
};

export default Logout;
