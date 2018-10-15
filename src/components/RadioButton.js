import React from 'react';
import styled from 'styled-components';

export default function RadioButton(props) {
  const { name, checked, onChange, label, children, ...rest } = props;

  return (
    <Root {...rest} onClick={onChange}>
      <Checkbox>
        {checked && <Check/>}
      </Checkbox>
      <Input name={name} checked={checked} onChange={onChange}/>
      <Label>{label || children}</Label>
    </Root>
  );
}

const Root = styled.div`
  display: inline-flex;
  flex-direction: row;
  cursor: pointer;
`;

const Input = styled.input.attrs({type: 'radio'})`
  display: none;
`;

const Label = styled.label`
	color: #555555;
	font-family: "Open Sans";
	font-size: 12px;
  line-height: 17px;
  margin-left: 7px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
`;

const Checkbox = styled.div`
  display: inline-block;
  min-width: 23px;
  height: 23px;
  border-radius: 50%;
  border: 2px solid #4A4A4A;
  margin-right: 7px;
  padding: 3px;
`;

const Check = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #D43425;
`;
