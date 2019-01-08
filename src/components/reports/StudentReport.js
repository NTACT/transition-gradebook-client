import React, { Component } from 'react';
import styled from 'styled-components';
import { observable, action, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import ReportFormContainer from './ReportFormContainer';
import ReportFormDefaultLayout from './ReportFormDefaultLayout';
import Label from '../Label';
import Select from '../Select';
import Checkbox from '../Checkbox';
import TermSelect from '../TermSelect';
import getReportFileName from '../../utils/getReportFileName';
@inject('store')
@observer
class StudentReport extends Component {
  @observable startYearId = null;
  @observable startTermId = null;
  @observable studentId = null;
  @observable allStudents = false;
  @observable submitTask = null;

  @computed get startYear() {
    const { schoolYears } = this.props;
    const { startYearId } = this;
     return startYearId && schoolYears.find(y => y.id === startYearId);
  }

  @computed get startTerm() {
    const { startTermId, startYear } = this;
    return startYear && startYear.terms.find(term => term.id === startTermId);
  }

  @computed get selectableStudents() {
    const { startTerm } = this;
    return startTerm && startTerm.students.filter(student => student.gradeLevel !== 'Post-school');
  }

  @computed get selectedStudent() {
    const { studentId, selectableStudents } = this;
    return studentId && selectableStudents && selectableStudents.find(s => s.id === studentId)
  }

  @computed get canRun() {
    const { startYear, startTerm, selectedStudent, allStudents } = this;
    return (
      startYear &&
      startTerm &&
      (selectedStudent || allStudents)
    );
  }

  @action.bound async handleStartYearIdChange(event) {
    this.startTermId = null;
    this.studentId = null;
    this.startYearId = +event.target.value;
    const { startYear } = this;
    if(startYear && startYear.termType === 'annual') {
      this.setStartTermId(startYear.terms[0].id);
    }
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

  @action.bound handleStudentIdChange(event) {
    this.studentId = +event.target.value;
  }

  @action.bound handleAllStudentsToggle() {
    this.allStudents = !this.allStudents;
    if(this.allStudents) {
      this.studentId = null;
    }
  }

  @action.bound handleSubmit() {
    const { store } = this.props;
    const { allStudents, startYear, startTerm, selectedStudent } = this;

    const startYearId = startYear && startYear.id;
    const startTermId = startTerm && startTerm.id;
    const studentId = selectedStudent && selectedStudent.id;

    const fileName = getReportFileName('student', {
      startYear,
      startTerm,
      student: selectedStudent,
    });

    if(allStudents) {
      // All students
      this.submitTask = store.downloadReport(
        '/student',
        fileName,
        {startYearId, startTermId},
      );
    } else if(studentId) {
      // Individual student
      this.submitTask = store.downloadReport(
        '/student',
        fileName,
        {startYearId, startTermId, studentId},
      );
    }
  }

  render () {
    const {
      schoolYears,
      closePath,
    } = this.props;
    const {
      allStudents,
      startYear,
      startTerm,
      selectedStudent,
      selectableStudents,
      canRun,
      submitTask,
    } = this;

    const startTermName = startYear ? startYear.capitalizedTermType : 'Term';

    return (
      <ReportFormContainer title="Student Report - Per Student" subtitle={`one ${startTermName.toLowerCase()}`} onSubmit={this.handleSubmit} closePath={closePath} canRun={canRun} submitTask={submitTask}>
        <ReportFormDefaultLayout>
          <div>
            <Label>School Year</Label>
            <Select value={startYear && startYear.id} onChange={this.handleStartYearIdChange} placeholder="Year">
              {schoolYears.map(schoolYear =>
                <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.yearRange}</option>
              )}
            </Select>
          </div>
          <div style={{visibility: startYear && startYear.termType === 'annual' ? 'hidden' : 'visible'}}>
            <Label>{startTermName}</Label>
            <TermSelect
              schoolYear={startYear}
              value={startTerm}
              onChange={this.handleStartTermIdChange}
              placeholder={startTermName}
            />
          </div>
          <div>
            <Label>Student</Label>
            <Select placeholder="Choose a student or select 'All'" value={selectedStudent && selectedStudent.id} disabled={allStudents} onChange={this.handleStudentIdChange}>
              {selectableStudents && selectableStudents.map(student => 
                <option key={student.id} value={student.id}>{student.fullName} ({student.studentId})</option>
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

export default StudentReport;

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
