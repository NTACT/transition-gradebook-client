import React, { Component } from 'react';
import styled from 'styled-components';
import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';
import ReportFormContainer from './ReportFormContainer';
import ReportFormDefaultLayout from './ReportFormDefaultLayout';
import Label from '../Label';
import RadioButton from '../RadioButton';
import Select from '../Select';
import TermSelect from '../TermSelect';
import getReportFileName from '../../utils/getReportFileName';

const dataCategories = [
  {label: 'Post-school Outcome', key: 'postSchoolOutcome'},
  {label: 'Skill Training', key: 'skillTraining'},
  {label: 'Support Needed', key: 'supportNeed'},
  {label: 'Risk Level', key: 'riskLevel'},
  {label: 'Disabilities', key: 'disability'},
  {label: 'IEP Role', key: 'iepRole'},
  {label: 'Activity Types', key: 'activityGroupTypes'},
  {label: 'Gender', key: 'gender'},
  {label: 'Race', key: 'race'},
];

function criteriaFilenameString(criteria) {
  switch(criteria) {
    case 'postSchoolOutcome': return 'post-school-outcome';
    case 'skillTraining': return 'skill-training';
    case 'supportNeed': return 'support-needed';
    case 'riskLevel': return 'risk-level';
    case 'disability': return 'disabilities';
    case 'gender': return 'gender';
    case 'race': return 'race';
    case 'iepRole': return 'iep-roles';
    case 'activityGroupTypes': return 'activity-types';
    default: return 'unknown';
  }
}

@observer
class NumberOfStudentsReport extends Component {
  @observable longitudinal = false;

  @observable criteria1 = null;
  @observable criteria2 = null;

  @observable startYearId = null;
  @observable startTermId = null;
  @observable endYearId = null;
  @observable endTermId = null;
  @observable submitTask = null;

  @computed get startYear() {
    const { startYearId } = this;
    const { schoolYears } = this.props;
    return startYearId && schoolYears.find(year => year.id === startYearId);
  }

  @computed get startTerm() {
    const { startTermId, startYear } = this;
    if(startTermId && startYear) {
      return startYear.terms.find(term => term.id === startTermId);
    } else if(startYear && startYear.termType === 'annual') {
      return startYear.terms[0];
    }
    return null;
  }

  @computed get endYear() {
    const { endYearId, longitudinal } = this;
    const { schoolYears } = this.props;
    return longitudinal && endYearId && schoolYears.find(year => year.id === endYearId);
  }

  @computed get endTerm() {
    const { endTermId, endYear } = this;
    if(endTermId && endYear) {
      return endYear.terms.find(term => term.id === endTermId);
    } else if(endYear && endYear.termType === 'annual') {
      return endYear.terms[0];
    }
    return null;
  }

  @computed get canRun() {
    const {
      startYear,
      startTerm,
      endYear,
      endTerm,
      longitudinal,
      criteria1,
    } = this;

    return (
      startYear &&
      startTerm &&
      criteria1 &&
      (!longitudinal || (endYear && endTerm))
    );
  }

  @action.bound handleLongitudinalToggle() {
    this.longitudinal = !this.longitudinal;
  }

  @action.bound handleCriteria1Change(event) {
    const criteria = event.target.value;

    if(this.criteria2 === criteria) this.criteria2 = this.criteria1;
    this.criteria1 = criteria;
  }

  @action.bound handleCriteria2Change(event) {
    const criteria = event.target.value;

    if(this.criteria1 === criteria) this.criteria1 = this.criteria2;
    this.criteria2 = criteria;
  }

  @action.bound handleStartYearIdChange(event) {
    this.startYearId = +event.target.value;
    this.startTermId = null;
  }

  @action.bound handleStartTermIdChange(event) {
    this.startTermId = +event.target.value;
  }

  @action.bound handleEndYearIdChange(event) {
    this.endYearId = +event.target.value;
    this.endTermId = null;
  }

  @action.bound handleEndTermIdChange(event) {
    this.endTermId = +event.target.value;
  }

