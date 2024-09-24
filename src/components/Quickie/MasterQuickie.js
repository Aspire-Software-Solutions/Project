import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Header from "../Header";
import Loader from "../Loader";
import Quickie from "./Quickie";
import Comment from "../Comment/Comment";
import AddComment from "../Comment/AddComment";
import CustomResponse from "../CustomResponse";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Firestore
import { sortFn } from "../../utils";

const Wrapper = styled.div`
  margin-bottom: 7rem;
`;

const MasterQuickie = () => {
  const { quickieId } = useParams();
  const [quickieData, setQuickieData] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(); // Firestore instance

  useEffect(() => {
    const fetchQuickieData = async () => {
      setLoading(true);

      try {
        // Fetch the quickie document
        const quickieRef = doc(db, "quickies", quickieId);
        const quickieSnap = await getDoc(quickieRef);

        if (quickieSnap.exists()) {
          const quickie = quickieSnap.data();

          // Set quickie data
          setQuickieData({ id: quickieId, ...quickie });

          // Fetch the comments array directly from the quickie document
          const commentsArray = quickie.comments || []; // Use an empty array if no comments exist
          setComments(commentsArray.sort(sortFn)); // Sort the comments by createdAt
        } else {
          setQuickieData(null);
        }
      } catch (error) {
        console.error("Error fetching quickie or comments:", error);
        setQuickieData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuickieData();
  }, [quickieId, db]);

  return (
    <Wrapper>
      <Header>
        <span>Quickie</span>
      </Header>
      {loading ? (
        <Loader />
      ) : (
        <>
          {quickieData ? (
            <>
              <Quickie quickie={quickieData} />
              <AddComment id={quickieData.id} />
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <Comment key={index} comment={comment} />
                ))
              ) : (
                <p>No comments yet.</p>
              )}
            </>
          ) : (
            <CustomResponse text="Oops, the quickie you are looking for doesn't seem to exist." />
          )}
        </>
      )}
    </Wrapper>
  );
};

export default MasterQuickie;
