import React, { Component } from 'react';
import styled from 'styled-components';
import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';
import ReportFormContainer from './ReportFormContainer';
import ReportFormDefaultLayout from './ReportFormDefaultLayout';
import Label from '../Label';
import RadioButton from '../RadioButton';
import Select from '../Select';
import Checkbox from '../Checkbox';
import TermSelect from '../TermSelect';
import getReportFileName from '../../utils/getReportFileName';

@observer
export default class SummaryReport extends Component {
  @observable longitudinal = false;
  @observable byDisability = false;
  @observable byRiskLevel = false;
  @observable byIEPRole = false;
  @observable bySupportNeed = false;
  @observable bySkillTraining = false;
  @observable byPostSchoolOutcome = false;
  @observable byActivityGroupTypes = false;

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
  }

  @computed get canRun() {
    const {
      startYear,
      startTerm,
      endYear,
      endTerm,
      longitudinal,
      byDisability,
      byRiskLevel,
      byIEPRole,
      bySupportNeed,
      bySkillTraining,
      byPostSchoolOutcome,
      byActivityGroupTypes,
    } = this;

    return (
      startYear &&
      startTerm &&
      (!longitudinal || (endYear && endTerm)) &&
      (
        byDisability ||
        byRiskLevel ||
        byIEPRole ||
        bySupportNeed ||
        bySkillTraining ||
        byPostSchoolOutcome ||
        byActivityGroupTypes
      )
    );
  }

  handleToggle = key => action(event => (this[key] = !this[key]));
  handleLongitudinalToggle = this.handleToggle('longitudinal');
  handleByDisabilityToggle = this.handleToggle('byDisability');
  handleByRiskLevelToggle = this.handleToggle('byRiskLevel');
  handleByIEPRoleToggle = this.handleToggle('byIEPRole');
  handleBySupportNeedToggle = this.handleToggle('bySupportNeed');
  handleBySkillTrainingToggle = this.handleToggle('bySkillTraining');
  handleByPostSchoolOutcomeToggle = this.handleToggle('byPostSchoolOutcome');
  handleByActivityGroupTypesToggle = this.handleToggle('byActivityGroupTypes');

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
      byDisability,
      byRiskLevel,
      byIEPRole,
      bySupportNeed,
      bySkillTraining,
      byPostSchoolOutcome,
      byActivityGroupTypes,
    } = this;

    let fileName, endpoint;
    if(longitudinal) {
      endpoint = '/numberOfStudents/longitudinal';
      fileName = getReportFileName('number-of-students-longitudinal', {
        startYear,
        startTerm,
        endYear,
        endTerm,
      }) + '-longitudinal';
    } else {
      endpoint = '/numberOfStudents/standard';
      fileName = getReportFileName('number-of-students-standard', {
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
        byDisability,
        byRiskLevel,
        byIEPRole,
        bySupportNeed,
        bySkillTraining,
        byPostSchoolOutcome,
        byActivityGroupTypes,
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
      byDisability,
      byRiskLevel,
      byIEPRole,
      bySupportNeed,
      bySkillTraining,
      byPostSchoolOutcome,
      byActivityGroupTypes,
      canRun,
      submitTask,
    } = this;

    const startTermName = startYear ? startYear.capitalizedTermType : 'Term';
    const endTermName = endYear ? endYear.capitalizedTermType : 'Term';

    return (
      <ReportFormContainer title="Total Number Of Students" onSubmit={this.handleSubmit} closePath={closePath} submitTask={submitTask} canRun={canRun}>
        <CountType>
          <RadioButton checked={!longitudinal} onChange={this.handleLongitudinalToggle}>Standard</RadioButton>
          <RadioButton checked={longitudinal} onChange={this.handleLongitudinalToggle}>Longitudinal</RadioButton>
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
        </ReportFormDefaultLayout>
        <ChooseCategories>
          <CategoryLabel>Choose report category</CategoryLabel>
          <ReportCategories>
            <Checkbox checked={byDisability} onChange={this.handleByDisabilityToggle}>by disability</Checkbox>
            <Checkbox checked={byRiskLevel} onChange={this.handleByRiskLevelToggle}>by risk level</Checkbox>
            <Checkbox checked={byIEPRole} onChange={this.handleByIEPRoleToggle}>role in IEP meeting</Checkbox>
            <Checkbox checked={bySupportNeed} onChange={this.handleBySupportNeedToggle}>needing support</Checkbox>
            <Checkbox checked={bySkillTraining} onChange={this.handleBySkillTrainingToggle}>skills training</Checkbox>
            <Checkbox checked={byPostSchoolOutcome} onChange={this.handleByPostSchoolOutcomeToggle}>post-school outcomes</Checkbox>
            <Checkbox checked={byActivityGroupTypes} onChange={this.handleByActivityGroupTypesToggle}>activity types</Checkbox>
          </ReportCategories>
        </ChooseCategories>
      </ReportFormContainer>
    )
  }
}

const CountType = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;

  & > * {
    width: 140px;
    margin-top: 5px;
  }
`;

const ChooseCategories = styled.div`
  margin-top: 20px;
`;

const CategoryLabel = styled(Label)`
  margin-bottom: 0;
`;

const ReportCategories = styled.div`
  display: flex;
  flex-wrap: wrap;

  & > * {
    margin-top: 10px;
    margin-right: 20px;
    width: calc(33.33% - 40px);
  }
`;