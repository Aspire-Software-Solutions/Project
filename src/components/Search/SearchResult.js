import React, { useState } from "react";
import styled from "styled-components";
import SearchResultQuickies from "./SearchResultQuickies"; 
import SearchResultTags from "./SearchResultTags";
import SearchResultUsers from "./SearchResultUsers";

const Wrapper = styled.div`
  .tabs {
    display: flex;
    justify-content: space-around;
    border-bottom: 2px solid ${(props) => props.theme.tertiaryColor};
  }

  span {
    cursor: pointer;
    margin-bottom: 0.4rem;
  }

  span.active {
    border-bottom: 2px solid ${(props) => props.theme.accentColor};
    font-weight: 500;
    color: ${(props) => props.theme.accentColor};
  }
`;

const SearchResult = ({
  searchQuickiesLoading,
  searchUserLoading,
  searchTagLoading,
  tags,
  users,
  quickies,
  searchTerm  // Pass the search term for filtering
}) => {
  const [searchResultAction, setSearchResultAction] = useState("QUICKIES");

  const changeToQuickies = () => setSearchResultAction("QUICKIES");
  const changeToTags = () => setSearchResultAction("TAGS");
  const changeToUsers = () => setSearchResultAction("USERS");

  return (
    <Wrapper>
      <div className="tabs">
        <span
          className={searchResultAction === "QUICKIES" ? "active" : ""}
          onClick={changeToQuickies}
        >
          Quickies
        </span>
        <span
          className={searchResultAction === "TAGS" ? "active" : ""}
          onClick={changeToTags}
        >
          Tags
        </span>
        <span
          className={searchResultAction === "USERS" ? "active" : ""}
          onClick={changeToUsers}
        >
          Users
        </span>
      </div>

      {searchResultAction === "QUICKIES" && (
        <SearchResultQuickies quickies={quickies} loading={searchQuickiesLoading} />
      )}
      {searchResultAction === "TAGS" && (
        <SearchResultTags tags={tags} loading={searchTagLoading} searchTerm={searchTerm} />
      )}
      {searchResultAction === "USERS" && (
        <SearchResultUsers users={users} searchTerm={searchTerm} loading={searchUserLoading} />
      )}
    </Wrapper>
  );
};

export default SearchResult;
