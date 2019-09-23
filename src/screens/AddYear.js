import React, { Component } from 'react';
import { capitalize, range } from 'lodash';
import { observable, computed, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import swal from 'sweetalert2';
import styled from 'styled-components';
import Screen from '../components/Screen';
import Section from '../components/Section';
import Select from '../components/Select';
import Input from '../components/Input';
import EnumSelect from '../components/EnumSelect';
import Button from '../components/Button';
import StudentList from '../components/StudentList';
import StudentListItem from '../components/StudentListItem';
import CircleStepGroup from '../components/CircleStepGroup';
import FormError from '../components/FormError';
import SpinnerOverlay from '../components/SpinnerOverlay';
import * as Icons from '../components/Icons';
import * as breakpoints from '../breakpoints';
import enums from '../enums';

const steps = {
  START: 1,
  SETUP: 2, // Pick year and term type
  MIGRATE: 3, // Migrate students from previous year
  CONFIRM: 4, // Confirm year creation
};

const termTypeRanges = {
  'annual': range(1),
  'semester': range(2),
  'trimester': range(3),
  'quarter': range(4),
};

@withRouter
@inject('store')
@observer
class AddYear extends Component {
  @observable step = steps.START;
  @observable year = 'NONE';
  @observable termType = null;
  @observable termStartDates = [];
  @observable studentsToExport = [];
  @observable exportedStudents = [];
  @observable setupError = null;
  @observable migrateError = null;
  @observable createTask = null;
  exportedStudentListRef = React.createRef();

  @computed get exportedStudentIds() {
    return this.exportedStudents.map(student => student.id);
  }

  @computed get migratableStudents() {
    const { currentSchoolYear } = this.props.store;
    if(!currentSchoolYear) return [];
    return currentSchoolYear.students.filter(student => student.gradeLevel !== 'Post-school');
  }

  @computed get yearChoices() {
    const { currentSchoolYear } = this.props.store;
    const year = new Date().getFullYear();
    if(currentSchoolYear) {
      if(currentSchoolYear.year >= year) return [currentSchoolYear.year + 1];
      else if(currentSchoolYear.year === year - 1) return [year];
    }
    return [year - 1, year];
  }

  @action.bound handleYearSelectChange(event) {
    this.year = +event.target.value;
  }

  @action.bound handleTermTypeChange(event) {
    this.termType = event.target.value;
    this.termStartDates = termTypeRanges[this.termType].map(() => '');
  }

  @action.bound handleTermDateChange(i, event) {
    this.termStartDates[i] = event.target.value;
  }

  @action.bound handleStudentCheckedChanged(student) {
    const { studentsToExport } = this;
    if(studentsToExport.includes(student)) {
      studentsToExport.remove(student);
    } else {
      studentsToExport.push(student);
    }
  }

  @action.bound handleGradeLevelChange(student, event) {
    const gradeLevel = event.target.value;
    student.gradeLevel = gradeLevel;
    if(gradeLevel !== 'Post-school') {
      student.exitCategory = null;
      student.postSchoolOutcome = null;
      student.postSchoolOutcomeOther = null;
    }
  }

  @action.bound handleExitCategoryChange(student, event) {
    student.exitCategory = event.target.value;
  }

  @action.bound handlePostSchoolOutcomeChange(student, event) {
    const outcome = event.target.value;
    student.postSchoolOutcome = outcome;
    student.postSchoolOutcomeOther = outcome === 'Other' ? '' : null;
  }

  @action.bound handlePostSchoolOutcomeOtherChange(student, event) {
    student.postSchoolOutcomeOther = event.target.value;
  }

  @action.bound handleExportClick() {
    this.exportedStudents.push(
      ...this.studentsToExport
        .filter(student => !this.exportedStudents.find(s => s.id === student.id))
        .map(student => {
          const clone = student.clone();
          const nextGradeLevel = enums.grades[
            Math.min(enums.grades.length - 1, enums.grades.indexOf(student.gradeLevel) + 1)
          ];
          clone.gradeLevel = nextGradeLevel;
          clone.exitCategory = student.exitCategory;
          clone.postSchoolOutcome = student.postSchoolOutcome;
          return clone;
        })
    );
    this.studentsToExport = [];
  }

  @action.bound handleUnexportClick(student) {
    const { exportedStudents } = this;
    exportedStudents.remove(exportedStudents.find(s => s.id === student.id));
  }

  @action.bound handleNextClick() {
    const { currentSchoolYear } = this.props.store;
    const { step } = this;
    // Skip migration step if there is no school year to migrate from
    if(step === steps.SETUP) {
      const setupError = this.getSetupError();
      if(setupError) {
        this.setupError = setupError;
      } else {
        this.setupError = null;
        this.step += currentSchoolYear ? 1 : 2; // skip migration if there's no current year
      }
    } else if(step === steps.MIGRATE) {
      const migrateError = this.getMigrateError();
      if(migrateError) {
        this.migrateError = migrateError;
      } else {
        this.migrateError = null;
        this.step++;
      }
    } else {
      this.step++;
    }
  }

  @action.bound handleCancelClick() {
    this.props.history.goBack();
  }

  @action.bound async handleSubmit() {
    const { store } = this.props;
    const { year, termType, exportedStudents, termStartDates } = this;
    this.createTask = store.createSchoolYear({
      year,
      termType,
      terms: termStartDates.map(startDate => ({ startDate: new Date(startDate) })),
      students: exportedStudents.map(student => ({
        gradeLevel: student.gradeLevel,
        exitCategory: student.exitCategory,
        postSchoolOutcome: student.postSchoolOutcome === 'Other'
          ? (student.postSchoolOutcomeOther || '')
          : student.postSchoolOutcome,
        id: student.id,
      })),
    });
    const schoolYear = await this.createTask;
    if(this.createTask.resolved) {
      this.props.history.push(`/${schoolYear.id}/students`);
      await swal('Success', `School year ${year}-${year+1} created.`, 'success');
    }
  }

  getSetupError() {
    const { year, termType, termStartDates } = this;
    if(!year) return new Error('You must select a year range.');
    if(!termType) return new Error('You must select a term type.');

    let index = 1;
    if(termStartDates) for(let date of termStartDates) {
      if(!date) return new Error(`Term ${index} date is missing.`);
      date = new Date(date);
      const termYear = date.getFullYear();
      if(termYear !== year && termYear !== year + 1) return new Error(`Term ${index} should start in either ${year} or ${year + 1}`);
      index++;
    }
  }

  getMigrateError() {
    let i = 0;
    for(let student of this.exportedStudents) {
      if(student.gradeLevel === 'Post-school') {
        if(!student.exitCategory) {
          this.exportedStudentListRef.current.scrollTo(i);
          return new Error(`You must select an exit category for ${student.fullName}`);
        }
        if(!student.postSchoolOutcome) {
          this.exportedStudentListRef.current.scrollTo(i);
          return new Error(`You must select a post school outcome for ${student.fullName}`);
        }
      }
      i++;
    }
  }

  renderStart() {
    return (
      <StartFormRoot>
        <StartTopText>Add a School Year</StartTopText>
        <StartButton onClick={this.handleNextClick}><StartIcon/></StartButton>
        <StartBottomText>START A NEW SCHOOL YEAR</StartBottomText>
      </StartFormRoot>
    );
  }

  renderSetupForm() {
    const { year, termType, termStartDates, setupError } = this;

    return (
      <React.Fragment>
        {setupError && <SetupFormError error={setupError}/>}
        <Title>Title + Time</Title>
        <YearForm>
          <InputLabel>School Year Name</InputLabel>
          <YearSelect value={year} onChange={this.handleYearSelectChange}>
            <option>Select a year</option>
            {this.yearChoices.map(year =>
              <option key={year} value={year}>
                {year}-{year + 1}
              </option>
            )}
          </YearSelect>

          <InputLabel>Academic Schedule</InputLabel>
          <TermTypeSelect value={termType} onChange={this.handleTermTypeChange} format={capitalize}/>

          {termType &&
            termStartDates.map((value, i) =>
              <React.Fragment key={i}>
                <DateInputLabel>
                  Term {i + 1} Start Date
                </DateInputLabel>
                <DateInput value={value} onChange={this.handleTermDateChange.bind(null, i)}/>
              </React.Fragment>
            )
          }
        </YearForm>
      </React.Fragment>
    );
  }

  SourceListItem = observer(({ student }) =>
    <StudentListItem hideRisk key={student.id} student={student}>
      {this.exportedStudentIds.includes(student.id) 
        ? <ExportedLabel>Exported</ExportedLabel>
        : <input type="checkbox" 
        checked={this.studentsToExport.includes(student)}
        onChange={this.handleStudentCheckedChanged.bind(null, student)}
        />
      }
    </StudentListItem>
  );

  DestListItem = observer(({ student }) =>
    <StudentListItem hideRisk
      key={student.id}
      student={student}
      left={
        <UnexportButton onClick={this.handleUnexportClick.bind(null, student)}>
          <TrashIcon/>
        </UnexportButton>
      }
    >
      <GradeSelect value={student.gradeLevel} onChange={this.handleGradeLevelChange.bind(null, student)}/>
      {student.gradeLevel === 'Post-school' &&
        <PostSchoolInputRow>
          <ExitCategorySelect
            value={student.exitCategory}
            onChange={this.handleExitCategoryChange.bind(null, student)}
          />
          <PostSchoolOutcomeSelect
            value={student.postSchoolOutcome}
            onChange={this.handlePostSchoolOutcomeChange.bind(null, student)}
          />
        </PostSchoolInputRow>
      }
      {student.gradeLevel === 'Post-school' && student.postSchoolOutcome === 'Other' &&
        <PostSchoolInputRow>
          <PostSchoolOutcomeOtherInput
            value={student.postSchoolOutcomeOther}
            onChange={this.handlePostSchoolOutcomeOtherChange.bind(null, student)}
          />
        </PostSchoolInputRow>
      }
    </StudentListItem>
  );

  itemSizeGetter = studentArray => index => studentArray[index].gradeLevel === 'Post-school' ? 115 : 70;

  renderStudentForm() {
    const {
      migratableStudents,
      exportedStudents,
      SourceListItem,
      DestListItem,
      migrateError,
    } = this;

    return (
      <StudentForm>
        <StudentFormTitle>Migrate Students</StudentFormTitle>
        {migrateError && <MigrateFormError error={migrateError}/>}
        <StudentFormInstructions>
          All selected students will be moved to the next year and advanced a grade.
          <br/>
          You will be able to manually change the grade if the student did not advance.
        </StudentFormInstructions>
        <StudentLists>
          <StudentListWrapper>
            <StudentListHeader>
              <ExportButton onClick={this.handleExportClick}>
                MIGRATE SELECTED STUDENTS
              </ExportButton>
            </StudentListHeader>
            <StudentList
              listType="variable"
              itemSizeGetter={this.itemSizeGetter(migratableStudents)}
              students={migratableStudents}
              renderItem={student =>
                <SourceListItem key={student.id} student={student}/>
              }
            />
          </StudentListWrapper>
          <StudentListWrapper>
            <StudentListHeader></StudentListHeader>
            <StudentList
              listType="variable"
              itemSizeGetter={this.itemSizeGetter(exportedStudents)}
              students={exportedStudents}
              innerRef={this.exportedStudentListRef}
              renderItem={student =>
                <DestListItem key={student.id} student={student}/>
              }
            />
          </StudentListWrapper>
        </StudentLists>
      </StudentForm>
    );
  }

  renderConfirmation() {
    return (
      <React.Fragment>
        <ConfirmHeader>Confirm Setup Complete</ConfirmHeader>
        <ConfirmSubheader>School year setup is not editable throughout the year. </ConfirmSubheader>
        <ConfirmButton onClick={this.handleSubmit}>I’M DONE. CREATE NEW YEAR.</ConfirmButton>
      </React.Fragment>
    );
  }

  render() {
    const { step, createTask } = this;
    let content;

    switch(step) {
      case steps.START: content = this.renderStart(); break;
      case steps.SETUP: content = this.renderSetupForm(); break;
      case steps.MIGRATE: content = this.renderStudentForm(); break;
      default: content = this.renderConfirmation(); break;
    }

    return (
      <Screen>
        <SpinnerOverlay open={createTask && createTask.pending}/>
        <Main fullWidth>
          <Content>
            <Header>
              <div/>
              {step !== steps.START &&
                <HeaderSteps>
                  <CircleStepGroup.Item text="Title + Time" active={step > steps.SETUP}/>
                  <CircleStepGroup.Item text="Migrate Students" active={step > steps.MIGRATE}/>
                  <CircleStepGroup.Item text="Confirmation"/>
                </HeaderSteps>
              }
              <div>
              {step === steps.MIGRATE &&
                <CancelButton onClick={this.handleCancelClick}>Cancel</CancelButton>
              }
              {step < steps.CONFIRM && step !== steps.START &&
                <NextButton onClick={this.handleNextClick}>NEXT <NextArrowImage/></NextButton>
              }
              </div>
            </Header>

            {content}
          </Content>
        </Main>
      </Screen>
    );
  }

  async componentDidMount() {
    const { store } = this.props;
    if(store.currentSchoolYear) await store.fetchSchoolYear(store.currentSchoolYear.id);
    this.studentsToExport = this.migratableStudents.filter(student => student.gradeLevel !== 'Post-school');
  }
}

export default AddYear;

const Main = styled(Section)`
  height: 100%;
  background-color: #5B5B5B;
  padding-bottom: 20px;
  overflow: auto;
`;

const Content = styled(Section.Content)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

const HeaderSteps = styled(CircleStepGroup)`
  position: absolute;
  left: 50%;
  top: 10px;
  transform: translate(-50%, 0);

  @media ${breakpoints.small} {
    top: 80px;
  }
`;

const YearForm = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 300px;
`;

const Title = styled.h1`
  color: white;
  width: 100%;
	font-size: 20px;
	font-weight: bold;
	line-height: 27px;
  text-align: center;
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  color: white;
  text-align: left;
  margin-bottom: 7px;
  font-size: 14px;
  font-weight: bold;
  line-height: 19px;
  margin-top: 14px;
`;

const DateInputLabel = styled(InputLabel)`
  font-size: 12px;
  font-weight: normal;
`;

const YearSelect = styled(Select).attrs({inverted: true})`
  width: 300px;
`;

const TermTypeSelect = styled(EnumSelect).attrs({
  inverted: true,
  name: 'termTypes',
  placeholder: 'Choose annual, semester, etc.',
})`
  width: 300px;
`;

const StudentListEnumSelect = styled(EnumSelect)`
  background-color: #F4F4F4;
  color: #4A4A4A;
  border-radius: 5px;
  width: 150px;
  overflow: hidden;
`;

const PostSchoolInputRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: flex-end;
  padding-left: 57px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const GradeSelect = styled(StudentListEnumSelect).attrs({name: 'grades'})``;

const ExitCategorySelect = styled(StudentListEnumSelect).attrs({
  name: 'exitCategories',
  placeholder: 'Exit Category',
})`
  flex: 1;
  max-width: 50%;
`;

const PostSchoolOutcomeSelect = styled(StudentListEnumSelect).attrs({
  name: 'postSchoolOutcomes',
  placeholder: 'Post-School Outcome'
})`
  flex: 1;
  max-width: 50%;
  margin-left: 15px;
`;

const PostSchoolOutcomeOtherInput = styled(Input).attrs({placeholder: 'Post-School Outcome'})`
  background-color: #F4F4F4;
  color: #4A4A4A;
  border-radius: 5px;
  overflow: hidden;
  flex: 1;
  max-width: calc(50% - 7.5px);
`;

const DateInput = styled.input.attrs({type: 'date'})`
  height: 40px;
  min-height: 40px;
  padding-left: 20px;
  background-color: #4A4A4A;
  color: white;
  font-size: 14px;
  border: none;
  outline: none;
  width: 100%;
  padding-left: 20px;
  font-family: "Open Sans";
  border-radius: 0;
  -webkit-appearance: none;
`;

const Header = styled.div`
  width: 100%;
  min-height: 50px;
  max-height: 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 100px;
`;

const NextButton = styled(Button)`
  height: 100%;
  width: 144px;
  height: 50px;
  color: white;
  background-color: #F5633A;
  font-family: "Oswald";
  font-size: 16px;
  align-items: center;

  &:disabled {
    background-color: #999;
  }
`;

const CancelButton = styled(Button)`
  height: 100%;
  width: 144px;
  height: 50px;
  color: white;
  background-color: #D2362D;
  font-family: "Oswald";
  font-size: 16px;
  align-items: center;
`;

const NextArrowImage = styled(Icons.WhiteCircleArrow)`
  position: relative;
  top: 3px;
  margin-left: 20px;
  width: 19px;
  height: 19px;
`;

const StudentForm = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const StudentFormTitle = styled.h1`
  color: white;
	font-size: 20px;
	font-weight: bold;
  line-height: 27px;
  text-align: center;
  padding: 0;
  margin: 0;
`;

const StudentFormInstructions = styled.h2`
	color: white;
	font-size: 14px;
	line-height: 19px;
  text-align: center;
  padding: 0;
  margin: 6px 0 34px 0;
`;

const StudentLists = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;

  @media ${breakpoints.small} {
    flex-direction: column;
  }
`;

const StudentListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 300px;

  & + & {
    margin-left: 11px;

    @media ${breakpoints.small} {
      margin-left: 0;
    }
  }
`;

const StudentListHeader = styled.div`
  height: 40px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  background-color: #262626;
`;

const ExportButton = styled(Button)`
  height: 100%;
  background-color: #D43425;
  padding: 0 20px 0 20px;
  color: white;
  font-size: 16px;
  font-family: 'Oswald';
`;

const UnexportButton = styled(Button)`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const ExportedLabel = styled.div`
	color: #A20B0E;
	font-size: 10px;
	font-style: italic;
	font-weight: 600;
	line-height: 14px;
`;

const TrashIcon = styled(Icons.Trash)`
  width: 14px;
  height: 18px;
`;

const ConfirmHeader = styled.div`
	color: white;
	font-size: 20px;
	font-weight: bold;
  line-height: 27px;
  margin-bottom: 6px;
`;

const ConfirmSubheader = styled.div`
	height: 19px;
	width: 354px;
	color: white;
	font-family: "Open Sans";
	font-size: 14px;
	line-height: 19px;
  text-align: center;
  margin-bottom: 48px;
`;

const ConfirmButton = styled(Button)`
  background-color: #F5633A;
  height: 50px;
	color: white;
	font-family: "Oswald";
	font-size: 16px;
  line-height: 21px;
  padding: 0 40px 0 40px;
`;

const StartFormRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StartTopText = styled.div`
	color: white;
	font-size: 20px;
	font-weight: bold;
	line-height: 27px;
`;

const StartButton = styled(Button)`
  margin: 44px 0 21px;
`;

const StartIcon = styled(Icons.OrangeCirclePlus)`
  width: 60px;
  height: 60px;
`;

const StartBottomText = styled.div`
	color: white;
	font-family: "Oswald";
	font-size: 16px;
	line-height: 21px;
`;

const SetupFormError = styled(FormError)`
  margin-bottom: 20px;
`;

const MigrateFormError = styled(FormError)`
  margin: 20px auto 20px;
  max-width: 550px;
`;

