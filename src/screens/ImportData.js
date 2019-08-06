import { action, computed, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import * as breakpoints from '../breakpoints';
import BlockButton from '../components/BlockButton';
import Column from '../components/Column';
import CSVFileReport from '../components/CSVFileReport';
import FileInput from '../components/FileInput';
import * as Icons from '../components/Icons';
import Row from '../components/Row';
import Screen from '../components/Screen';
import Section from '../components/Section';
import Select from '../components/Select';
import TermSelect from '../components/TermSelect';
import CSVStudentUploadPreview from '../components/CSVStudentUploadPreview';


@withRouter
@inject('store')
@observer
class ImportData extends Component {

    @observable schoolYearId = null;
    @observable term = null;
    @observable file = null;
    @observable fileReport = null;
    @observable selectedErrors = [];
    @observable selectedWarnings = [];
    @observable hoveringError = null;
    @observable hoveringWarning = null;

    @action.bound
    handleSchoolYearChange(e) {
        this.schoolYearId = +e.target.value;
    }

    @action.bound
    handleTermChange(e) {
        this.term = e.target.value;
    }

    @action.bound
    handleFileChange(e) {
        this.file = e.target.value;
    }

    @computed
    get schoolYear() {
        if(this.schoolYearId === null) {
            return null;
        } 
        const { schoolYears } = this.props.store;
        return schoolYears.find(year => year.id === this.schoolYearId);
    }

    @computed 
    get termType() {
        const { schoolYear } = this;
        if(schoolYear) {
            return schoolYear.capitalizedTermType;
        }
        return 'Term';
    }

    @computed 
    get warnings() {
        if(this.fileReport) {
            return this.fileReport.warnings;
        }
        return  [];
    }

    @computed 
    get errors() {
        if(this.fileReport) {
            return this.fileReport.errors;
        }
        return [];
    }

    @action.bound
    handleWarningClick(warning) {
        if(this.selectedWarnings.find(warn => warn.id === warning.id)) {
            this.selectedWarnings = this.selectedWarnings.filter(warn => warn.id !== warning.id);
        } else {
            this.selectedWarnings.push(warning);
        }
    }

    @action.bound
    handleErrorClick(error) {
        if(this.selectedErrors.find(err => err.id === error.id)) {
            this.selectedErrors = this.selectedErrors.filter(err => err.id !== error.id);
        } else {
            this.selectedErrors.push(error);
        }
    }

    @action.bound
    handleWarningHover(warning) {
        this.hoveringWarning = warning;
    }

    @action.bound
    handleErrorHover(error) {
        this.hoveringError = error;
    }

    render() {
        const { schoolYearId, schoolYear, term, file, warnings, errors, selectedErrors, selectedWarnings, hoveringError, hoveringWarning} = this;
        const { schoolYears } = this.props.store;

        return (
            <Screen>
                <Main fullWidth>
                    <YearBar>
                        <YearLabel>School Year</YearLabel>
                        <YearSelect value={schoolYearId} onChange={this.handleSchoolYearChange}>
                            { /* Only allow the blank selection to show up when nothing has been changed yet */ }
                            {schoolYearId === null && <option value=""></option>}
                            {schoolYears.map(schoolYear =>
                                <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.year} - {schoolYear.year + 1}</option>
                            )}
                        </YearSelect>
                    </YearBar>
                    <Content>
                        <ImportFormContainer>
                            <ImportDataForm 
                                years={schoolYears}
                                selectedYearId={schoolYearId}
                                selectedYear={schoolYear}
                                onYearChange={this.handleSchoolYearChange}
                                selectedTerm={term}
                                onSelectedTermChange={this.handleTermChange}
                                file={file}
                                onFileChange={this.handleFileChange}
                            />
                            {file && <CSVFileReport 
                              warnings={warnings}
                              errors={errors}
                              onErrorClick={this.handleErrorClick}
                              onWarningClick={this.handleWarningClick}
                              onErrorEnter={error => this.handleErrorHover(error)}  
                              onErrorLeave={() => this.handleErrorHover(null)}
                              onWarningEnter={warning => this.handleWarningHover(warning)}
                              onWarningLeave={() => this.handleErrorHover(null)}
                              selectedErrors={[...selectedErrors, hoveringError]}
                              selectedWarnings={[...selectedWarnings, hoveringWarning]}
                            />}
                        </ImportFormContainer>
                        {file  || true && ( 
                            <DataPreview>
                                <DataPreviewHeader>DATA PREVIEW</DataPreviewHeader>
                                <StyledCSVStudentUploadPreview />
                                <Import>
                                    <div>Do you want to import this data?</div>
                                    <ButtonContainer>
                                        <BlockButton>IMPORT</BlockButton>
                                        <BlockButton>CANCEL</BlockButton>
                                    </ButtonContainer>
                                </Import>
                            </DataPreview>
                        )}
                    </Content>
                </Main>
            </Screen>
        );
    }
}

export default ImportData;

const YearBarHeight = 35;
const Main = styled(Section)`
  position: relative;
  flex: 1;
  background-color: #F2F2F2;
  max-height: calc(100% - ${YearBarHeight}px);
`;

const YearBar = styled.div`
  width: 100%;
  height: ${YearBarHeight}px;
  background-color: black;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0 44px 0 44px;
`;

