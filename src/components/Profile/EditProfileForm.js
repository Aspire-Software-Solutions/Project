import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import useInput from "../../hooks/useInput";
import Input from "../Input";
import Button from "../../styles/Button";
import Form from "../../styles/Form";
import { displayError, uploadImage } from "../../utils";
import CoverPhoto from "../../styles/CoverPhoto";
import Avatar from "../../styles/Avatar";
import styled from "styled-components";
import { getFirestore, doc, updateDoc } from "firebase/firestore"; // Firestore

const defaultAvatarUrl = "/default-avatar.png"; // Default avatar path
const defaultCoverPhotoUrl = "/default-cover-photo.png"; // Default cover photo path

// Local styled components for EditProfileForm
const EditableCoverPhoto = styled(CoverPhoto)`
  border: 2px solid ${(props) => props.theme.accentColor}; // Outline around the cover photo
  border-radius: 10px; // Optional for rounded corners
  cursor: pointer; // Indicating it's clickable
  transition: all 0.3s ease;

  &:hover {
    border-color: ${(props) => props.theme.primaryColor}; // Change color on hover
  }
`;

const EditableAvatar = styled(Avatar)`
  border: 3px solid ${(props) => props.theme.accentColor}; // Outline around avatar
  cursor: pointer; // Indicating it's clickable
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${(props) => props.theme.primaryColor}; // Change color on hover
  }
`;

const EditProfileForm = ({ profile, history }) => {
  const [avatarState, setAvatar] = useState(""); // Store the selected avatar file
  const [coverPhotoState, setCoverPhoto] = useState(""); // Store the selected cover photo file
  const [avatarFile, setAvatarFile] = useState(null); // New state to hold avatar file
  const [coverPhotoFile, setCoverPhotoFile] = useState(null); // New state to hold cover photo file
  const [loading, setLoading] = useState(false); // Define loading state

  const firstname = useInput(profile && profile.firstname);
  const lastname = useInput(profile && profile.lastname);
  const website = useInput(profile && profile.website);
  const bio = useInput(profile && profile.bio);
  const avatarUrl = useInput(profile && profile.avatarUrl);
  const coverPhoto = useInput(profile && profile.coverPhoto);

  const handle = profile && profile.handle; // Assuming handle is a unique identifier for the profile
  const userId = profile && profile.userId; // Using userId for Firestore

  const db = getFirestore(); // Initialize Firestore

  const handleEditProfile = async (e) => {
    e.preventDefault();

    if (!firstname.value || !lastname.value) {
      return toast.error("You cannot leave firstname/lastname empty");
    }

    setLoading(true); // Set loading to true when the form is submitted

    try {
      let newAvatarUrl = avatarUrl.value;
      let newCoverPhotoUrl = coverPhoto.value;

      // Upload avatar if a new file is selected
      if (avatarFile) {
        newAvatarUrl = await uploadImage(avatarFile);
      }

      // Upload cover photo if a new file is selected
      if (coverPhotoFile) {
        newCoverPhotoUrl = await uploadImage(coverPhotoFile);
      }

      const profileRef = doc(db, "profiles", userId); // Reference to the profile document in Firestore

      // Update profile in Firestore
      await updateDoc(profileRef, {
        firstname: firstname.value,
        lastname: lastname.value,
        bio: bio.value,
        website: website.value,
        avatarUrl: newAvatarUrl,
        coverPhoto: newCoverPhotoUrl,
      });

      toast.success("Your profile has been updated 🥳");
    } catch (err) {
      return displayError(err);
    } finally {
      setLoading(false); // Set loading to false after the update is complete
    }

    [firstname, lastname, bio, website, avatarUrl, coverPhoto].forEach((field) =>
      field.setValue("")
    );

    history.push(`/${handle}`);
  };

  // Cancel button to reset changes and navigate back to profile
  const cancelEdit = () => {
    // Reset local state to their original values
    setAvatar(avatarUrl.value);
    setCoverPhoto(coverPhoto.value);
    setAvatarFile(null); // Reset avatar file
    setCoverPhotoFile(null); // Reset cover photo file

    // Navigate back to the profile page
    history.push(`/${handle}`);
  };

  const handleCoverPhoto = (e) => {
    const file = e.target.files[0];
    setCoverPhotoFile(file); // Store the selected file locally
    setCoverPhoto(URL.createObjectURL(file)); // Show the preview of the selected image
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file); // Store the selected file locally
    setAvatar(URL.createObjectURL(file)); // Show the preview of the selected image
  };

  return (
    <Form lg onSubmit={handleEditProfile}>
      <div className="cover-photo">
        <label htmlFor="cover-photo-input">
          <EditableCoverPhoto
            src={coverPhotoState || coverPhoto.value || defaultCoverPhotoUrl}
            alt="cover"
          />
        </label>
        <input
          type="file"
          id="cover-photo-input"
          accept="image/*"
          onChange={handleCoverPhoto}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        </div>
      </div>

      <div className="avatar-input">
        <label htmlFor="avatar-input-file">
          <EditableAvatar
            lg
            src={avatarState || avatarUrl.value || defaultAvatarUrl}
            alt="avatar"
          />
        </label>
        <input
          type="file"
          accept="image/*"
          id="avatar-input-file"
          onChange={handleAvatar}
        />
      </div>

      <Input
        lg={true}
        text="First Name"
        value={firstname.value}
        onChange={firstname.onChange}
      />
      <Input
        lg={true}
        text="Last Name"
        value={lastname.value}
        onChange={lastname.onChange}
      />
      <div className="bio-wrapper">
        <label className="bio" htmlFor="bio">
          Bio
        </label>
        <TextareaAutosize
          id="bio"
          placeholder="Bio"
          value={bio.value}
          onChange={bio.onChange}
        />
      </div>
      <Input
        lg={true}
        text="Website"
        value={website.value}
        onChange={website.onChange}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button outline disabled={loading} type="submit">
          {loading ? "Saving" : "Save"}
        </Button>
        <Button outline type="button" onClick={cancelEdit}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default withRouter(EditProfileForm);
