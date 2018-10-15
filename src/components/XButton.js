import React from 'react';
import styled from 'styled-components';
import Button from './Button';
import { RedCircleX } from './Icons';


export default function XButton(props) {
  const { component, ...rest } = props;
  const Component = component || Button;
  return (<Component {...rest}><Icon/></Component>);
}

const Icon = styled(RedCircleX).attrs({alt: 'Close'})`
  width: 22px;
  height: 22px;
`;
