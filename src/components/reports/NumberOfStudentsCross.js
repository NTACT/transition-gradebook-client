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
  @observable byDisability = false;
  @observable byRiskLevel = false;
  @observable byIEPRole = false;
  @observable bySupportNeed = false;
  @observable bySkillTraining = false;
  @observable byPostSchoolOutcome = false;
  @observable byActivityGroupTypes = false;

  @observable startYearId = null;
  @observable startTermId = null;
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

  @computed get checkedCount() {
    let count = 0;
    if(this.byDisability) count++;
    if(this.byRiskLevel) count++;
    if(this.byIEPRole) count++;
    if(this.bySupportNeed) count++;
    if(this.bySkillTraining) count++;
    if(this.byPostSchoolOutcome) count++;
    if(this.byActivityGroupTypes) count++;
    return count;
  }

  @computed get additionalChecksDisabled() {
    return this.checkedCount === 2;
  }

  @computed get canRun() {
    const {
      startYear,
      startTerm,
      byDisability,
      byRiskLevel,
      byIEPRole,
      bySupportNeed,
      bySkillTraining,
      byPostSchoolOutcome,
      byActivityGroupTypes,
      checkedCount,
    } = this;

    return (
      startYear &&
      startTerm &&
      checkedCount === 2 &&
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

  handleToggle = key => action(() => (this[key] = !this[key]));
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

  @action.bound handleSubmit() {
    const {
      startYear,
      startTerm,
      byDisability,
      byRiskLevel,
      byIEPRole,
      bySupportNeed,
      bySkillTraining,
      byPostSchoolOutcome,
      byActivityGroupTypes,
    } = this;

    const endpoint = '/numberOfStudentsCross';
    const fileName = getReportFileName('number-of-students-cross', {
      startYear,
      startTerm,
    });

    this.submitTask = this.props.store.downloadReport(
      endpoint,
      fileName,
      {
        startYearId: startYear && startYear.id,
        startTermId: startTerm && startTerm.id,
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
      startYear,
      startTerm,
      byDisability,
      byRiskLevel,
      byIEPRole,
      bySupportNeed,
      bySkillTraining,
      byPostSchoolOutcome,
      byActivityGroupTypes,
      additionalChecksDisabled,
      canRun,
      submitTask,
    } = this;

    const startTermName = startYear ? startYear.capitalizedTermType : 'Term';

    return (
      <ReportFormContainer title="Total Number Of Students (Cross)" onSubmit={this.handleSubmit} closePath={closePath} submitTask={submitTask} canRun={canRun}>
        <ReportFormDefaultLayout>
          <div>
            <Label>School Year</Label>
            <Select value={startYear && startYear.id} onChange={this.handleStartYearIdChange} placeholder="School Year">
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
        </ReportFormDefaultLayout>
        <ChooseCategories>
          <CategoryLabel>Choose report categories (Select 2)</CategoryLabel>
          <ReportCategories>
            <Checkbox disabled={!byDisability && additionalChecksDisabled} checked={byDisability} onChange={this.handleByDisabilityToggle}>by disability</Checkbox>
            <Checkbox disabled={!byRiskLevel && additionalChecksDisabled} checked={byRiskLevel} onChange={this.handleByRiskLevelToggle}>by risk level</Checkbox>
            <Checkbox disabled={!byIEPRole && additionalChecksDisabled} checked={byIEPRole} onChange={this.handleByIEPRoleToggle}>role in IEP meeting</Checkbox>
            <Checkbox disabled={!bySupportNeed && additionalChecksDisabled} checked={bySupportNeed} onChange={this.handleBySupportNeedToggle}>needing support</Checkbox>
            <Checkbox disabled={!bySkillTraining && additionalChecksDisabled} checked={bySkillTraining} onChange={this.handleBySkillTrainingToggle}>skills training</Checkbox>
            <Checkbox disabled={!byPostSchoolOutcome && additionalChecksDisabled} checked={byPostSchoolOutcome} onChange={this.handleByPostSchoolOutcomeToggle}>post-school outcomes</Checkbox>
            <Checkbox disabled={!byActivityGroupTypes && additionalChecksDisabled} checked={byActivityGroupTypes} onChange={this.handleByActivityGroupTypesToggle}>activity types</Checkbox>
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