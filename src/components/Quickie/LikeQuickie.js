import React, { useState, useEffect } from "react";
import { HeartIcon, HeartFillIcon } from "../Icons";
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"; // Firestore
import { getAuth } from "firebase/auth"; // Firebase Auth

const LikeQuickie = ({ id, isLiked, likesCount }) => {
  const [liked, setLiked] = useState(isLiked);  // Local state for like status
  const [likesCountState, setLikesCount] = useState(likesCount); // Local state for likes count
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    // Sync the local `liked` state with the prop `isLiked` from Quickie.js
    setLiked(isLiked);
  }, [isLiked]);

  const handleToggleLike = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const quickieRef = doc(db, "quickies", id);

    try {
      if (liked) {
        // Remove the like from Firestore
        await updateDoc(quickieRef, {
          likes: arrayRemove(user.uid),
          likesCount: likesCountState - 1,
        });
        setLikesCount(likesCountState - 1);
      } else {
        // Add the like to Firestore
        await updateDoc(quickieRef, {
          likes: arrayUnion(user.uid),
          likesCount: likesCountState + 1,
        });
        setLikesCount(likesCountState + 1);
      }
      setLiked(!liked); // Toggle the like state
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  return (
    <span>
      {liked ? (
        <HeartFillIcon color="#E0245E" onClick={handleToggleLike} />
      ) : (
        <HeartIcon onClick={handleToggleLike} />
      )}
      {likesCountState ? likesCountState : null}
    </span>
  );
};

export default LikeQuickie;

