import React, { Component } from 'react';
import noop from 'lodash/noop';
import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import ReportFormContainer from './ReportFormContainer';
import ReportFormDefaultLayout from './ReportFormDefaultLayout';
import Label from '../Label';
import RadioButton from '../RadioButton';
import Select from '../Select';
import Checkbox from '../Checkbox';
import TermSelect from '../TermSelect';
import getReportFileName from '../../utils/getReportFileName';

@observer
export default class StudentRiskReport extends Component {
  @observable startYearId = null;
  @observable startTermId = null;
  @observable endYearId = null;
  @observable endTermId = null;
  @observable studentId = null;
  @observable allStudents = false;
  @observable longitudinal = false;
  @observable submitTask = null;

  @computed get startYear() {
    const { schoolYears } = this.props;
    const { startYearId } = this;
    return startYearId && schoolYears.find(year => year.id === startYearId);
  }

  @computed get startTerm() {
    const { startTermId, startYear } = this;
    if(startTermId && startYear) {
      return startYear.terms.find(term => term.id === startTermId);
    }
    return null;
  }

  @computed get endYear() {
    const { schoolYears } = this.props;
    const { endYearId } = this;
    return endYearId && schoolYears.find(year => year.id === endYearId);
  }

  @computed get endTerm() {
    const { endYear, endTermId } = this;
    return endYear && endTermId && endYear.terms.find(term => term.id === endTermId);
  }

  @computed get selectableStudents() {
    const { startTerm } = this;
    return startTerm && startTerm.students
      .filter(termInfo => termInfo.gradeLevel !== 'Post-school');
  }

  @computed get selectedStudent() {
    const { studentId, selectableStudents } = this;
    return studentId && selectableStudents && selectableStudents.find(student => student.id === studentId);
  }

  @computed get canRun() {
    const { startYear, startTerm, endYear, endTerm, longitudinal, selectedStudent, allStudents } = this;
    return (
      startYear &&
      startTerm &&
      ( !longitudinal || (
        endYear && 
        endTerm
      )) &&
      (allStudents || selectedStudent)
    );
  }

  @action.bound handleLongitudinalToggle() {
    this.longitudinal = !this.longitudinal;
    if(!this.longitudinal) {
      this.endYearId = null;
      this.endTermId = null;
    }
  }

  @action.bound handleAllStudentsToggle() {
    this.allStudents = !this.allStudents;
    if(this.allStudents) {
      this.studentId = null;
    }
  }

  @action.bound handleStartYearIdChange(event) {
    this.startYearId = +event.target.value;
    this.startTermId = null;
    const { startYear } = this;
    if(startYear && startYear.termType === 'annual') this.setStartTermId(startYear.terms[0].id);
  }

  @action.bound async setStartTermId(startTermId) {
    const { store } = this.props;
    this.startTermId = startTermId;
    this.studentId = null;
    const { startTerm } = this;
    if(startTerm) await store.fetchTermStudents(startTerm);
  }

  @action.bound handleStartTermIdChange(event) {
    return this.setStartTermId(+event.target.value);
  }

  @action.bound handleEndYearIdChange(event) {
    this.endYearId = +event.target.value;
    this.endTermId = null;
    const { endYear } = this;
    if(endYear && endYear.termType === 'annual') {
      this.endTermId = endYear.terms[0].id;
    }
  }

  @action.bound handleEndTermIdChange(event) {
    this.endTermId = +event.target.value;
  }

  @action.bound handleSelectedStudentIdChange(event) {
    this.studentId = +event.target.value;
  }

