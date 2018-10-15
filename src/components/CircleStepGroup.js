import React from 'react';
import styled from 'styled-components';

export default function CircleStepGroup(props) {
  return (
    <Root {...props}/>
  );
}

CircleStepGroup.Item = function CircleStepItem(props) {
  const { text, active } = props;
  return (
    <ItemRoot data-state={active ? 'active' : 'inactive'}>
      <ItemText>{text}</ItemText>
      <ItemCircle/>
    </ItemRoot>
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
`;

const ItemRoot = styled.div`
  position: relative;
  width: 125px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:first-child .circle {
    border-color: #F5633A;
  }

  &[data-state='active'] .circle {
    background-color: #F5633A;
    border-color: #F5633A;
  }

  &:not(:last-child) .circle::after {
    content: '';
    background-color: #D8D8D8;
    position: absolute;
    width: 101px;
    left: 23px;
    top: 50%;
    height: 1px;
  }

  &[data-state='active'] + &[data-state='inactive'] .circle {
    border-color: #F5633A;
  }

  &[data-state='active'] .circle::after {
    background-color: #F5633A;
  }
`;

const ItemText = styled.div`
  color: #D8D8D8;
  font-size: 10px;
  font-weight: 600;
  line-height: 14px;
  margin-bottom: 7px;
`;

const ItemCircle = styled.div.attrs({className: 'circle'})`
  position: relative;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 2px solid #D8D8D8;
  transition: background-color 0.2s, border-color 0.2s;
`;