import React from "react";
import { toast } from "react-toastify";
import useInput from "../../hooks/useInput";
import Input from "../Input";
import Button from "../../styles/Button";
import Form from "../../styles/Form";
import { displayError } from "../../utils";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"; // Firebase imports
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore"; // Firestore imports
import {auth, firestore} from '../../index';


export default ({ changeToLogin }) => {
  const firstname = useInput("");
  const lastname = useInput("");
  const handle = useInput("");
  const email = useInput("");
  const password = useInput("");
  const auth = getAuth(); // Firebase auth instance
  const db = getFirestore(); // Firestore instance

  const handleSignup = async (e) => {
    e.preventDefault();
  
    if (
      !firstname.value ||
      !lastname.value ||
      !handle.value ||
      !email.value ||
      !password.value
    ) {
      return toast.error("You need to fill in all the fields");
    }
  
    // Check for invalid handle names
    const invalidHandles = ["/", "explore", "settings/profile", "notifications", "bookmarks"];
    if (invalidHandles.includes(handle.value)) {
      return toast.error("Your handle is not valid, try a different one");
    }
  
    // Check for non-alphanumeric handle
    const re = /^[a-z0-9]+$/i;
    if (re.exec(handle.value) === null) {
      return toast.error(
        "Your handle contains some non-alphanumeric characters, choose a better handle name"
      );
    }
  
    try {
      // Use Firebase createUserWithEmailAndPassword method for sign-up
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );
      
      const { user } = userCredential;
  
      // Update the user profile to include first and last name in Firebase Auth
      await updateProfile(user, {
        displayName: `${firstname.value} ${lastname.value}`,
      });
  
      // Create a new profile in Firestore
      const profileRef = doc(db, "profiles", user.uid); // Use user.uid as document ID
      await setDoc(profileRef, {
        userId: user.uid,  // Firebase Auth user ID
        fullname: `${firstname.value} ${lastname.value}`,  // Full name
        handle: handle.value,  // Unique handle
        avatarUrl: user.photoURL || "",  // Optionally use user avatar if available
        createdAt: serverTimestamp(),  // Firestore timestamp
        quickieCount: 0,  // Initially zero quickies
        followersCount: 0,  // Initially zero followers
        followingCount: 0,  // Initially zero following
        followers: [],  // Initially empty followers array
        following: [],  // Initially empty following array
        bio: "",  // Bio field, initially empty
        location: "",  // Location field, initially empty
        website: "",  // Website field, initially empty
        bookmarks: [],  // Initially empty bookmarks array
        likes: []  // Initially empty likes array
      });
  
      // Store user data in localStorage
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("user", JSON.stringify(user));
  
      toast.success("You are signed up and logged in");
    } catch (err) {
      console.error("Error signing up:", err); // Log error for debugging
      return displayError(err);
    }
  
    // Clear input fields after successful signup
    [firstname, lastname, handle, email, password].forEach((field) =>
      field.setValue("")
    );
  };
  

  return (
    <Form center onSubmit={handleSignup}>
      <div className="group-input">
        <Input
          text="First Name"
          value={firstname.value}
          onChange={firstname.onChange}
        />
        <Input
          text="Last Name"
          value={lastname.value}
          onChange={lastname.onChange}
        />
      </div>
      <Input text="Handle" value={handle.value} onChange={handle.onChange} />
      <div className="group-input">
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
      </div>
      <Button xl outline type="submit">
        Sign up
      </Button>
      <span>or</span>
      <Button xl type="button" onClick={changeToLogin}>
        Login
      </Button>
    </Form>
  );
};
