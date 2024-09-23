import React, { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import TextareaAutosize from "react-textarea-autosize";
import useInput from "../../hooks/useInput";
import Button from "../../styles/Button";
import QuickieFile from "../../styles/QuickieFile";
import { UploadFileIcon } from "../Icons";
import { displayError } from "../../utils";
import Avatar from "../../styles/Avatar";
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore"; // Firestore
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Firebase Storage
import { getAuth } from "firebase/auth"; // Firebase Authentication

const defaultAvatarUrl = "/default-avatar.png";

const Wrapper = styled.div`
  display: flex;
  padding: 1rem 1rem;
  border-bottom: 7px solid ${(props) => props.theme.tertiaryColor};

  textarea {
    width: 100%;
    background: inherit;
    border: none;
    font-size: 1.23rem;
    font-family: ${(props) => props.theme.font};
    color: ${(props) => props.theme.primaryColor};
    margin-bottom: 1.4rem;
  }

  .new-quickie {
    display: flex;
    flex-direction: column;
  }

  .new-quickie-action {
    display: flex;
    align-items: center;
  }

  svg {
    width: 24px;
    height: 24px;
    fill: ${(props) => props.theme.accentColor};
    margin-right: 2rem;
    cursor: pointer;
  }

  button {
    position: relative;
  }
`;

const NewQuickie = () => {
  const [mediaUrl, setMediaUrl] = useState(null); // Use mediaUrl instead of quickieFiles
  const quickie = useInput("");
  const db = getFirestore(); // Firestore instance
  const auth = getAuth(); // Firebase Auth instance
  const storage = getStorage(); // Firebase Storage instance

  const handleNewQuickie = async (e) => {
    e.preventDefault();

    if (!quickie.value) {
      return toast("Write something");
    }

    const tags = quickie.value.split(" ").filter((str) => str.startsWith("#"));

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("You must be logged in to post a quickie.");
        return;
      }

      // Fetch the user's handle from the profiles collection
      const userRef = doc(db, "profiles", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        toast.error("User profile not found.");
        return;
      }

      const { handle } = userSnap.data(); // Get the user's handle

      const newQuickieData = {
        text: quickie.value,
        tags,
        mediaUrl: mediaUrl || null, // Store mediaUrl if available
        userId: user.uid,
        handle, // Add the handle from the profiles collection
        userAvatar: user.photoURL || defaultAvatarUrl,
        createdAt: serverTimestamp(),
        likes: [],
        userName: user.displayName,
        likesCount: 0,
        comments: [],
        commentsCount: 0,
      };

      // Add the new quickie to Firestore
      await addDoc(collection(db, "quickies"), newQuickieData);

      toast.success("Your quickie has been posted");
    } catch (err) {
      displayError(err);
    }

    quickie.setValue("");
    setMediaUrl(null);
  };

  const handleQuickieFiles = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `quickies/${file.name}`); // Create a storage reference
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // You can implement progress tracking here if needed
      },
      (error) => {
        toast.error("Error uploading file.");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setMediaUrl(downloadURL); // Save the download URL as mediaUrl
        toast.success("File uploaded successfully.");
      }
    );
  };

  const user = auth.currentUser; // Get the current logged-in user

  return (
    <Wrapper>
      {user && <Avatar src={user.photoURL || defaultAvatarUrl} alt="avatar" />}
      <form onSubmit={handleNewQuickie}>
        <div className="new-quickie">
          <TextareaAutosize
            cols="48"
            placeholder="What's happening?"
            type="text"
            value={quickie.value}
            onChange={quickie.onChange}
          />

          {mediaUrl && <QuickieFile newquickie src={mediaUrl} alt="preview" />}

          <div className="new-quickie-action">
            <div className="svg-input">
              <label htmlFor="file-input">
                <UploadFileIcon />
              </label>
              <input
                id="file-input"
                accept="image/*"
                type="file"
                onChange={handleQuickieFiles}
              />
            </div>
            <Button sm disabled={!quickie.value}>
              Quickie
            </Button>
          </div>
        </div>
      </form>
    </Wrapper>
  );
};

export default NewQuickie;
