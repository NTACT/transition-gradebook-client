import React from 'react';
import styled from 'styled-components';
import Button from './Button';
import * as Icons from '../components/Icons';


export default props => {
    return (
        <Root {...props}>
            <FiltersIcon />
        </Root>
    );
}


const Root = styled(Button)`
  width: 50px;
  background: inherit;
`

const FiltersIcon = styled(Icons.OrangeSettings)`
  width: 25px;
  height: 20px;
`;