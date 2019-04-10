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
import RadioButton from '../RadioButton';

const noop = () => {};

@inject('store')
@observer
class StudentReport extends Component {
  @observable longitudinal = false;
  @observable startYearId = null;
  @observable startTermId = null;
  @observable endYearId = null;
  @observable endTermId = null;
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

  @computed get endYear() {
    const { schoolYears } = this.props;
    const { endYearId } = this;
    return endYearId && schoolYears.find(y => y.id === endYearId);
  }

  @computed get endTerm() {
    const { endTermId, endYear } = this;
    return endYear && endYear.terms.find(term => term.id === endTermId);
  }

  @computed get selectableStudents() {
    const { startTerm } = this;
    return (
      startTerm &&
      startTerm.students.filter(student => student.gradeLevel !== 'Post-school')
    );
  }

  @computed get selectedStudent() {
    const { studentId, selectableStudents } = this;
    return (
      studentId &&
      selectableStudents &&
      selectableStudents.find(s => s.id === studentId)
    );
  }

  @computed get canRun() {
    const {
      longitudinal,
      startYear,
      startTerm,
      endYear,
      endTerm,
      selectedStudent,
      allStudents
    } = this;
    if (longitudinal) {
      return startYear && startTerm && endYear && endTerm && selectedStudent;
    }
    return startYear && startTerm && (selectedStudent || allStudents);
  }

  @action.bound handleLongitudinalToggle() {
    this.longitudinal = !this.longitudinal;
    if (this.longitudinal) {
      this.allStudents = false;
    } else {
      this.endYearId = null;
      this.endTermId = null;
    }
  }

  @action.bound async handleStartYearIdChange(event) {
    this.startTermId = null;
    this.studentId = null;
    this.startYearId = +event.target.value;
    const { startYear } = this;
    if (startYear && startYear.termType === 'annual') {
      this.setStartTermId(startYear.terms[0].id);
    }
  }

  @action.bound async handleEndYearIdChange(event) {
    this.endTermId = null;
    this.studentId = null;
    this.endYearId = +event.target.value;
    const { endYear } = this;
    if (endYear && endYear.termType === 'annual') {
      this.setEndTermId(endYear.terms[0].id);
    }
  }

  @action.bound async setStartTermId(startTermId) {
    const { store } = this.props;
    this.startTermId = startTermId;
    this.studentId = null;
    const { startTerm } = this;
    if (startTerm) await store.fetchTermStudents(startTerm);
  }

  @action.bound async setEndTermId(endTermId) {
    this.endTermId = endTermId;
  }

  @action.bound handleStartTermIdChange(event) {
    return this.setStartTermId(+event.target.value);
  }

  @action.bound handleEndTermIdChange(event) {
    return this.setEndTermId(+event.target.value);
  }

  @action.bound handleStudentIdChange(event) {
    this.studentId = +event.target.value;
  }

  @action.bound handleAllStudentsToggle() {
    this.allStudents = !this.allStudents;
    if (this.allStudents) {
      this.studentId = null;
    }
  }

  @action.bound handleSubmit() {
    const { store } = this.props;
    const {
      longitudinal,
      allStudents,
      startYear,
      startTerm,
      endYear,
      endTerm,
      selectedStudent
    } = this;

    const startYearId = startYear && startYear.id;
    const startTermId = startTerm && startTerm.id;
    const endYearId = endYear && endYear.id;
    const endTermId = endTerm && endTerm.id;
    const studentId = selectedStudent && selectedStudent.id;

    if (longitudinal) {
      let fileName = getReportFileName('student-over-time', {
        startYear,
        startTerm,
        student: selectedStudent
      });

      this.submitTask = store.downloadReport('studentActivities', fileName, {
        startYearId,
        startTermId,
        endYearId,
        endTermId,
        studentId: selectedStudent.id
      });
    } else {
      const fileName = getReportFileName('student', {
        startYear,
        startTerm,
        student: selectedStudent
      });

      if (allStudents) {
        // All students
        this.submitTask = store.downloadReport('/student', fileName, {
          startYearId,
          startTermId
        });
      } else if (studentId) {
        // Individual student
        this.submitTask = store.downloadReport('/student', fileName, {
          startYearId,
          startTermId,
          studentId
        });
      }
    }
  }

