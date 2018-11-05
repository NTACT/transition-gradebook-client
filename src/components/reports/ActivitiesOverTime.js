import React, { Component } from 'react';
import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';
import ReportFormContainer from './ReportFormContainer';
import ReportFormDefaultLayout from './ReportFormDefaultLayout';
import Label from '../Label';
import Select from '../Select';
import TermSelect from '../TermSelect';
import getReportFileName from '../../utils/getReportFileName';

@observer
export default class ActivitiesOverTime extends Component {
  @observable startYearId = null;
  @observable startTermId = null;
  @observable endYearId = null;
  @observable endTermId = null;
  @observable studentId = null;
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
    const { startYear, startTerm, endYear, endTerm, selectedStudent } = this;
    return (
      startYear &&
      startTerm &&
      endYear && 
      endTerm &&
      selectedStudent
    );
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
      startYear,
      startTerm,
      endYear,
      endTerm,
      selectedStudent,
    } = this;

    const startYearId = startYear && startYear.id;
    const startTermId = startTerm && startTerm.id;
    const endYearId = endYear && endYear.id;
    const endTermId = endTerm && endTerm.id;

    let fileName = getReportFileName('student-activities-over-time', {
      startYear,
      startTerm,
      student: selectedStudent,
    });

    this.submitTask = store.downloadReport(
      'studentActivities',
      fileName,
      {
        startYearId,
        startTermId,
        endYearId,
        endTermId,
        studentId: selectedStudent.id,
      },
    );
  }

  render () {
    const { schoolYears, closePath } = this.props;

    const {
      startYear,
      startTerm,
      endYear,
      endTerm,
      selectableStudents,
      selectedStudent,
      canRun,
      submitTask,
    } = this;

    const startTermName = startYear ? startYear.capitalizedTermType : 'Term';
    const endTermName = endYear ? endYear.capitalizedTermType : 'Term';

    return (
      <ReportFormContainer title="Student Activities" subtitle="over time" onSubmit={this.handleSubmit} closePath={closePath} canRun={canRun} submitTask={submitTask}>
        <ReportFormDefaultLayout>
          <div>
            <Label>Starting Year</Label>
            <Select value={startYear && startYear.id} onChange={this.handleStartYearIdChange} placeholder="Start Year">
              {schoolYears.map(schoolYear =>
                <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.yearRange}</option>
              )}
            </Select>
          </div>
          <div style={{visibility: startYear && startYear.termType === 'annual' ? 'hidden' : 'visible'}}>
            <Label>Starting {startTermName}</Label>
            <TermSelect
              schoolYear={startYear}
              value={startTerm}
              onChange={this.handleStartTermIdChange}
              placeholder={`Start ${startTermName}`}
            />
          </div>
          <div>
            <Label>Ending Year</Label>
            <Select value={endYear && endYear.id} onChange={this.handleEndYearIdChange} placeholder="End Year">
              {schoolYears.map(schoolYear =>
                <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.yearRange}</option>
              )}
            </Select>
          </div>
          <div style={{visibility: endYear && endYear.termType === 'annual' ? 'hidden' : 'visible'}}>
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
            <Select value={selectedStudent && selectedStudent.id} onChange={this.handleSelectedStudentIdChange} placeholder="Choose a student or select 'All'">
              {selectableStudents && selectableStudents.map(student =>
                <option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>
              )}
            </Select>
          </div>
        </ReportFormDefaultLayout>
      </ReportFormContainer>
    )
  }
}
