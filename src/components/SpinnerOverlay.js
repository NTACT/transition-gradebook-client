import React from 'react';
import styled from 'styled-components';
import Spinner from './Spinner';

export default function SpinnerOverlay(props) {
  const { children } = props;
  return (
    <Root {...props}>
      <Spinner/>
      {children && <Message>{children}</Message>}
    </Root>
  )
}

const Root = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255,255,255,0.8);
  z-index: 500;
  transition: opacity 0.5s;
  opacity: ${props => props.open ? 1 : 0};
  pointer-events: ${props => props.open ? 'auto' : 'none'};
  z-index: 100;
`;

const Message = styled.div`
  font-size: 18px;
  color: #D43425;
  margin-top: 50px;
`;