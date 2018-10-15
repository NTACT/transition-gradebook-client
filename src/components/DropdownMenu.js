import React, { Component } from 'react';
import styled from 'styled-components';

class DropdownMenu extends Component {
  render() {
    const { header, children, ...rest } = this.props;
    return (
      <Root {...rest}>
        {header}
        <Items>{children}</Items>
      </Root>
    );
  }
}

export default DropdownMenu;

const Root = styled.div`
  position: relative;

  &:hover > div {
    display: block;
  }
`;

const Items = styled.div`
  display: none;
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translateY(100%);
  z-index: 200;
`;

DropdownMenu.Item = styled.div`
  position: relative;
  top: 10px;
  display: block;
  background-color: #F5633A;
  color: white;
  padding: 6px 45px 6px 45px;
  font-size: 14px;
  width: 192px;
  text-decoration: none;
  cursor: pointer;
  border-top: 1px solid #EE391F;

  &:first-child {
    border-top: none;
  }

  &:hover {
    background-color: #F88B6D;
    color: #A20B0E;
  }

  /* This ::after stuff is for the little triangle */
  &:first-child::after {
    content: '';
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #F5633A;
    position: absolute;
    right: 0;
    top: -10px;
  }

  &:hover:first-child::after {
    border-bottom: 10px solid #F88B6D;
  }
`;