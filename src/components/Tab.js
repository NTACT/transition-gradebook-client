import styled from 'styled-components';
import * as breakpoints from '../breakpoints';

export default styled.li`
    color: ${props => props.active 
        ? (props.activeTextColor || '#D43425' )
        : (props.inactiveTextColor || 'white')
    };
    background-color: ${props => props.active
        ? (props.activeBackgroundColor || 'white') 
        : (props.inactiveBackgroundColor || '#D43425')
    };
    font-family: 'Oswald', sans-serif;
    font-size: 16px;
    text-align: center;
    text-transform: uppercase;
    min-width: 142px;
    padding: 10px 20px 10px 20px;
    border-radius: 5px 5px 0 0;
    cursor: pointer;

    * + & {
        margin-left: 8px;
    }

    &:last-child {
        margin-right: 8px;
    }

    @media ${breakpoints.small} {
        flex: 1 1 100%;
        font-size: 14px;
        min-width: 0;

        &:last-child {
            border-top-right-radius: 0;
            margin-right: 0;
        }

        &:first-child {
            border-top-left-radius: 0;
        }
    }
`;
