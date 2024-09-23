import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Header from "../Header";
import ProfileInfo from "./ProfileInfo";
import Quickie from "../Quickie/Quickie";
import Loader from "../Loader";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // Firebase Firestore imports

const Wrapper = styled.div`
  padding-bottom: 5rem;

  .profile-top {
    display: flex;
    flex-direction: column;
    margin-left: 1rem;

    span.quickieCount {
      margin-top: 0.1rem;
      color: ${(props) => props.theme.secondaryColor};
      font-size: 0.9rem;
    }
  }
`;

const Profile = () => {
  const { handle } = useParams(); // Get the profile handle from the URL
  const [profileData, setProfileData] = useState(null);
  const [quickies, setQuickies] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(); // Initialize Firestore

  console.log("Profile component rendered");

  useEffect(() => {
    const fetchProfileAndQuickies = async () => {
      setLoading(true);
      try {
        // Fetch the user profile using the handle
        const profileQuery = query(
          collection(db, "profiles"),
          where("handle", "==", handle)
        );
        const profileSnap = await getDocs(profileQuery);

        if (!profileSnap.empty) {
          const profileDoc = profileSnap.docs[0];
          setProfileData(profileDoc.data());

          // Fetch the user's quickies from Firestore
          const quickiesQuery = query(
            collection(db, "quickies"),
            where("userId", "==", profileDoc.data().userId)
          );
          const quickiesSnap = await getDocs(quickiesQuery);

          const quickiesList = quickiesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setQuickies(quickiesList);
        } else {
          console.log("No such profile!");
        }
      } catch (error) {
        console.error("Error fetching profile or quickies: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndQuickies();
  }, [handle, db]);

  if (loading) return <Loader />;

  return (
    <Wrapper>
      <Header>
        <div className="profile-top">
          <span>{`${profileData.firstname} ${profileData.lastname}`}</span>
          <span className="quickieCount">
            {quickies.length
              ? `${quickies.length} Quickies`
              : "No Quickies"}
          </span>
        </div>
      </Header>
      <ProfileInfo profile={profileData} />
      {quickies.length
        ? quickies.map((quickie) => (
            <Quickie key={quickie.id} quickie={quickie} />
          ))
        : null}
    </Wrapper>
  );
};


export default Profile;
