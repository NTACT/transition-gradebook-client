import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { csvDataHelper } from 'tgb-shared';
import onClickOutside from 'react-onclickoutside';
import Column from './Column';
import Spinner from './Spinner';
import Row from './Row';


const CSVStudentUploadPreview = (props) => {
    const { csvData = [], selected = [], onCSVCellChange, onCSVCellFocusChange, ...rest} = props;
    
    const [editableField, setEditableField] = useState({rowId: null, cellId: null});
    const [focused, setFocused] = useState(false);
    const [loading, setLoading] = useState(true);

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

    function handleValueChange(type, e) {
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
        // Could be booleans
        const displayValue = value !== undefined && value !== null ? value.toString() : ''; 
        return <ReadonlyCell title={displayValue}>{displayValue}</ReadonlyCell>;
    }

    function renderEditable(field, value) {
        let type;
        const fieldType = field.type;
        switch(fieldType) {
            case csvDataHelper.types.boolean:
                type = 'checkbox';
                return <EditableYesNoSelect value={value} onChange={e => handleValueChange(type, e)} autoFocus/>
            case csvDataHelper.types.enum:
                return <EditableSelect options={field.enumValues || field.validValues} value={value} onChange={e => handleValueChange(type, e)} />
            case csvDataHelper.types.date:
                type = 'date';
                break;
            default:
                type = 'text';
        }
        return (
            <EditableCell type={type} value={value} onChange={(e) => handleValueChange(type, e)} autoFocus />
        );
    }

    function renderCells(entry) {
        return (
            <>
            {csvDataHelper.columns.map(column => {
                const cell = entry[column.field];
                return (
                    <Cell 
                        key={cell.id} 
                        isError={!!cell.error} 
                        isWarning={!!cell.warning || entry.currentStudent} 
                        selected={isSelected(cell)} 
                        onClick={() => onClick(entry.id, cell.id)}
                    >
                        <CellContent>
                            {column.field === 'studentId' && !entry.currentStudent && (
                                <NewStudentDotAndHover />
                            )}
                            {editableField && editableField.cellId === cell.id ? renderEditable(column, cell.value) : renderReadonly(cell.value)}
                        </CellContent>
                        {cell.error && <WarningErrorHover>{cell.error}</WarningErrorHover>}
                        {cell.warning && <WarningErrorHover>{cell.warning}</WarningErrorHover>}
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

    useEffect(() => {
        setLoading(false);
    }, []);

    // Present a message while loading. Mostly for large files
    if(loading) {
        return (
            <Root {...rest}>
                <LoadingContainer>
                    <Loading />
                </LoadingContainer>
            </Root>
        );
    }

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

const CellHover = styled(Column)`
    height: 40px;	
    width: 145px;	
    background-color: #F5633A;
    position: absolute;
    color: #FFFFFF;	
    font-family: "Open Sans";	
    font-size: 12px;	
    font-style: italic;	
    line-height: 17px;
    justify-content: center;
    padding: 3px 16px;
    z-index: 2;
    display: none;

    &:after {
        content: "";
        position: absolute;
        bottom: -10px;
        left: 58px;
        border-width: 10px 10px 0;
        border-style: solid;
        border-color: #F5633A transparent;
        display: block;
        width: 0;
    }
`;

const WarningErrorHover = styled(CellHover)`
    bottom: 62px;
`;

const CellWidth = css`width: 150px;`;

const Root = styled(Column)`
    background-color: #FFFFFF;
    width: 100%;
    font-family: "Open Sans";
    background-color: #F2F2F2;
`;

const ScrollableContainer = styled(Column)`
    overflow: auto;
    height: 100%;
    position: relative;
`;


const CSVContainer = styled('table')`
    border-spacing: 0;
    table-layout: fixed;
    position: relative;
    left: 55px;
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

    &:hover {
        ${WarningErrorHover} {
            display: flex;
        }
    }
`;

const ReadonlyCell = styled('div')`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    ${CellWidth}
`;

const HeaderRow = styled('tr')`
    >:first-child {
        border-left: none;
    }
    >:last-child {
        border-right: none;
    }
`

const HeaderCell = styled('th')`
    height: 20px;
    border: 1px solid #D8D8D8;
    border-top: none;
    padding: 2px 5px;
    text-align: left;
    ${CellWidth}
`;

const editableCellStyle = css`
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


const EditableCell = styled.input.attrs({type: 'text'})`
    ${editableCellStyle}
`;

const EditableSelect = styled(({value, options, onChange}) => (
    <select value={value} onChange={onChange}>
        <option value="" />
        {options.map(selectOption => <option key={selectOption} value={selectOption}>{selectOption}</option>)}
    </select>
))`
    ${editableCellStyle}
`;

const EditableYesNoSelect = styled(({value, onChange}) => (
    <select value={value} onChange={onChange}>
        {(value === undefined || value === null) && (<option value="" />)}
        <option value="true">Yes</option>
        <option value="false">No</option>
    </select>
))`
  ${editableCellStyle}
`;


const LoadingContainer = styled(Column)`
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
`;
const LoadingMessage = styled(Column)`
    justify-content: center;
    align-items: center;
`;

const Loading = () => (
    <LoadingMessage>
        <Spinner />
        <div>Loading preview. Please wait...</div>
    </LoadingMessage>
);


const NewStudentHover = styled((props) => (
    <CellHover {...props}><div>New Student with no existing information</div></CellHover>
))`
    top: -45px;
    left: -65px;
`;




const NewStudent = styled(({children, ...rest}) => (
    <div {...rest}>
        {children}
    </div>
))`
    height: 6px;	
    width: 6px;	
    background-color: #F5633A;
    border-radius: 50%;
`;

const CellContent = styled(Row)`
    justify-content: center;
    align-items: center;
    position: relative;
    ${NewStudent} {
        margin-right: 6px;
    }
`;

const NewStudentDotAndHover = styled((props) => (
    <Column {...props}>
        <NewStudent/>
        <NewStudentHover />
    </Column>
))`
    ${NewStudent}:hover ~ ${NewStudentHover} {
        display: flex;
    }
`;

