import styled from 'styled-components';
import * as breakpoints from '../breakpoints';

export default styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  & + & {
    margin-top: 12px;
  }

  @media ${breakpoints.small} {
    flex-direction: column;

    >div {
      width: 100%;
    }

    >div + div {
      margin-left: 0;
    }
  }
`;
