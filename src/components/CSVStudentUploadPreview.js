import React from 'react';
import styled, { css } from 'styled-components';
import { csvDataHelper } from 'tgb-shared';
import Column from './Column';


function CSVStudentUploadPreview(props) {
    const { csvData = [], selected = [], ...rest} = props;
    
    function isSelected(data) {
        return !!selected.find(selectedItem => selectedItem.id === data.id);
    }

    return (
        <Root {...rest}>
            <ScrollableContainer>
                <CSVContainer>
                    <CSVHead>
                        {csvDataHelper.columns.map(column => <HeaderCell key={column.headerText}>{column.headerText}</HeaderCell>)}
                    </CSVHead>
                    <CSVBody>
                        {csvData.map(entry => (
                            <CSVEntry key={entry.id}>
                                {entry.values.map(data => (<Cell key={data.id} isError={data.isError} isWarning={data.isWarning} selected={isSelected(data)}>{data.value}</Cell>))}
                            </CSVEntry>
                        ))}
                    </CSVBody>
                </CSVContainer>
            </ScrollableContainer>
        </Root>
    );
}


export default styled(CSVStudentUploadPreview)``;


const Root = styled(Column)`
    background-color: #FFFFFF;
    width: 100%;
    padding: 17px 11px;
    font-family: "Open Sans";
`;

const ScrollableContainer = styled(Column)`
    overflow: auto;
`;


const CSVContainer = styled('table')`
    border-spacing: 0;
`;

const CSVHead = styled('thead')`
    color: #F5633A;	
    font-family: "Open Sans";	
    font-size: 12px;	
    font-weight: bold;	
    line-height: 17px;
    >:first-child {
        border-left: none;
    }
    >:last-child {
        border-right: none;
    }
`;

function getColors(props) {
    const { selected, isWarning, isError} = props;
    if(!selected || (!isWarning && !isError)) {
        return css`
            color: #4A4A4A;
            background-color: #FFFFFF;
        `;
    }
    if(isWarning) {
        return css`
            color: #FFFFFF;
            background-color: #D43425;
        `;
    }
    // isError
    return css`
        color: #FFFFFF;
        background-color: #A20B0E;   
    `;
}

const CSVBody = styled('tbody')`
    color: #4A4A4A;	
    font-size: 11px;	
    font-style: italic;	
    line-height: 15px;
    background-color: #FFFFFF;
`;

const CSVEntry = styled('tr')`
    >:first-child {
        border-left: none;
    }
    >:last-child {
        border-right: none;
    }
`;

const Cell = styled('td')`
    height: 20px;
    border: 1px solid #D8D8D8;
    padding: 2px 5px;
    text-align: left;
    ${getColors}
`;

const HeaderCell = styled('th')`
    height: 20px;
    border: 1px solid #D8D8D8;
    border-top: none;
    padding: 2px 5px;
    text-align: left;
`;