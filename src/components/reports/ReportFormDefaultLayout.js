import styled from 'styled-components';
import * as breakpoints from '../../breakpoints';

export default styled.div`
  display: flex;
  flex-wrap: wrap;

  & > * {
    margin-top: 25px;
    margin-right: 20px;
    flex-basis: calc(50% - 20px);
  }

  @media ${breakpoints.small} {
    & > * {
      flex: 1 1 100%;
      margin: 0;
      width: 100%;
    }

    > * + * {
      margin-top: 12px;
    }
  }
`;