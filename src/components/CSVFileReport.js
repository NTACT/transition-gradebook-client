import React from 'react';
import styled, { css } from 'styled-components';
import Column from './Column';
import Row from './Row';

const CSVFileReport = ({ errors = [], warnings = [], selectedErrors = [], selectedWarnings = [], onErrorEnter, onErrorLeave, onErrorClick, onWarningEnter, onWarningLeave, onWarningClick }) => (
    <FileUploadReportContainer>
        <ReportWithLabel>
            <ReportLabel>Errors</ReportLabel>
            {errors.length > 0 ? (
                <FileErrorReport
                    errors={errors}
                    selectedErrors={selectedErrors}
                    onErrorEnter={onErrorEnter}
                    onErrorLeave={onErrorLeave}
                    onErrorClick={onErrorClick}
                />
            ) : (<CleanReport><div>No Errors</div></CleanReport>)}
        </ReportWithLabel>
        <ReportWithLabel>
            <ReportLabel>Warnings</ReportLabel>
            {warnings.length > 0 ? (
                <FileWarningReport
                    warnings={warnings}
                    selectedWarnings={selectedWarnings}
                    onWarningClick={onWarningClick}
                    onWarningEnter={onWarningEnter}
                    onWarningLeave={onErrorLeave}
                />
            ) : (<CleanReport><div>No Warnings</div></CleanReport>)}
        </ReportWithLabel>
    </FileUploadReportContainer>
);

export default styled(CSVFileReport)``;


const FileErrorReport = ({ errors = [], selectedErrors = [], onErrorEnter, onErrorLeave, onErrorClick }) => (
    <ErrorReport>
        <ReportInfo>
            We found some issues with your data. Please navigate to the errors below and correct them to be able to import.
        </ReportInfo>
        <ReportCount>{errors.length} Errors</ReportCount>
        <ReportList>
            {errors.map((error, idx) => (
                <ListItem
                    key={error.id}
                    onClick={() => onErrorClick(error)}
                    onMouseEnter={onErrorEnter}
                    onMouseLeave={onErrorLeave}
                    selected={selectedErrors.find(selected => selected && selected.id === error.id)}
                >
                    Error number {idx + 1}
                </ListItem>
            ))}
        </ReportList>
    </ErrorReport>
);

const FileWarningReport = ({ warnings = [], selectedWarnings = [], onWarningEnter, onWarningLeave, onWarningClick }) => (
    <WarningReport>
        <ReportInfo>
            We found some issues with your data. We can continue with the import, but take a look at the highlighted areas and correct if needed.
        </ReportInfo>
        <ReportCount>{warnings.length} Errors</ReportCount>
        <ReportList>
            {warnings.map((warning, idx) => (
                <ListItem
                    key={warning.id}
                    onClick={() => onWarningClick(warning)}
                    onMouseEnter={onWarningEnter}
                    onMouseLeave={onWarningLeave}
                    selected={selectedWarnings.find(selected => selected && selected.id === warning.id)}
                >
                    Warning number {idx + 1}
                </ListItem>
            ))}
        </ReportList>
    </WarningReport>
);

const CleanReport = styled(Row)`
    background-color: #4A4A4A;
    color: #D8D8D8;	
    font-family: "Open Sans";	
    font-size: 14px;	
    font-style: italic;	
    line-height: 19px;
    height: 35px;
    align-items: center;
`;

const ReportLabel = styled(Row)`
	color: #F5633A;	
    font-family: "Open Sans";	
    font-size: 14px;	
    font-weight: bold;	
    line-height: 19px;
    font-style: normal;
`;
const ErrorReport = styled(Column)`
    background-color: #A20B0E;
    padding: 10px;
`;

const WarningReport = styled(Column)`
    background-color: #D43425;
    padding: 10px;
`;

const ReportInfo = styled(Column)`
    color: #FFFFFF;	
    font-family: "Open Sans";	
    font-size: 12px;	
    font-style: italic;	
    line-height: 17px;
`;

const ReportList = styled(Column)`
`;

const ListItem = styled(Row)`
    color: #FFFFFF;
    font-family: "Open Sans";	
    cursor: pointer;
    font-size: 12px;	
    &:hover {
        color: #4A4A4A;
    }

    ${props => props.selected && css`color: #4A4A4A;`} 
`;

const ReportCount = styled(Row)`
color: #FFFFFF;
font-weight: bold;
font-family: "Open Sans";	
margin-top: 5px;
font-size: 12px;
`;

const ReportWithLabel = styled(Column)`
    width: 100%;
    max-width: 300px;
    margin-left: 40px;
`;




const FileUploadReportContainer = styled(Column)`
    width: 100%;
    max-width: 300px;
    align-self: flex-start;
    ${ReportWithLabel} + ${ReportWithLabel} {
        margin-top: 20px;
    }
`;

