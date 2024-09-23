import React, { useContext, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import GlobalStyle from "./styles/GlobalStyle";
import { ThemeContext } from "./context/ThemeContext";
import Router from "./AppRouter";
import Auth from "./components/Auth/Auth";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Auth

const App = () => {
  const { theme } = useContext(ThemeContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = getAuth(); // Initialize Firebase Auth

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      <ToastContainer
        toastClassName="toast-style"
        autoClose={2000}
        closeButton={false}
        draggable={false}
      />
      {isLoggedIn ? <Router /> : <Auth />}
    </StyledThemeProvider>
  );
};

export default App;
