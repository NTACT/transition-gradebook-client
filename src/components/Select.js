import React from 'react';
import styled from 'styled-components';

export default function Select(props) {
  const { 
    value,
    onChange,
    children,
    placeholder,
    inverted,
    disabled,
    canSelectPlaceholder,
    Handle=DefaultHandle,
    name,
    ...rest,
  } = props;

  return (
    <Root {...rest} inverted={inverted}>
      <Dropdown name={name} onChange={onChange} value={value || ''} disabled={disabled}>
        {placeholder && <option value='' disabled={!canSelectPlaceholder}>{placeholder}</option>}
        {children}
      </Dropdown>
      <HandleWrapper>
        <Handle inverted={inverted}/>
      </HandleWrapper>
    </Root>
  )
}

const Root = styled.div`
  position: relative;
  height: 40px;
  background-color: ${props => props.inverted ? '#4A4A4A' : 'white'};
  color: ${props => props.inverted ? 'white' : '#4A4A4A'};
  font-size: 16px;
`;

const Dropdown = styled.select`
  height: 100%;
  width: 100%;
  padding-left: 20px;
  background-color: inherit;
  font-family: 'Open sans';
  border: 0;
  outline: 0;
  border-radius: 0;
  color: inherit;
  font-size: inherit;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  &::-ms-expand { display: none; }

  &:disabled {
    background-color: #CCC;
  }
`;

const HandleWrapper = styled.div`
  width: 19px;
  height: 19px;
  position: absolute;
  right: 6px;
  top: 0;
  height: 100%;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DefaultHandle = styled.div`
  background-image: ${props => props.inverted
    ? `url(${require('../assets/select_icon_light.png')})`
    : `url(${require('../assets/select_icon.png')})`
  };
  background-size: 100% 100%;
  height: 19px;
  width: 19px;
`;
