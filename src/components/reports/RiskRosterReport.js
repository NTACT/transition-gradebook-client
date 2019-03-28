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
class SummaryReport extends Component {
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
    return null;
  }

  @computed get canRun() {
    return this.startYear && this.startTerm;
  }

  @action handleStartYearIdChange = event => {
    this.startYearId = +event.target.value;
    this.startTermId = null;
  };
  
  @action handleStartTermIdChange = event => {
    this.startTermId = +event.target.value;
  };

  @action.bound async handleSubmit(studentFilters) {
    const { store } = this.props;
    const { startYear, startTerm } = this;
    
    const startYearId = startYear && startYear.id;
    const startTermId = startTerm && startTerm.id;
    
    let filtered = false;
    for(let filter in studentFilters) {
      filtered = studentFilters[filter].length > 0;
      if(filtered) {
        break;
      }
    }

    const fileName = getReportFileName('risk-roster', {
      startYear,
      startTerm,
      filtered
    });

    this.submitTask = store.downloadReport(
      '/riskRoster',
      fileName,
      {startYearId, startTermId, ...studentFilters},
    );
  }

  render () {
    const { schoolYears, closePath } = this.props;
    const {
      startYear,
      startTerm,
      canRun,
      submitTask,
    } = this;

    const startTermName = startYear ? startYear.capitalizedTermType : 'Term';

    return (
      <ReportFormContainer title="Risk Roster Report - All Students" titleActiveFilter="Risk Roster Report - Filtered Students" subtitle={`one ${startTermName.toLowerCase()}`} onSubmit={this.handleSubmit} closePath={closePath} canRun={canRun} submitTask={submitTask} includeFilters={true}>
        <ReportFormDefaultLayout>
          <div>
            <Label>School Year</Label>
            <Select value={startYear && startYear.id} onChange={this.handleStartYearIdChange} placeholder="Year">
              {schoolYears.map(schoolYear =>
                <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.yearRange}</option>
              )}
            </Select>
          </div>
          <div hidden={startYear && startYear.termType === 'annual'}>
            <Label>{startTermName}</Label>
            <TermSelect
              schoolYear={startYear}
              value={startTerm}
              onChange={this.handleStartTermIdChange}
              placeholder={startTermName}
            />
          </div>
        </ReportFormDefaultLayout>
      </ReportFormContainer>
    )
  }
};
export default SummaryReport;