  @action.bound handleSubmit() {
    const { store } = this.props;
    const {
      longitudinal,
      startYear,
      startTerm,
      endYear,
      endTerm,
      selectedStudent,
      allStudents,
    } = this;

    const startYearId = startYear && startYear.id;
    const startTermId = startTerm && startTerm.id;
    const endYearId = endYear && endYear.id;
    const endTermId = endTerm && endTerm.id;

    let fileName = getReportFileName('student-risk', {
      startYear,
      startTerm,
      student: selectedStudent,
    });
    if(longitudinal) fileName += '-longitudinal';

    if(longitudinal) {
      this.submitTask = store.downloadReport(
        'studentRisk/longitudinal',
        fileName,
        {
          startYearId,
          startTermId,
          endYearId,
          endTermId,
          studentId: (allStudents || !selectedStudent) ? null : selectedStudent.id,
        },
      );
    } else {
      this.submitTask = store.downloadReport(
        'studentRisk/standard',
        fileName,
        {
          startYearId,
          startTermId,
          studentId: (allStudents || !selectedStudent) ? null : selectedStudent.id,
        },
      );
    }
  }

  render () {
    const { schoolYears, closePath } = this.props;

    const {
      startYear,
      startTerm,
      endYear,
      endTerm,
      allStudents,
      longitudinal,
      selectableStudents,
      selectedStudent,
      canRun,
      submitTask,
    } = this;

    const startTermName = startYear ? startYear.capitalizedTermType : 'Term';
    const endTermName = endYear ? endYear.capitalizedTermType : 'Term';

    return (
      <ReportFormContainer title="Risk Report - Per Student" subtitle="over time" onSubmit={this.handleSubmit} closePath={closePath} canRun={canRun} submitTask={submitTask}>
        <CountType>
          <RadioButton checked={!longitudinal} onChange={longitudinal ? this.handleLongitudinalToggle : noop}>Standard</RadioButton>
          <RadioButton checked={longitudinal} onChange={longitudinal ? noop : this.handleLongitudinalToggle}>Longitudinal</RadioButton>
        </CountType>
        <ReportFormDefaultLayout>
          <div>
            <Label>{longitudinal ? 'Starting Year' : 'School Year'}</Label>
            <Select value={startYear && startYear.id} onChange={this.handleStartYearIdChange} placeholder={longitudinal ? 'Start Year' : 'Year'}>
              {schoolYears.map(schoolYear =>
                <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.yearRange}</option>
              )}
            </Select>
          </div>
          <div style={{visibility: startYear && startYear.termType === 'annual' ? 'hidden' : 'visible'}}>
            <Label>{longitudinal ? `Starting ${startTermName}` : startTermName}</Label>
            <TermSelect
              schoolYear={startYear}
              value={startTerm}
              onChange={this.handleStartTermIdChange}
              placeholder={longitudinal ? `Start ${startTermName}` : startTermName}
            />
          </div>
          <div hidden={!longitudinal}>
            <Label>Ending Year</Label>
            <Select value={endYear && endYear.id} onChange={this.handleEndYearIdChange} placeholder="End Year">
              {schoolYears.map(schoolYear =>
                <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.yearRange}</option>
              )}
            </Select>
          </div>
          <div hidden={!longitudinal} style={{visibility: endYear && endYear.termType === 'annual' ? 'hidden' : 'visible'}}>
            <Label>Ending {endTermName}</Label>
            <TermSelect
              schoolYear={endYear}
              value={endTerm}
              onChange={this.handleEndTermIdChange}
              placeholder={`End ${endTermName}`}
            />
          </div>
          <div>
            <Label>Student</Label>
            <Select value={selectedStudent && selectedStudent.id} onChange={this.handleSelectedStudentIdChange} disabled={allStudents} placeholder="Choose a student or select 'All'">
              {selectableStudents && selectableStudents.map(student =>
                <option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>
              )}
            </Select>
          </div>
          <UnlabeledInput>
            <div>
              <Checkbox checked={allStudents} onChange={this.handleAllStudentsToggle}>All Students</Checkbox>
              <CheckboxInfo>Select to run one report for each student.</CheckboxInfo>
            </div>
          </UnlabeledInput>
        </ReportFormDefaultLayout>
      </ReportFormContainer>
    )
  }
}

const CountType = styled.div`
  margin-bottom: 25px;

  & > * {
    width: 140px;
    margin-top: 5px;
  }
`;

const UnlabeledInput = styled.div`
  & > * {
    margin-top: 26px;
  }
`;

const CheckboxInfo = styled.div`
  margin-left: 24px;
  font-size: 14px;
  font-style: italic;
  color: #4A4A4A;
`;