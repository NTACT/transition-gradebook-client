import styled from 'styled-components';
import * as breakpoints from '../breakpoints';

export default styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  & + & {
    margin-left: 20px;
  }

  @media ${breakpoints.small} {
    width: 100%;

    & + & {
      margin-left: 0;
      margin-top: 12px;
    }
  }
`;
