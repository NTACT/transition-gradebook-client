import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { csvDataHelper } from 'tgb-shared';
import onClickOutside from 'react-onclickoutside';
import Column from './Column';
import Spinner from './Spinner';
import Row from './Row';


const CSVStudentUploadPreview = (props) => {
    const { csvData = [], selected = [], lastSelected, onCSVCellChange, onCSVCellFocusChange, ...rest} = props;
    
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
                return <EditableYesNoSelect value={value} onChange={handleValueChange} autoFocus/>
            case csvDataHelper.types.enum:
                return <EditableSelect options={field.enumValues || field.validValues} value={value} onChange={handleValueChange} />
            case csvDataHelper.types.date:
                type = 'date';
                break;
            case csvDataHelper.types.array:
                return <EditableArrayField value={value} onChange={handleValueChange} autoFocus />
            default:
                type = 'text';
        }
        return (
            <EditableCell type={type} value={value} onChange={handleValueChange} autoFocus />
        );
    }

    function renderWarningHover(entry, cell, rowNumber) {
        // If there are no warnings or if there is an error (errors take priority), dont render
        if(!cell.warning || cell.error) {
            return null;
        }
        return <WarningErrorHover large={entry.currentStudent} firstThree={rowNumber <= 3}>{cell.warning}</WarningErrorHover>
    }


    function renderCells(entry, rowNumber) {
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
                            {column.field === 'studentId' && (!entry.currentStudent ? (
                                <NewStudentDotAndHover />
                            ) : (
                                <ExistingStudent />
                            ))}
                            {editableField && editableField.cellId === cell.id ? renderEditable(column, cell.value) : renderReadonly(cell.value)}
                        </CellContent>
                        {cell.error && <WarningErrorHover firstThree={rowNumber <= 3} large={column.field === 'disabilities'}>{cell.error}</WarningErrorHover>}
                        {renderWarningHover(entry, cell, rowNumber)}
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
                        {csvData.map((row, rowIdx) => (
                            <CSVEntry key={row.id}>
                                {renderCells(row, rowIdx + 1)}
                            </CSVEntry>
                        ))}
                        {csvData.length <= 21 && (
                            <PaddingRow>
                                {csvDataHelper.columns.map(column => <Cell key={`padding_cell_${column.headerText}`}/>)}
                            </PaddingRow>
                        )}
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

function handleFirstThreeRows({firstThree}) {
    if(firstThree) {
        // change the little arrow from the bottom to the top 
        return css`
            top: 20px;
            &:after {
                bottom: 100%;
                border-width: 0px 10px 10px 10px;
            }
        `;
    } else {
        return css`
            top: -76px;
        `;
    }
}

const WarningErrorHover = styled(CellHover)`
    ${handleFirstThreeRows}
    ${props => props.large && css`height: 75px;`}
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
    min-height: 150px;
    height: 100%;
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
    position: relative;
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
        <option value="Yes">Yes</option>
        <option value="No">No</option>
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

const ExistingStudent = styled.div`
    height: 6px;	
    width: 6px;	
    background-color: transparent;
    border-radius: 50%;
`;

const CellContent = styled(Row)`
    justify-content: center;
    align-items: center;
    position: relative;
    ${NewStudent}, ${ExistingStudent} {
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


const EditableArrayField = ({value, onChange}) => {
    let displayValue = value;
    if(Array.isArray(value)) {
        displayValue = value.join(' ');
    }
    return <EditableCell type="text" value={displayValue} onChange={onChange} />
};

const PaddingRow = styled(CSVEntry)`
    height: 100%;
`;