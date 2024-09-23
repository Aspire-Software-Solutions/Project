import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import moment from "moment";
import Avatar from "../../styles/Avatar";
import DeleteComment from "./DeleteComment";
import { Timestamp } from "firebase/firestore"; // Import Firebase Timestamp if needed
import { getAuth } from "firebase/auth"; // Firebase Auth

const defaultAvatarUrl = "/default-avatar.png"; // Default avatar if none provided

const Wrapper = styled.div`
  display: flex;
  border-bottom: 1px solid ${(props) => props.theme.tertiaryColor};
  padding: 1.5rem 1rem 1rem 1rem;

  .comment-info-user {
    display: flex;
    align-items: center;

    svg {
      margin-left: 0.6rem;
      position: relative;
      top: 3px;
    }
  }

  .comment-info-user span.username {
    font-weight: 500;
  }

  .comment-info-user span.secondary {
    padding-left: 0.5rem;
    color: ${(props) => props.theme.secondaryColor};
  }

  @media screen and (max-width: 430px) {
    flex-direction: column;

    .comment-info-user {
      font-size: 0.83rem;
    }

    .avatar {
      display: none;
    }

    .username {
      display: none;
    }

    .comment-info-user span.secondary {
      padding-left: 0;

      :first-child {
        padding-right: 0.6rem;
      }
    }
  }
`;

const Comment = ({ comment }) => {
  const { text, userId, userName, userAvatar, createdAt, handle } = comment;

  // Get the current user
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Convert Firebase Timestamp to Date object
  const commentDate = createdAt instanceof Timestamp ? createdAt.toDate() : createdAt;

  return (
    <Wrapper>
      {/* Link to user's profile by their userId */}
      <Link to={`/${handle}`}>
        <Avatar className="avatar" src={userAvatar || defaultAvatarUrl} alt="avatar" />
      </Link>
      <div className="comment-info">
        <div className="comment-info-user">
          <Link to={`/${handle}`}>
            <span className="username">{userName}</span>
          </Link>
          <Link to={`/${handle}`}>
            <span className="secondary">{`@${handle}`}</span>
            <span className="secondary">{moment(commentDate).fromNow()}</span>
          </Link>

          {/* Display delete icon next to the timestamp */}
          {currentUser && currentUser.uid === userId && (
            <DeleteComment id={comment.id} commentData={comment} />
          )}
        </div>

        <p>{text}</p>
      </div>
    </Wrapper>
  );
};

export default Comment;