const YearLabel = styled.div`
    color: #9B9B9B;
    font-size: 12px;
    font-weight: bold;
    line-height: 17px;
    margin-right: 20px;
`;

const Content = styled(Section.Content)`
  display: flex;
  position: relative;
  flex-direction: row;
  height: 100%;
  background-color: #F2F2F2;

  @media ${breakpoints.mediumOrSmall} {
    flex-direction: column;
  }
`;

const ImportFormContainer = styled(Column)`
  flex: 1;
  max-width: 450px;
  height: 100%;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.3);
  background-color: #4F4F4F;
  align-items: center;

  @media ${breakpoints.mediumOrSmall} {
    max-width: none;
    height: auto;
  }
`;
const YearSelectHandle = styled(Icons.WhiteChevron)`
  width: 16px;
  height: 8px;
`;

const YearSelect = styled(Select).attrs({
    Handle: () => () => (<YearSelectHandle/>)
  })`
    min-width: 120px;
    background-color: inherit;
    color: white;
    font-size: 12px;
`;

const FormSelectHandle = styled(Icons.SelectIconLight)``;

const FormYearSelect = styled(Select).attrs({Handle: () => () => (<FormSelectHandle />)})`
    background-color: #4A4A4A;
    color: #D8D8D8;	
    font-family: "Open Sans";	
    font-size: 14px;	
    option, >:first-child {
        font-style: italic;
    }
`;

const ImportDataTitle = styled(Row)`
	color: #FFFFFF;	
    font-family: Oswald;
    font-size: 16px;
    margin-top: 25px;
    align-self: center;
`;

const FieldLabel = styled(Row)`
	color: #F5633A;	
    font-family: "Open Sans";	
    font-size: 14px;	
    font-weight: bold;	
    line-height: 19px;
    font-style: normal;
`;

const InputWithLabel = styled(Column)`
    width: 100%;
    max-width: 300px;
    margin-left: 40px;
`;

const Form = styled(Column)`
    width: 100%;
    font-family: "Open Sans";	
    font-size: 14px;	
    font-style: italic;	
    line-height: 19px;	
    ${InputWithLabel} + ${InputWithLabel} {
        margin-top: 20px;
    }
`;

const StyledTermSelect = styled(TermSelect).attrs({Handle: () => () => (<FormSelectHandle />)})`
    background-color: #4A4A4A;
    color: #D8D8D8;	
    font-family: "Open Sans";	
    font-size: 14px;
    option, >:first-child {
        font-style: italic;
    }
`;

const ResetFileButton = styled(BlockButton)`
    background-color: transparent;
    display: flex;
    align-items: center;
    flex-direction: row;
    color: #F5633A;	
    font-family: "Open Sans";	
    font-size: 14px;
    font-weight: bold;
    &:hover {
        background-color: transparent;
    }
    img {
        height: 19px;
        width: 19px;
        margin-left: 10px;
    }
`;

 const DataPreview = styled(Column)`
    padding: 58px 65px 0 55px; 
    flex: 1;
 `;

const DataPreviewHeader = styled(Row)`
	color: #D43425;	
    font-family: Oswald;	
    font-size: 16px;	
    line-height: 24px;
`;

const Import = styled(Column)`
    justify-content: center;
    align-items: center;
    div {
        color: #4A4A4A;	
        font-family: "Open Sans";	
        font-size: 14px;	
        font-style: italic;	line-height: 19px;
    }
`;


const ButtonContainer = styled(Row)`
    justify-content: center;
    ${BlockButton} + ${BlockButton} {
        margin-left: 15px;
    }

    ${BlockButton} {
        height: 40px;	
        width: 120px;	
        background-color: #D8D8D8;
    }
    margin-top: 10px;
`;


const StyledCSVStudentUploadPreview = styled(CSVStudentUploadPreview)`
    height: 100%;
    max-height: 500px;
    width: 100%;
    min-width: 330px;
    margin-top: 6px;
    margin-bottom: 15px;
`;


const ImportDataForm = ({years, selectedYearId, selectedYear, onYearChange, selectedTerm, onSelectedTermChange, file, onFileChange}) => (
    <Form>
        <ImportDataTitle>IMPORT DATA</ImportDataTitle>
        <InputWithLabel>
            <FieldLabel>Select a Year</FieldLabel>
            <FormYearSelect value={selectedYearId} onChange={onYearChange} placeholder="Year">
                {years.map(schoolYear =>
                    <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.year} - {schoolYear.year + 1}</option>
                )}
            </FormYearSelect>
        </InputWithLabel>
        <InputWithLabel>
            <FieldLabel>Select a {selectedYear ? selectedYear.capitalizedTermType : 'Term'}</FieldLabel>
            <StyledTermSelect 
                schoolYear={selectedYear} 
                value={selectedTerm} 
                onChange={onSelectedTermChange} 
                placeholder={selectedYear ? selectedYear.capitalizedTermType : 'Term'} 
            />
        </InputWithLabel>
        <InputWithLabel>
            {file ? (
                <ResetFileButton onClick={() => onFileChange({target: {value: null}})}>
                    <div>Select a New File </div>
                    <Icons.SelectIconLight />
                </ResetFileButton>
            ) : 
            (
                <>
                    <FieldLabel>Select a File</FieldLabel>
                    <FileInput value={file} onChange={onFileChange} withDragAndDrop />
                </>
            )}
        </InputWithLabel>
    </Form>
);
