import React from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import TextareaAutosize from "react-textarea-autosize";
import useInput from "../../hooks/useInput";
import Button from "../../styles/Button";
import { displayError } from "../../utils";
import Avatar from "../../styles/Avatar";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore"; // Firebase Firestore imports
import { getAuth } from "firebase/auth"; // Firebase Auth import

const defaultAvatarUrl = "/default-avatar.png";

const Wrapper = styled.div`
  display: flex;
  padding: 1rem 0;
  align-items: flex-start;

  textarea {
    width: 100%;
    background: inherit;
    border: none;
    font-size: 1.23rem; /* Match the Quickie input font size */
    font-family: ${(props) => props.theme.font}; /* Match the Quickie input font family */
    color: ${(props) => props.theme.primaryColor}; /* Match the color from Quickie input */
    margin-bottom: 1.4rem;
    padding: 0.5rem;
  }

  .add-comment-action {
    margin-left: auto;
  }

  button {
    position: relative;
    margin-top: 1rem;
  }

  .avatar {
    margin-right: 1rem;
  }

  @media screen and (max-width: 470px) {
    textarea {
      width: 90%;
    }
  }
`;

const AddComment = ({ id }) => {
  const comment = useInput("");
  const db = getFirestore(); // Initialize Firestore
  const auth = getAuth(); // Get Firebase Auth instance

  const handleAddComment = async (e) => {
    e.preventDefault();
  
    if (!comment.value) return toast.error("Reply something");
  
    try {
      const user = auth.currentUser;
      if (!user) {
        return toast.error("You need to be logged in to reply.");
      }

      // Fetch the user's handle from the 'profiles' collection
      const userRef = doc(db, "profiles", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        return toast.error("User profile not found.");
      }
      const { handle } = userSnap.data(); // Get the user's handle

      const quickieRef = doc(db, "quickies", id);
      await updateDoc(quickieRef, {
        comments: arrayUnion({
          text: comment.value,
          userId: user.uid,
          userName: user.displayName,
          userAvatar: user.photoURL || defaultAvatarUrl,
          handle: handle, // Include the user's handle in the comment
          createdAt: new Date(),
        }),
        commentsCount: increment(1), // Correctly increment the comment count
      });
  
      toast.success("Your reply has been added");
    } catch (err) {
      return displayError(err);
    }
  
    comment.setValue(""); // Clear the input after successful submission
  };

  // Get the current user from Firebase Auth
  const user = auth.currentUser;

  if (!user) {
    return <p>You need to be logged in to add a comment.</p>;
  }

  return (
    <Wrapper>
     <Avatar src={user.photoURL || defaultAvatarUrl} alt="avatar" />

      <form onSubmit={handleAddComment}>
        <div className="add-comment">
          <TextareaAutosize
            cols="48"
            placeholder="Reply with a quickie!"
            type="text"
            value={comment.value}
            onChange={comment.onChange}
          />

          <div className="add-comment-action">
            <Button sm type="submit">
              Reply
            </Button>
          </div>
        </div>
      </form>
    </Wrapper>
  );
};

export default AddComment;
