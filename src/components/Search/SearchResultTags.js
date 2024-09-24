import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Loader from "../Loader";
import CustomResponse from "../CustomResponse";
import Quickie from "../Quickie/Quickie";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // Firestore

const Wrapper = styled.div`
  position: relative;
`;

const SearchResultTags = ({ searchTerm = "" }) => {
  const [loading, setLoading] = useState(false);
  const [quickies, setQuickies] = useState([]);
  const db = getFirestore(); // Initialize Firestore

  useEffect(() => {
    // Ensure searchTerm is a string and starts with '#'
    if (typeof searchTerm !== "string" || !searchTerm.startsWith("#")) {
      setQuickies([]);
      return;
    }

    const fetchQuickiesByTag = async () => {
      setLoading(true);
      try {
        // Query quickies from Firestore where the tags array contains the searchTerm
        const quickiesRef = collection(db, "quickies");
        const quickiesQuery = query(quickiesRef, where("tags", "array-contains", searchTerm));
        const querySnapshot = await getDocs(quickiesQuery);
        const quickiesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuickies(quickiesList);
      } catch (error) {
        console.error("Error fetching quickies by tag:", error);
        setQuickies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuickiesByTag();
  }, [searchTerm, db]);

  if (loading) return <Loader />;

  if (!searchTerm.startsWith("#")) {
    return <CustomResponse text="Search for tags by typing # followed by the tag" />;
  }

  return (
    <Wrapper>
      {quickies.length ? (
        quickies.map((quickie) => <Quickie key={quickie.id} quickie={quickie} />)
      ) : (
        <CustomResponse text="No quickies found for that tag, try a different search" />
      )}
    </Wrapper>
  );
};

export default SearchResultTags;
