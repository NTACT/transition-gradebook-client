import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { csvDataHelper } from 'tgb-shared';
import onClickOutside from 'react-onclickoutside';
import Column from './Column';


const CSVStudentUploadPreview = (props) => {
    const { csvData = [], selected = [], onCSVCellChange, onCSVCellFocusChange, ...rest} = props;
    
    const [editableField, setEditableField] = useState({rowId: null, cellId: null});
    const [focused, setFocused] = useState(false);

    function isSelected(cell) {
        return !!selected.find(selectedItem => selectedItem === cell.id);
    }

    function onClick(newRowId, newCellId) {
        const { rowId, cellId } = editableField;
        // Not the first time clicking into the cell and they moved to a different cell
        const focusChanged = rowId !== null && cellId !== null && cellId !== newCellId;
        setEditableField({rowId: newRowId, cellId: newCellId});
        setFocused(true);
        if(focusChanged && typeof onCSVCellFocusChange === 'function') {
            onCSVCellFocusChange();
        }
    }

    function handleValueChange(e) {
        if(!editableField) {
            return;
        }
        const newValue = e.target.value;
        const { rowId, cellId } = editableField;
        if(typeof onCSVCellChange === 'function') {
            onCSVCellChange(rowId, cellId, newValue);
        }
    }

    function renderReadonly(value) {
        return <ReadonlyCell title={value}>{value}</ReadonlyCell>;
    }

    function renderEditable(value) {
        return <EditableCell value={value} onChange={handleValueChange} autoFocus />
    }

    function renderCells(entry) {
        return (
            <>
            {csvDataHelper.columns.map(column => {
                const cell = entry[column.field];
                return (
                <Cell key={cell.id} isError={cell.error} isWarning={cell.warning} selected={isSelected(cell)} onClick={() => onClick(entry.id, cell.id)}>
                    {editableField && editableField.cellId === cell.id ? renderEditable(cell.value) : renderReadonly(cell.value)}
                </Cell>
                )
            })}
            </>
        );
    }

    /**
     * Used to make sure the last edit is transferred to parent components
     */
    function focusChangeListener() {
        if(focused) {
            setFocused(true);
            setEditableField({rowId: null, cellId: null});
            if(typeof onCSVCellFocusChange === 'function') {
                onCSVCellFocusChange();
            }
        }
    }

    CSVStudentUploadPreview.handleClickOutside = focusChangeListener;

    return (
        <Root {...rest}>
            <ScrollableContainer>
                <CSVContainer>
                    <CSVHead>
                        <HeaderRow>
                            {csvDataHelper.columns.map(column => <HeaderCell key={column.headerText}>{column.headerText}</HeaderCell>)}
                        </HeaderRow>
                    </CSVHead>
                    <CSVBody>
                        {csvData.map(row => (
                            <CSVEntry key={row.id}>
                                {renderCells(row)}
                            </CSVEntry>
                        ))}
                    </CSVBody>
                </CSVContainer>
            </ScrollableContainer>
        </Root>
    );
}

const clickOutsideConfig = {
    handleClickOutside: () => CSVStudentUploadPreview.handleClickOutside,
}

export default styled(onClickOutside(CSVStudentUploadPreview, clickOutsideConfig))``;

const CellWidth = css`width: 150px;`;

const Root = styled(Column)`
    background-color: #FFFFFF;
    width: 100%;
    padding: 17px 11px;
    font-family: "Open Sans";
`;

const ScrollableContainer = styled(Column)`
    overflow: auto;
    height: 100%;
`;


const CSVContainer = styled('table')`
    border-spacing: 0;
    table-layout: fixed;
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
    ${CellWidth}
`;

const ReadonlyCell = styled('div')`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    ${CellWidth}
`;

const HeaderRow = styled('tr')`

`

const HeaderCell = styled('th')`
    height: 20px;
    border: 1px solid #D8D8D8;
    border-top: none;
    padding: 2px 5px;
    text-align: left;
    ${CellWidth}
`;


const EditableCell = styled.input.attrs({type: 'text'})`
    width: inherit;
    height: 16px;
    outline: none;
    border: none;
    ${CellWidth}
    :focus {
        outline: none;
        border: none;
        padding: 0;
    }
`;