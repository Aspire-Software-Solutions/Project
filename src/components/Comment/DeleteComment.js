import React from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { TrashIcon } from "../Icons";
import { getFirestore, doc, updateDoc, arrayRemove, increment } from "firebase/firestore"; // Firebase Firestore imports

const DeleteComment = ({ id, commentData }) => {
  const { quickieId } = useParams(); // Assuming `quickieId` is in the URL
  const db = getFirestore()

  const handleDeleteComment = async () => {

    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    
    if (!confirmDelete) {
      return; // Exit if the user doesn't confirm
    }
    
    try {
      const quickieRef = doc(db, "quickies", quickieId);

      // Update Firestore to remove the comment
      await updateDoc(quickieRef, {
        comments: arrayRemove(commentData), // Remove the specific comment object
        commentsCount: increment(-1), // Decrement the commentsCount field by 1
      });

      toast.success("Your comment has been deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  return <TrashIcon onClick={handleDeleteComment} />;
};

export default DeleteComment;
