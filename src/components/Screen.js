import React from 'react';
import styled from 'styled-components';
import NavigationBar from './NavigationBar';
import * as breakpoints from '../breakpoints';

export default function Screen(props) {
  return (
    <Root>
      <NavigationBar/>
      <Content {...props}/>
    </Root>
  )
}

const Root = styled.div`
  height: 100%;
  overflow: hidden;
  padding-top: ${NavigationBar.desktopHeight}px;
  position: relative;
  display: flex;
  flex-direction: column;

  @media ${breakpoints.small} {
    padding-top: ${NavigationBar.mobileHeight}px;
  }
`;

const Content = styled.div`
  height: 100%;
  display: flex;
`;