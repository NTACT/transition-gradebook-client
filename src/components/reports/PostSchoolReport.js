import React, { Component } from 'react';
import styled from 'styled-components';
import { observable, action, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import ReportFormContainer from './ReportFormContainer';
import ReportFormDefaultLayout from './ReportFormDefaultLayout';
import Label from '../Label';
import Select from '../Select';

import Checkbox from '../Checkbox';
import getReportFileName from '../../utils/getReportFileName';

@inject('store')
@observer
class PostSchoolStudentReport extends Component {
  @observable startYearId = null;
  @observable studentId = null;
  @observable allStudents = false;
  @observable submitTask = null;

  @computed get startYear() {
    const { schoolYears } = this.props;
    const { startYearId } = this;
     return startYearId && schoolYears.find(y => y.id === startYearId);
  }

  @computed get startTerm() {
    const { startYear } = this;
    return startYear && startYear.terms[0];
  }

  @computed get selectableStudents() {
    const { startTerm } = this;
    if(!startTerm) return [];
    return startTerm.students
      .filter(termInfo => termInfo.gradeLevel === 'Post-school');
  }

  @computed get selectedStudent() {
    const { studentId, selectableStudents } = this;
    return studentId && selectableStudents && selectableStudents.find(s => s.id === studentId)
  }

  @computed get canRun() {
    const { startYear, selectedStudent, allStudents } = this;
    return startYear && (allStudents || selectedStudent);
  }

  @action.bound async handleStartYearIdChange(event) {
    const { store } = this.props;
    this.startYearId = +event.target.value;
    this.studentId = null;
    const { startTerm } = this;
    if(startTerm) await store.fetchTermStudents(startTerm);
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
    const { startYear, selectedStudent, allStudents } = this;

    const startTerm = startYear && startYear.terms[0];
    const startYearId = startYear && startYear.id;
    const startTermId = startTerm && startTerm.id;
    const studentId = selectedStudent && selectedStudent.id;

    const fileName = getReportFileName('post-school-student', {
      startYear,
      student: selectedStudent,
    });

    if(allStudents) {
      // All students
      this.submitTask = store.downloadReport(
        '/postSchoolStudent',
        fileName,
        {startYearId, startTermId},
      );
    } else {
      // Individual student
      this.submitTask = store.downloadReport(
        '/postSchoolStudent',
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
      selectedStudent,
      selectableStudents,
      canRun,
      submitTask,
    } = this;

    return (
      <ReportFormContainer title="Post-School Student Report - Per Student" subtitle="one year" onSubmit={this.handleSubmit} closePath={closePath} canRun={canRun} submitTask={submitTask}>
        <ReportFormDefaultLayout>
          <div>
            <Label>Year</Label>
            <Select value={startYear && startYear.id} onChange={this.handleStartYearIdChange} placeholder="Year">
              {schoolYears.map(schoolYear =>
                <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.yearRange}</option>
              )}
            </Select>
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

export default PostSchoolStudentReport;

const UnlabeledInput = styled.div`
  & > * {
    margin-top: 26px;
  };
`;

const CheckboxInfo = styled.div`
  margin-left: 24px;
  font-size: 14px;
  font-style: italic;
  color: #4A4A4A;
`;
