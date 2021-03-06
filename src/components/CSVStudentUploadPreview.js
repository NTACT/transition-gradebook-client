import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled, { css } from 'styled-components';
import chunk from 'lodash/chunk';
import { csvDataHelper } from 'tgb-shared';
import Column from './Column';
import Spinner from './Spinner';
import Row from './Row';
import useOnClickOutside from '../utils/useOnClickOutside';


const CSVStudentUploadPreview = (props) => {
    const { csvData = [], selected = [], hoverOver, lastSelected, onCSVCellChange, onCSVCellFocusChange, ...rest} = props;
    
    const [editableField, setEditableField] = useState({rowId: null, cellId: null});
    const [focused, setFocused] = useState(false);
    const [loading, setLoading] = useState(true);
    const ref = useRef(null);
    const pages = chunk(csvData, 50);
    const [page, setPage] = useState(0);
    const [focusRequest, setFocusRequest] = useState(null);

    // Map cells to pages for quick "jump to"
    const cellsByPage = useMemo(() => {
        const cellMap = {}
        for (let i = 0; i < pages.length; i++) {
            const pageRows = pages[i];
            for(const row of pageRows) {
                for (const cell in row) {
                    if (row.hasOwnProperty(cell)) {
                        const element = row[cell];
                        cellMap[element.id] = i;
                    }
                }
            }
        }
        return cellMap;
    }, [pages]);


    function isSelected(cell) {
        return !!selected.find(selectedItem => selectedItem === cell.id) || hoverOver === cell.id;
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

    function focusCell(cellId) {
        const pg = cellsByPage[cellId];
        if(typeof pg !== 'undefined') {
            setPage(pg);
            setFocusRequest({cellId, page: pg});
        }
    }

    useEffect(() => {
        if(focusRequest && focusRequest.page === page) {
            const focused = document.getElementById(focusRequest.cellId);
            if(!focused) return;
            // cell (focused element) => table => container div
            const offsetParent = focused.offsetParent.offsetParent;
            offsetParent.scrollTo(focused.offsetLeft - 200, focused.offsetTop);
            setFocusRequest(null);
        }
    }, [focusRequest, page]);



    useEffect(() => {
        if(lastSelected) {
            focusCell(lastSelected);
        }
    }, [lastSelected]);

    function pageForward() {
        setPage(Math.min(page + 1, pages.length - 1));
    }

    function pageBackward() {
        setPage(Math.max(0, page - 1));
    }

    function pageTo(idx) {
        if(idx < 0) idx = 0;
        if(idx > pages.length - 1) idx = pages.length - 1;
        setPage(idx);
    }

    function renderCells(entry, rowNumber) {
        return (
            <>
            {csvDataHelper.columns.map(column => {
                const cell = entry[column.field];
                const editMode = editableField && editableField.cellId === cell.id;
                return (
                    <Cell 
                        key={cell.id} 
                        id={cell.id}
                        isError={!!cell.error} 
                        isWarning={!!cell.warning || entry.currentStudent} 
                        selected={isSelected(cell)} 
                        onClick={() => onClick(entry.id, cell.id)}
                        editMode={editMode}
                    >
                        <CellContent>
                            {column.field === 'studentId' && (!entry.currentStudent ? (
                                <NewStudentDotAndHover firstThree={rowNumber <= 3}/>
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

    useEffect(() => {
        setLoading(false);
    }, []);

    useOnClickOutside(ref, focusChangeListener);

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
            <ScrollableContainer innerRef={ref}>
                <CSVContainer>
                    <CSVHead>
                        <HeaderRow>
                            {csvDataHelper.columns.map(column => <HeaderCell key={column.headerText}>{column.headerText}</HeaderCell>)}
                        </HeaderRow>
                    </CSVHead>
                    <CSVBody>
                        {pages[page].map((row, rowIdx) => (
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
            {pages.length > 1 && (
                <Pagination>
                    <PaginationLink onClick={pageBackward}>&lt;</PaginationLink>
                    {pages.map((_, idx) => (
                        <PaginationLink key={`page_${idx}`} onClick={() => pageTo(idx)} selected={idx === page}>{idx + 1}</PaginationLink>
                    ))}
                    <PaginationLink onClick={pageForward}>&gt;</PaginationLink>
                </Pagination>
            )}
        </Root>
    );
}

export default styled(CSVStudentUploadPreview)``;

const CellHover = styled(Column)`
    height: 70px;	
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

    ${props => props.editMode && css`
        padding-top: 0;
        padding-bottom: 0;
    `};

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

const EditableSelect = styled(({value, options, onChange, ...rest}) => (
    <select value={value} onChange={onChange} {...rest}>
        <option value="">Select an option</option>
        {options.map(selectOption => <option key={selectOption} value={selectOption}>{selectOption}</option>)}
    </select>
))`
    ${editableCellStyle}
`;

const EditableYesNoSelect = styled(({value, onChange, ...rest}) => (
    <select value={value} onChange={onChange} {...rest}>
        <option value="" disabled hidden></option>
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
    <WarningErrorHover {...props}><div>New Student with no existing information</div></WarningErrorHover>
))`

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
    ${CellWidth}
    ${NewStudent}, ${ExistingStudent} {
        margin-right: 6px;
    }
`;

const NewStudentDotAndHover = styled(({firstThree,...rest}) => (
    <Column {...rest}>
        <NewStudent/>
        <NewStudentHover firstThree={firstThree} />
    </Column>
))`
    ${NewStudent}:hover ~ ${NewStudentHover} {
        display: flex;
    }
`;


const EditableArrayField = ({value, onChange, ...rest}) => {
    let displayValue = value;
    if(Array.isArray(value)) {
        displayValue = value.join(' ');
    }
    return <EditableCell type="text" value={displayValue} onChange={onChange} {...rest}/>
};

const PaddingRow = styled(CSVEntry)`
    height: 100%;
`;

const Pagination = styled.span`
    margin-left: auto;
    margin-top: 5px;
`;

const PaginationLink = styled.a`
    float: left;
    padding: 8px 16px;
    text-decoration: none;
    font-family: "Open Sans";	
    font-size: 12px;	
    font-weight: bold;
    cursor: pointer;
    border: 1px solid grey;
    

    ${props => props.selected && css`
        color: white;
        background-color: #F5633A;
    `}
`;