import styled from 'styled-components';

export default styled.ul`
  list-style: none;
  display: flex;
  justify-content: ${props => props.flipped ? 'flex-start' : 'flex-end'};
  padding-top: 26px;
  padding-left: 0; // override default user agent ul style
  margin: 0;
`;
