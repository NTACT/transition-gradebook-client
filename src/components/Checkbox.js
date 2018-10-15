import React from 'react';
import styled from 'styled-components';

export default function CheckboxButton(props) {
  const { children, checked, onChange, name, label, disabled, checkboxColor, labelColor, ...rest } = props;
  const _onChange = disabled ? null : onChange;

  return (
    <Root {...rest} onClick={_onChange} disabled={disabled}>
      <Checkbox color={checkboxColor}>
        {checked && <Check/>}
      </Checkbox>
      <Input checked={checked} onChange={_onChange} name={name} disabled={disabled}/>
      <Label color={labelColor}>{label || children}</Label>
    </Root>
  );
}

const Root = styled.div`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
`;

const Input = styled.input.attrs({type: 'checkbox'})`
  display: none;
`;

const Label = styled.label`
	color: ${props => props.color || '#555555'};
	font-family: "Open Sans";
	font-size: 14px;
  line-height: 17px;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-weight: 200;
`;

const Checkbox = styled.div`
  position: relative;
  display: inline-block;
  min-width: 14px;
  height: 14px;
  border: 2px solid ${props => props.color || '#4A4A4A'};
  margin-right: 10px;
  top: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Check = styled.div.attrs({
  children: () => '\u00D7' // ×
})`font-weight: 900`;
