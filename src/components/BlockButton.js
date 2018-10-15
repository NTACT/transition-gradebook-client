import Button from './Button';
import styled from 'styled-components';

const defaultColor = '#D43425'; // red
const defaultHoverColor = '#99251b'; // darker red
const defaultDisabledColor = '#757575';

export default styled(Button)`
  color: ${props => props.textColor || 'white'};
  background-color: ${props => props.color || defaultColor};
  min-height: 50px;
  font-family: 'Oswald', sans-serif;
  font-size: 16px;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${props => props.hoverColor || props.color || defaultHoverColor};
  }

  &:disabled {
    background-color: ${props => props.disabledColor || defaultDisabledColor};
  }
`;
