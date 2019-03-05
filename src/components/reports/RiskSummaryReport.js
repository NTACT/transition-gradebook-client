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
class RiskSummaryReport extends Component {
  @observable startYearId = null;
  @observable startTermId = null;
  @observable endYearId = null;
  @observable endTermId = null;
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
    } else if(startYear && startYear.termType === 'annual') {
      return startYear.terms[0];
    }
  }

  @computed get endYear() {
    const { schoolYears } = this.props;
    const { endYearId } = this;
    return endYearId && schoolYears.find(year => year.id === endYearId);
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
    return (
      this.startYear &&
      this.startTerm &&
      this.endYear &&
      this.endTerm
    );
  }

  @action handleStartYearIdChange = event => {
    this.startYearId = +event.target.value;
    this.startTermId = null;
  };
  
  @action handleStartTermIdChange = event => {
    this.startTermId = +event.target.value;
  };

  @action handleEndYearIdChange = event => {
    this.endYearId = +event.target.value;
    this.endTermId = null;
  };
  
  @action handleEndTermIdChange = event => {
    this.endTermId = +event.target.value;
  };

  @action.bound async handleSubmit(studentFilters) {
    const { store } = this.props;
    const { startYear, startTerm, endYear, endTerm } = this;

    const startYearId = startYear && startYear.id;
    const startTermId = startTerm && startTerm.id;
    const endYearId = endYear && endYear.id;
    const endTermId = endTerm && endTerm.id;
    
    let filtered = false;
    for(let filter in studentFilters) {
      filtered = studentFilters[filter].length > 0;
      if(filtered) {
        break;
      }
    }

    const fileName = getReportFileName('risk-summary', {
      startYear,
      startTerm,
      endYear,
      endTerm,
      filtered
    });

    this.submitTask = store.downloadReport(
      '/riskSummary',
      fileName,
      {startYearId, startTermId, endYearId, endTermId, ...studentFilters},
    );
  }

  render () {
    const { schoolYears, closePath } = this.props;
    const {
      startYear,
      startTerm,
      endYear,
      endTerm,
      canRun,
      submitTask,
    } = this;

    const startTermName = startYear ? startYear.capitalizedTermType : 'Term';
    const endTermName = endYear ? endYear.capitalizedTermType : 'Term';

    return (
      <ReportFormContainer title="Risk Summary Report - All Students" titleActiveFilter="Risk Summary Report - Filtered Students" subtitle="over time" closePath={closePath} onSubmit={this.handleSubmit} canRun={canRun} submitTask={submitTask} includeFilters={true}>
        <ReportFormDefaultLayout>
          <div>
            <Label>Starting Year</Label>
            <Select value={startYear && startYear.id} onChange={this.handleStartYearIdChange} placeholder="Starting Year">
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
              placeholder={`Starting ${startTermName}`}
            />
          </div>
          <div>
            <Label>Ending Year</Label>
            <Select value={endYear && endYear.id} onChange={this.handleEndYearIdChange} placeholder="Ending Year">
              {schoolYears.map(schoolYear =>
                <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.yearRange}</option>
              )}
            </Select>
          </div>
          <div hidden={endYear && endYear.termType === 'annual'}>
            <Label>Ending {endTermName}</Label>
            <TermSelect
              schoolYear={endYear}
              value={endTerm}
              onChange={this.handleEndTermIdChange}
              placeholder={`Ending ${endTermName}`}
            />
          </div>
        </ReportFormDefaultLayout>
      </ReportFormContainer>
    )
  }
};
export default RiskSummaryReport;
