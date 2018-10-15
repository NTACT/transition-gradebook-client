import React, { Component } from 'react';
import ReportFormContainer from './ReportFormContainer';
import ReportFormDefaultLayout from './ReportFormDefaultLayout';
import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';
import Label from '../Label';
import Select from '../Select';
import TermSelect from '../TermSelect';
import getReportFileName from '../../utils/getReportFileName';

@observer
export default class SummaryReport extends Component {
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

  @action.bound async handleSubmit() {
    const { store } = this.props;
    const { startYear, startTerm } = this;

    const startYearId = startYear && startYear.id;
    const startTermId = startTerm && startTerm.id;

    const fileName = getReportFileName('summary', {
      startYear,
      startTerm,
    });

    this.submitTask = store.downloadReport(
      '/summary',
      fileName,
      {startYearId, startTermId},
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
      <ReportFormContainer title="Summary Report - All Students" subtitle={`one ${startTermName.toLowerCase()}`} onSubmit={this.handleSubmit} closePath={closePath} canRun={canRun} submitTask={submitTask}>
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
}