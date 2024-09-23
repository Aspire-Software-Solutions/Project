import React from "react";
import styled from "styled-components";
import CustomResponse from "../CustomResponse";
import Quickie from "../Quickie/Quickie";
import Loader from "../Loader";

const Wrapper = styled.div`
  position: relative;
`;

const SearchResultQuickies = ({ quickies, loading }) => {
  if (loading) return <Loader />;

  return (
    <Wrapper>
      {quickies.length ? (
        quickies.map((quickie) => (
          <Quickie key={quickie.id} quickie={quickie} />
        ))
      ) : (
        <CustomResponse text="No quickies found, try a different search" />
      )}
    </Wrapper>
  );
};

export default SearchResultQuickies;
