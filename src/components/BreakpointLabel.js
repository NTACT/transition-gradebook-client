// BreakpointLabel renders all active breakpoints in the top right corner
// Renders nothing in production.

import React from 'react';
import styled from 'styled-components';
import * as breakpoints from '../breakpoints';

let BreakpointLabel;

if(process.env.NODE_ENV === 'development') {
  const breakpointLabels = Object.entries(breakpoints).map(([name, bp]) => {
    return styled(props => <div {...props}>{name}</div>)`
      display: none;
      @media ${bp} {
        display: block;
      }
    `;
  });

  BreakpointLabel = styled(props => 
    <div {...props}>
      {breakpointLabels.map((B, i) => <B key={i}/>)}
    </div>
  )`
    position: fixed;
    left: 0px;
    top: 0px;
    display: flex;
    flex-direction: column;
    z-index: 1000;
  `;
} else {
  // in production, render nothing
  BreakpointLabel = () => null;
}

export default BreakpointLabel;
