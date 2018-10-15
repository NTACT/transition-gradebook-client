import React, { Component } from 'react';
import styled from 'styled-components';
import Button from './Button';
import * as breakpoints from '../breakpoints';
import * as Icons from './Icons';

export default class MobileMenu extends Component {
  render() {
    const { onClose, children, ...rest } = this.props;

    return (
      <Root {...rest}>
        <CloseButton onClick={onClose}><CloseButtonIcon/></CloseButton>
        <Items>
          {children}
        </Items>
      </Root>
    );
  }
}

const Root = styled.div`
  display: none;
  flex-direction: column;
  align-items: center;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background-color: #F5633A;
  transition: opacity 0.2s;
  padding: 0 20px 0 20px;
  opacity: ${props => props.open ? 1 : 0};
  pointer-events: ${props => props.open ? 'default' : 'none'};

  @media ${breakpoints.small} {
    display: flex;
  }
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  
  >* {
    display: block;
    text-align: left;
    width: 100%;
    color: white;
    font-family: "Open Sans";
    font-size: 18px;
    line-height: 24px;
    padding: 0 20px 12px 20px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }

  >* + * {
    margin-top: 10px;
  }
`;

const CloseButton = styled(Button)`
  align-self: flex-end;
  margin: 12px -8px 24px;
`;

const CloseButtonIcon = styled(Icons.WhiteCircleX)`
  width: 22px;
  height: 22px;
`;