  render() {
    const { schoolYears, closePath } = this.props;
    const {
      allStudents,
      startYear,
      startTerm,
      endYear,
      endTerm,
      selectedStudent,
      selectableStudents,
      canRun,
      submitTask,
      longitudinal
    } = this;

    const startTermName = startYear ? startYear.capitalizedTermType : 'Term';
    const endTermName = endYear ? endYear.capitalizedTermType : 'Term';
    const subtitle = longitudinal
      ? 'over time'
      : `one ${startTermName.toLowerCase()}`;

    const startYearLabel = longitudinal ? 'Starting Year' : 'School Year';

    const startTermLabel = longitudinal
      ? `Starting ${startTermName}`
      : startTermName;

    return (
      <ReportFormContainer
        title="Student Report - Per Student"
        subtitle={subtitle}
        onSubmit={this.handleSubmit}
        closePath={closePath}
        canRun={canRun}
        submitTask={submitTask}
      >
        <CountType>
          <RadioButton
            checked={!longitudinal}
            onChange={longitudinal ? this.handleLongitudinalToggle : noop}
          >
            Standard
          </RadioButton>
          <RadioButton
            checked={longitudinal}
            onChange={longitudinal ? noop : this.handleLongitudinalToggle}
          >
            Longitudinal
          </RadioButton>
        </CountType>
        <ReportFormDefaultLayout>
          <div>
            <Label>{startYearLabel}</Label>
            <Select
              value={startYear && startYear.id}
              onChange={this.handleStartYearIdChange}
              placeholder="Year"
            >
              {schoolYears.map(schoolYear => (
                <option key={schoolYear.id} value={schoolYear.id}>
                  {schoolYear.yearRange}
                </option>
              ))}
            </Select>
          </div>
          <div
            style={{
              visibility:
                startYear && startYear.termType === 'annual'
                  ? 'hidden'
                  : 'visible'
            }}
          >
            <Label>{startTermLabel}</Label>
            <TermSelect
              schoolYear={startYear}
              value={startTerm}
              onChange={this.handleStartTermIdChange}
              placeholder={startTermName}
            />
          </div>

          {longitudinal && (
            <div>
              <Label>Ending Year</Label>
              <Select
                value={endYear && endYear.id}
                onChange={this.handleEndYearIdChange}
                placeholder="Year"
              >
                {schoolYears.map(schoolYear => (
                  <option key={schoolYear.id} value={schoolYear.id}>
                    {schoolYear.yearRange}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {longitudinal && (
            <div
              style={{
                visibility:
                  endYear && endYear.termType === 'annual'
                    ? 'hidden'
                    : 'visible'
              }}
            >
              <Label>Ending {endTermName}</Label>
              <TermSelect
                schoolYear={endYear}
                value={endTerm}
                onChange={this.handleEndTermIdChange}
                placeholder={endTermName}
              />
            </div>
          )}

          <div>
            <Label>Student</Label>
            <Select
              placeholder="Choose a student"
              value={selectedStudent && selectedStudent.id}
              disabled={allStudents}
              onChange={this.handleStudentIdChange}
            >
              {selectableStudents &&
                selectableStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.studentId})
                  </option>
                ))}
            </Select>
          </div>

          {!longitudinal && (
            <UnlabeledInput>
              <div>
                <Checkbox
                  checked={allStudents}
                  onChange={this.handleAllStudentsToggle}
                >
                  All Students
                </Checkbox>
                <CheckboxInfo>
                  Select to run one report for each student.
                </CheckboxInfo>
              </div>
            </UnlabeledInput>
          )}
        </ReportFormDefaultLayout>
      </ReportFormContainer>
    );
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
  color: #4a4a4a;
`;

const CountType = styled.div`
  margin-bottom: 25px;

  & > * {
    width: 140px;
    margin-top: 5px;
  }
`;
