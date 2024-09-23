import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import Loader from "../components/Loader";
import Quickie from "../components/Quickie/Quickie"; // Assuming Quickie component displays a quickie

const Wrapper = styled.div`
  padding: 1rem;
`;

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const auth = getAuth(); // Get auth instance
  const currentUser = auth.currentUser; // Get the logged-in user

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        if (!currentUser) {
          throw new Error("User not authenticated");
        }
        
        const userId = currentUser.uid;
        const profileRef = doc(db, "profiles", userId);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const { bookmarks: bookmarkIds = [] } = profileSnap.data();

          // Check if the user has bookmarks
          if (bookmarkIds.length) {
            // Firestore query to fetch bookmarked quickies
            const batches = [];
            const maxBatchSize = 10;
            
            // Split into batches of 10 to handle Firestore's `in` clause limitation
            for (let i = 0; i < bookmarkIds.length; i += maxBatchSize) {
              const batchIds = bookmarkIds.slice(i, i + maxBatchSize);
              const quickiesQuery = query(
                collection(db, "quickies"),
                where("__name__", "in", batchIds)
              );
              batches.push(getDocs(quickiesQuery));
            }

            // Await all batch queries
            const quickiesSnapshots = await Promise.all(batches);
            const quickiesList = quickiesSnapshots.flatMap((snap) => 
              snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
            );

            setBookmarks(quickiesList);
          }
        }
      } catch (error) {
        console.error("Error fetching bookmarks: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [db, currentUser]);

  if (loading) return <Loader />;

  return (
    <Wrapper>
      {bookmarks.length ? (
        bookmarks.map((quickie) => (
          <Quickie key={quickie.id} quickie={quickie} />
        ))
      ) : (
        <p>No bookmarks yet!</p>
      )}
    </Wrapper>
  );
};

export default Bookmarks;