  @action.bound handleSubmit() {
    const {
      longitudinal,
      startYear,
      startTerm,
      endYear,
      endTerm,
      criteria1,
      criteria2,
    } = this;

    let fileName, endpoint;
    if(longitudinal) {
      endpoint = '/numberOfStudents/longitudinal';
      fileName = getReportFileName(`number-of-students-longitudinal-${criteriaFilenameString(criteria1)}`, {
        startYear,
        startTerm,
        endYear,
        endTerm,
      }) + '-longitudinal';
    } else if(criteria2) {
      endpoint = '/numberOfStudentsCross';
      fileName = getReportFileName(`number-of-students-${criteriaFilenameString(criteria1)}-by-${criteriaFilenameString(criteria2)}-cross`, {
        startYear,
        startTerm,
      });
    } else {
      endpoint = '/numberOfStudents/standard';
      fileName = getReportFileName(`number-of-students-${criteriaFilenameString(criteria1)}`, {
        startYear,
        startTerm,
        endYear,
        endTerm,
      });
    }

    this.submitTask = this.props.store.downloadReport(
      endpoint,
      fileName,
      {
        startYearId: startYear && startYear.id,
        startTermId: startTerm && startTerm.id,
        endYearId: endYear && endYear.id,
        endTermId: endTerm && endTerm.id,
        primaryCriteria: criteria1,
        secondaryCriteria: criteria2,
      },
    );
  }

  render () {
    const { schoolYears, closePath } = this.props;
    const {
      longitudinal,
      startYear,
      startTerm,
      endYear,
      endTerm,
      criteria1,
      criteria2,
      canRun,
      submitTask,
    } = this;

    const startTermName = startYear ? startYear.capitalizedTermType : 'Term';
    const endTermName = endYear ? endYear.capitalizedTermType : 'Term';

    return (
      <ReportFormContainer title="Total Number Of Students" onSubmit={this.handleSubmit} closePath={closePath} submitTask={submitTask} canRun={canRun}>
        <CountType>
          <RadioButton checked={!longitudinal} onChange={this.handleLongitudinalToggle}>Standard</RadioButton>
          <RadioButton checked={longitudinal} onChange={this.handleLongitudinalToggle}>Longitudinal (one data category)</RadioButton>
        </CountType>
        <ReportFormDefaultLayout>
          <div>
            <Label>{longitudinal ? 'Starting Year' : 'School Year'}</Label>
            <Select value={startYear && startYear.id} onChange={this.handleStartYearIdChange} placeholder={longitudinal ? 'Starting Year' : 'School Year'}>
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
              placeholder={longitudinal ? `Starting ${startTermName}` : startTermName}
            />
          </div>
          <div hidden={!longitudinal}>
            <Label>Ending Year</Label>
            <Select value={endYear && endYear.id} onChange={this.handleEndYearIdChange} placeholder="Ending Year">
              {schoolYears.map(schoolYear =>
                <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.yearRange}</option>
              )}
            </Select>
          </div>
          <div hidden={!longitudinal || (endYear && endYear.termType === 'annual')}>
            <Label>Ending {endTermName}</Label>
            <TermSelect
              schoolYear={endYear}
              value={endTerm}
              onChange={this.handleEndTermIdChange}
              placeholder={`Ending ${endTermName}`}
            />
          </div>
          <div>
            <Label>{longitudinal ? 'Data Category' : 'Primary Data Category'}</Label>
            <DataCategorySelect placeholder="None" value={criteria1} onChange={this.handleCriteria1Change}/>
          </div>

          <div hidden={longitudinal}>
            <Label>Secondary Data Category (not required)</Label>
            <DataCategorySelect placeholder="None" value={criteria2} onChange={this.handleCriteria2Change} canSelectPlaceholder/>
          </div>
        </ReportFormDefaultLayout>
      </ReportFormContainer>
    )
  }
}

export default NumberOfStudentsReport;

function DataCategorySelect(props) {
  return (
    <Select {...props}>
      {dataCategories.map(c =>
        <option key={c.key} value={c.key}>{c.label}</option>
      )}
    </Select>
  );
}

const CountType = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;

  & > * {
    min-width: 140px;
    max-width: 300px;
    margin-top: 5px;
  }
`;
