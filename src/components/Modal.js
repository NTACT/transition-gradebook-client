import React, { Component } from 'react';
import styled from 'styled-components';

export default class Modal extends Component {
  handleClick = event => {
    const { onOverlayClick } = this.props;
    if(onOverlayClick && event.target === event.currentTarget) onOverlayClick(event);
  };

  render() {
    const { open, renderOnOverlay, onOverlayClick, ...rest } = this.props;

    return (
      <Root open={open} onClick={this.handleClick}>
        {renderOnOverlay}
        <Window {...rest}/>
      </Root>
    );
  }
}

const Root = styled.div`
  opacity: ${props => props.open ? 1 : 0};
  pointer-events: ${props => props.open ? 'default' : 'none'};
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: auto;
  z-index: 100;
  transition: opacity 0.2s;
  background-color: rgba(0,0,0,0.5);
`;

const Window = styled.div`
  position: absolute;
  left: 50%;
  top: 10%;
  transform: translate(-50%, 0);
  max-height: 80%;
  overflow: auto;
  background-color: white;
  margin-bottom: 20px;
`;
