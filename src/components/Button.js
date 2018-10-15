import styled from 'styled-components';

export default styled.button`
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  width: auto;
  background-color: inherit;

  &:disabled {
    cursor: default;
  }
`;
