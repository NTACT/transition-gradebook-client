import React, { Component } from 'react';
import styled from 'styled-components';

class Tooltip extends Component {
  render() {
     const { children, text } = this.props
     return (
       <TooltipComponent> 
         {children}
         <span className="tooltiptext">
           {text}
         </span>
       </TooltipComponent>
     )
  }
}
export default Tooltip;

const TooltipComponent = styled.div`
  position: relative;
  display: inline-block;

  .tooltiptext {
    display: flex;
    width: 140px;
    background-color: #F5633A;
    color: #FFF;
    text-align: center;
    border-radius: 2px;
    padding: 3px;
    position: absolute;
    z-index: 1;
    margin: -60px;
    font-size: 12px;
    font-style: italic;
    top: 25%;
  }

  .tooltiptext::after {
    content: " ";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #F5633A transparent transparent transparent;
  }
`