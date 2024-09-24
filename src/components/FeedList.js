import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore"; // Firestore
import Loader from "./Loader";
import Quickie from "./Quickie/Quickie";
import CustomResponse from "./CustomResponse";
import { getAuth } from "firebase/auth"; // Firebase Auth

const Wrapper = styled.div`
  margin-bottom: 7rem;
`;

const FeedList = () => {
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchFeed = async () => {
      if (!currentUser) {
        console.error("User is not authenticated");
        return;
      }

      try {
        // Fetch the current user's following list
        const profileRef = collection(db, "profiles");
        const profileSnapshot = await getDocs(query(profileRef, where("userId", "==", currentUser.uid)));

        let following = [];
        if (!profileSnapshot.empty) {
          const userProfile = profileSnapshot.docs[0].data();
          following = userProfile.following || [];
        }

        // Add the current user's own UID to the following list
        const userAndFollowing = [...following, currentUser.uid];

        // Fetch quickies from both followed users and the current user
        const feedRef = collection(db, "quickies");
        const feedQuery = query(
          feedRef,
          where("userId", "in", userAndFollowing), // Quickies created by the user and people they follow
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(feedQuery);

        const feedList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFeedData(feedList);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [currentUser, db]);

  if (loading) return <Loader />;

  return (
    <Wrapper>
      {feedData.length ? (
        feedData.map((quickie) => (
          <Quickie key={quickie.id} quickie={quickie} />
        ))
      ) : (
        <CustomResponse text="Follow some people to get some feed updates" />
      )}
    </Wrapper>
  );
};

export default FeedList;
