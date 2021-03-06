import { action, computed, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import styled, { css } from 'styled-components';
import sweetalert from 'sweetalert2';
import * as breakpoints from '../breakpoints';
import BlockButton from '../components/BlockButton';
import Column from '../components/Column';
import CSVFileReport from '../components/CSVFileReport';
import CSVStudentUploadPreview from '../components/CSVStudentUploadPreview';
import FileInput from '../components/FileInput';
import * as Icons from '../components/Icons';
import Row from '../components/Row';
import Screen from '../components/Screen';
import Section from '../components/Section';
import Select from '../components/Select';
import Spinner from '../components/Spinner';
import TermSelect from '../components/TermSelect';
import first from '../utils/first';
import parseCSV from '../utils/parseCSV';
import toggleArrayValue from '../utils/toggleArrayValue';
import { getDownloadTemplateUrl, recheckImport, translateImportStudentCSV } from '../utils/translateImportStudentCSV';

@withRouter
@inject('store')
@observer
class ImportData extends Component {

    @observable schoolYearId = null;
    @observable schoolYear = null;
    @observable term = null;
    @observable file = null;
    @observable fileReport = null;
    @observable selectedErrors = [];
    @observable selectedWarnings = [];
    @observable hoveringError = null;
    @observable hoveringWarning = null;
    @observable loading = false;
    @observable importedStudents = null;
    @observable disabilities = [];
    @observable lastSelected = null;
    @observable pendingCSVDataUpdate = false;
    @observable currentYearStudents = [];
    @observable allStudents = [];
    @observable studentsNotInYear = [];

    @action.bound
    async handleSchoolYearChange(e) {
        this.schoolYearId = +e.target.value;
        this.schoolYear = await this.props.store.fetchSchoolYear(this.schoolYearId);
        this.currentYearStudents = this.schoolYear.students;
        this.studentsNotInYear = this.allStudents
            .filter(student => student.schoolYearId !== this.schoolYearId)
            .map(yearStudent => {
                const { student } = yearStudent;
                return {
                    ...student,
                    differentYear: true,
                }
            });
    }

    @action.bound
    async handleTermChange(e) {
        this.term = e.target.value;

    }

    @action.bound
    async handleFileChange(e) {
        if(!this.schoolYear || !this.term) {
            return;
        }
        const files = e.target.files;
        this.file = first(files);
        this.loading = true;
        this.selectedErrors = [];
        this.selectedWarnings = [];
        this.lastSelectedFileReport = null;
        try {
            const { data, errors } = await parseCSV(this.file);
            if(errors.length) {
                console.error(errors);
            }
            const { students, ...fileReport} = await translateImportStudentCSV(data, [...this.currentYearStudents, ...this.studentsNotInYear], this.disabilities);
            this.importedStudents = students;
            this.fileReport = fileReport;
        } finally {
            this.loading = false;
        }
    }

    @action.bound
    handleCancel() {
        this.file = null;
        this.fileReport = null;
        this.loading = false;
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
    handleWarningClick(warningId) {
        // the selected lists have their values toggled, so if this is "toggling off" (has the cellId in this list),
        // don't change the "lastSelected" cell
        this.lastSelected = this.selectedWarnings.includes(warningId) ? this.lastSelected : warningId;
        toggleArrayValue(this.selectedWarnings, warningId);
    }

    @action.bound
    handleErrorClick(errorId) {
        this.lastSelected = this.selectedErrors.includes(errorId) ? this.lastSelected : errorId;
        toggleArrayValue(this.selectedErrors, errorId);
    }

    @action.bound
    handleWarningHover(warningId) {
        this.hoveringWarning = warningId;
    }

    @action.bound
    handleErrorHover(errorId) {
        this.hoveringWarning  = errorId;
    }


    @action.bound
    async handleCSVDataChange(updatedCSV) {
        if(!this.schoolYear || !this.term) {
            return;
        }
        this.selectedErrors = [];
        this.selectedWarnings = [];
        this.hoveringError = null;
        this.hoveringWarning = null;
        this.pendingCSVDataUpdate = true;
        try {
            const { students, ...fileReport } = await recheckImport(updatedCSV, [...this.currentYearStudents, ...this.studentsNotInYear], this.disabilities);
            this.importedStudents = students;
            this.fileReport = fileReport;
        } finally {
            this.pendingCSVDataUpdate = false;
        }
    }

    @computed
    get selectedCells() {
        return [...this.selectedErrors, ...this.selectedWarnings]
    }

    @computed
    get hoveringOver() {
        return this.hoveringError || this.hoveringWarning;
    }

    @computed
    get fileSelectEnabled() {
        return (this.schoolYear !== null && this.term !== null);
    }

    @computed
    get formEnabled() {
        return !this.loading;
    }

    async handleUploadComplete() {
        this.selectedErrors = [];
        this.selectedWarnings = [];
        this.hoveringError = null;
        this.hoveringWarning = null;
        this.importedStudents = null;
        this.file = null;
        this.fileReport = null;
        this.term = null;
    }

    async handleUploadFailure() {
        this.schoolYear = await this.props.store.fetchSchoolYear(this.schoolYearId);
        this.pendingCSVDataUpdate = true;
        try {
            const { students, ...fileReport} = await recheckImport(this.importedStudents, [...this.currentYearStudents, ...this.studentsNotInYear], this.disabilities);
            this.importedStudents = students;
            this.fileReport = fileReport;
        } finally {
            this.pendingCSVDataUpdate = false
        }
    }

    async submit() {
        if(this.pendingCSVDataUpdate) {
            return;
        }
        this.loading = true;
        try {
            this.schoolYear = await this.props.store.importStudentsFromCSV(this.schoolYear, this.term, this.importedStudents);
            await sweetalert({
                title: 'Success',
                text: 'Students uploaded successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            });
            await this.handleUploadComplete();
        } catch(e) {
            await sweetalert({
                title: 'Error',
                text: 'Failed to upload some or all of the students.',
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Close'
            });
            console.error(e);
            // Refresh the student list and recheck the import, in case some of the students were successfully uploaded
            await this.handleUploadFailure();
        } finally {
            this.loading = false;
        }
    }

    @action.bound
    async handleImportClicked() {
        if(this.errors.length !== 0) {
            await sweetalert({
                title: 'Invalid Data',
                text: `There are ${this.errors.length} error(s) in the import that must be resolved before importing.`,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'OK'
            });
            return;
        }
        if(this.warnings.length !== 0) {
            const confirm = await sweetalert({
                title: 'Warning',
                text: `There are ${this.warnings.length} unresolved warning(s) that will be ignored during import or overwrite existing student data. Continue?`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
            });
            if(confirm.dismiss === 'cancel') {
                return;
            }
        }
        await this.submit();
    }

    async componentDidMount() {
        this.loading = true;
        this.disabilities = await this.props.store.fetchDisabilities();
        this.allStudents = await this.props.store.getAllStudents();
        this.loading = false;
    }

    render() {
        const { 
            schoolYearId, 
            schoolYear, 
            term, 
            file, 
            warnings, 
            errors, 
            selectedErrors, 
            selectedWarnings, 
            hoveringError, 
            hoveringWarning, 
            loading,
            importedStudents,
            selectedCells,
            hoveringOver,
            lastSelected,
        } = this;
        const { schoolYears } = this.props.store;

        return (
            <Screen>
                <Main fullWidth>
                    <YearBar>
                        <YearLabel>School Year</YearLabel>
                        <YearSelect value={schoolYearId} onChange={this.handleSchoolYearChange} disabled={!this.formEnabled}>
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
                                onCancel={this.handleCancel}
                                fileSelectEnabled={this.fileSelectEnabled}
                                formEnabled={this.formEnabled}
                            />
                            {file && (
                                <CSVFileReport 
                                    warnings={warnings}
                                    errors={errors}
                                    onErrorClick={this.handleErrorClick}
                                    onWarningClick={this.handleWarningClick}
                                    onErrorEnter={errorId => this.handleErrorHover(errorId)}  
                                    onErrorLeave={() => this.handleErrorHover(null)}
                                    onWarningEnter={warningId => this.handleWarningHover(warningId)}
                                    onWarningLeave={() => this.handleErrorHover(null)}
                                    selectedErrors={[...selectedErrors, hoveringError]}
                                    selectedWarnings={[...selectedWarnings, hoveringWarning]}
                                />
                            )}
                            <DownloadTemplateLink href={getDownloadTemplateUrl()} download="student-import-template.csv">Download Template</DownloadTemplateLink>
                        </ImportFormContainer>
                        {file && ( 
                            loading ? (<DataPreview loading><Spinner /></DataPreview>)
                            : (
                                <CSVDataImportPreview 
                                    studentData={importedStudents} 
                                    selected={selectedCells}
                                    hoveringOver={hoveringOver}
                                    lastSelected={lastSelected}
                                    onDataChanged={this.handleCSVDataChange} 
                                    onImportClicked={this.handleImportClicked}
                                    onCancelClicked={this.handleCancel}
                                    buttonsEnabled={errors.length === 0}
                                />
                            )
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
  min-width: 360px;
  height: 100%;
  background-color: #4F4F4F;
  align-items: center;
  overflow-y: auto;

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

const FormSelectHandle = styled(Icons.SelectIconLight)`
    height: 19px;	
    width: 19px;
`;

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
    @media ${breakpoints.mediumOrSmall} {
        margin-left: 0;
    }
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

    @media ${breakpoints.mediumOrSmall} {
        align-items: center;
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
    padding: 58px 65px 0 0; 
    flex: 1;
    @media ${breakpoints.large} {
        max-width: 75vw;
    }
    @media ${breakpoints.mediumOrSmall} {
        max-width: none;
    }
    ${props => props.loading && css`
        justify-content: center;
        align-items: center;
    `}
 `;

const DataPreviewHeader = styled(Row)`
	color: #D43425;	
    font-family: Oswald;	
    font-size: 16px;	
    line-height: 24px;
    margin-left: 55px;
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
        ${props => props.enabled ? css`background-color: #F5633A;` : css`background-color: #D8D8D8;`}
    }
    margin-top: 10px;
`;

const CancelButton = styled(BlockButton)`
    &:hover {
        background-color: #D43425;
    }
`;


const ImportButton = styled(BlockButton)`

`;


const StyledCSVStudentUploadPreview = styled(CSVStudentUploadPreview)`
    height: 70%;
    max-height: 500px;
    width: 100%;
    @media ${breakpoints.mediumOrSmall} {
        max-width: 95vw;
    }
    max-width: 95vw;
    min-width: 330px;
    margin-top: 6px;
    margin-bottom: 15px;
`;


const ImportDataForm = ({
    years, 
    selectedYearId, 
    selectedYear, 
    onYearChange, 
    selectedTerm, 
    onSelectedTermChange, 
    file, 
    onFileChange, 
    onCancel, 
    fileSelectEnabled, 
    formEnabled
}) => (
    <Form>
        <ImportDataTitle>IMPORT DATA</ImportDataTitle>
        <InputWithLabel>
            <FieldLabel>Select a Year</FieldLabel>
            <FormYearSelect value={selectedYearId} onChange={onYearChange} placeholder="Year" disabled={!formEnabled}>
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
                disabled={!formEnabled}
            />
        </InputWithLabel>
        <InputWithLabel>
            {file ? (
                <ResetFileButton onClick={fileSelectEnabled ? onCancel : null}>
                    <div>Select a New File </div>
                    <Icons.SelectIconLight />
                </ResetFileButton>
            ) : 
            (
                <>
                    <FieldLabel>Select a File</FieldLabel>
                    <FileInput value={file} onChange={onFileChange} withDragAndDrop accept='text/csv' enabled={fileSelectEnabled} />
                </>
            )}
        </InputWithLabel>
    </Form>
);


const CSVDataImportPreview = ({studentData, onDataChanged, onImportClicked, onCancelClicked, selected, hoveringOver, buttonsEnabled, lastSelected}) => {
    const [data, setData] = useState([]);

    function onCellChanged(rowId, cellId, inputValue) {
        const row = data.find(row => row.id === rowId);
        if(row) {
            const rowEntries = Object.entries(row);
            const cell = rowEntries.find(([_, value]) => value.id === cellId);
            if(cell) {
                const [key, cellValues] = cell;
                // Replace the cell's value
                const newValue = { 
                    ...cellValues,
                    value: inputValue,
                    // Used in the re-validation (unifies the initial import code and the recheck code)
                    rawValue: inputValue
                }
                const updatedRow = {
                    ...row,
                    [key]: newValue,
                }
                // replace the row with the updated values
                setData(data.map(studentData => studentData.id === rowId ? updatedRow : studentData));
            }
        }
    }

    function onCSVCellFocusChange() {
        onDataChanged(data);
    }

    useEffect(() => {
        setData(studentData);
    }, [studentData]);

    return (
        <DataPreview>
            <DataPreviewHeader>DATA PREVIEW</DataPreviewHeader>
            <StyledCSVStudentUploadPreview 
                csvData={data} 
                selected={selected} 
                onCSVCellChange={onCellChanged}
                onCSVCellFocusChange={onCSVCellFocusChange}
                hoverOver={hoveringOver}
                lastSelected={lastSelected}
            />
            <Import>
                <div>Do you want to import this data?</div>
                <ButtonContainer enabled={buttonsEnabled}>
                    <ImportButton onClick={onImportClicked}>IMPORT</ImportButton>
                    <CancelButton onClick={onCancelClicked}>CANCEL</CancelButton>
                </ButtonContainer>
            </Import>
        </DataPreview>
    );
}

const DownloadTemplateLink = styled.a`
    /* Only a dev tool */
    display: ${process.env.NODE_ENV === 'development' ? 'block': 'none'}; 
`;