import React, { Component } from 'react';
import styled from 'styled-components';
import { observable, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import swal from 'sweetalert2';
import Input from './Input';
import Label from './Label';
import RadioButton from './RadioButton';
import YesNoNullSelect from './YesNoNullSelect';
import GradeInput from './GradeInput';
import FormRow from './FormRow';
import FormColumn from './FormColumn';
import SpinnerOverlay from './SpinnerOverlay';
import RiskFormWrapper from './RiskFormWrapper';

@inject('store')
@observer
class RiskFactorEditForm extends Component {
  @observable grade = '';
  @observable gradeType = null;
  @observable absentPercent = null;
  @observable behaviorMarks = null;
  @observable suspended = null;
  @observable failingEnglish = null;
  @observable failingMath = null;
  @observable failingOther = null;
  @observable onTrack = null;
  @observable retained = null;
  @observable schoolsAttended = null;
  @observable hasExtracurricular = null;
  @observable dirty = false;
  @observable saveTask = null;

  @action setKey(key, value) {
    this.dirty = true;
    this[key] = value;
  }

  handleBoolChange = key => value => this.setKey(key, value);
  handleStringChange = key => event => this.setKey(key, event.target.value);
  handleNumberChange = key => event => this.setKey(key, +event.target.value);

  handleGradeChange = this.handleStringChange('grade');
  handleAbsentPercentChange = this.handleNumberChange('absentPercent');
  handleBehaviorMarksChange = this.handleNumberChange('behaviorMarks');
  handleSuspendedChange = this.handleBoolChange('suspended');
  handleFailingEnglishChange = this.handleBoolChange('failingEnglish');
  handleFailingMathChange = this.handleBoolChange('failingMath');
  handleFailingOtherChange = this.handleBoolChange('failingOther');
  handleOnTrackChange = this.handleBoolChange('onTrack');
  handleRetainedChange = this.handleBoolChange('retained');
  handleschoolsAttendedChange = this.handleNumberChange('schoolsAttended');
  handleHasExtracurricularChange = this.handleBoolChange('hasExtracurricular');
  handleGradeTypeChange = gradeType => {
    this.setKey('gradeType', gradeType);
    this.setKey('grade', '');
  };

  @action.bound async handleSubmit(event) {
    const { store, student } = this.props;
    event.preventDefault();
    this.saveTask = store.editStudentTermInfo(student, {
      grade: this.grade,
      gradeType: this.gradeType,
      absentPercent: this.absentPercent,
      behaviorMarks: this.behaviorMarks,
      suspended: this.suspended,
      failingEnglish: this.failingEnglish,
      failingMath: this.failingMath,
      failingOther: this.failingOther,
      onTrack: this.onTrack,
      retained: this.retained,
      schoolsAttended: this.schoolsAttended,
      hasExtracurricular: this.hasExtracurricular,
    });

    await this.saveTask;
    this.dirty = false;
    swal('Success', 'Student risk factors saved successfully.', 'success');
  }

  edit(student) {
    this.grade = student.grade;
    this.gradeType = student.gradeType;
    this.absentPercent = student.absentPercent;
    this.behaviorMarks = student.behaviorMarks;
    this.suspended = student.suspended;
    this.failingEnglish = student.failingEnglish;
    this.failingMath = student.failingMath;
    this.failingOther = student.failingOther;
    this.onTrack = student.onTrack;
    this.retained = student.retained;
    this.schoolsAttended = student.schoolsAttended;
    this.hasExtracurricular = student.hasExtracurricular;
  }

  componentDidMount() {
    this.edit(this.props.student);
  }

  componentDidUpdate(prevProps) {
    if(prevProps.student !== this.props.student) {
      this.edit(this.props.student);
    }
  }

  render() {
    const {
      grade,
      gradeType,
      absentPercent,
      behaviorMarks,
      suspended,
      failingEnglish,
      failingMath,
      failingOther,
      onTrack,
      retained,
      schoolsAttended,
      hasExtracurricular,
      dirty,
      saveTask,
    } = this;

    return (
      <RiskFormWrapper {...this.props} title="EDIT RISK FACTORS" onSubmit={this.handleSubmit} dirty={dirty} saveTask={saveTask}>
        <SpinnerOverlay open={saveTask && saveTask.pending}/>
        <FormRow>
          <RadioColumn>
            <RadioColumnLabel>Grade</RadioColumnLabel>
            <RadioButton name="gradeType__letter" label="Letter Grade" checked={gradeType === 'letter'} onChange={this.handleGradeTypeChange.bind(null, 'letter')}/>
            <RadioButton name="gradeType__percent" label="Percentage" checked={gradeType === 'percent'} onChange={this.handleGradeTypeChange.bind(null, 'percent')}/>
            <RadioButton name="gradeType__gpa" label="GPA Point" checked={gradeType === 'gpa'} onChange={this.handleGradeTypeChange.bind(null, 'gpa')}/>
          </RadioColumn>

          <FormColumn>
            <GradeInput name="grade" gradeType={gradeType} value={maybeString(grade)} onChange={this.handleGradeChange}/>
          </FormColumn>
        </FormRow>

        <Divider/>

        <FormRow>
          <FormColumn>
            <Label>% of school time absent (excused or not)</Label>
            <Input
              value={maybeString(absentPercent)}
              onChange={this.handleAbsentPercentChange}
              name="absentPercent"
              type="number"
              min="0"
              max="100"
              placeholder="Enter as percentage (0.0 – 100.0)"
              step="0.01"
            />
          </FormColumn>
          <FormColumn>
            <Label># of behavior marks/office referrals</Label>
            <Input
              value={maybeString(behaviorMarks)}
              onChange={this.handleBehaviorMarksChange}
              name="behaviorMarks"
              type="number"
              min="0"
              placeholder="Enter a number"
            />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn>
            <Label>Was student suspended?</Label>
            <YesNoNullSelect name="suspended" value={suspended} onChange={this.handleSuspendedChange}/>
          </FormColumn>
          <FormColumn>
            <Label>Did student fail English/ELA?</Label>
            <YesNoNullSelect name="failingEnglish" value={failingEnglish} onChange={this.handleFailingEnglishChange}/>
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn>
            <Label>Did student fail Math?</Label>
            <YesNoNullSelect name="failingMath" value={failingMath} onChange={this.handleFailingMathChange}/>
          </FormColumn>
          <FormColumn>
            <Label>Did student fail any other class?</Label>
            <YesNoNullSelect name="failingOther" value={failingOther} onChange={this.handleFailingOtherChange}/>
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn>
            <Label>On-track (enough credits) for grade?</Label>
            <YesNoNullSelect name="onTrack" value={onTrack} onChange={this.handleOnTrackChange}/>
          </FormColumn>
          <FormColumn>
            <Label>Retained one or more years?</Label>
            <YesNoNullSelect name="retained" value={retained} onChange={this.handleRetainedChange}/>
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn>
            <Label># of schools enrolled in through present</Label>
            <Input
              name="schoolsAttended"
              value={maybeString(schoolsAttended)}
              onChange={this.handleschoolsAttendedChange}
              placeholder="Enter a number"
              type="number"
              min="0"
            />
          </FormColumn>
          <FormColumn>
            <Label>Any extracurricular activities?</Label>
            <YesNoNullSelect name="hasExtracurricular" value={hasExtracurricular} onChange={this.handleHasExtracurricularChange}/>
          </FormColumn>
        </FormRow>
      </RiskFormWrapper>
    );
  }
}

export default RiskFactorEditForm;

function maybeString(string) {
  return string == null ? '' : string;
}

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #D43425;
  margin: 24px 0 24px;
`;

const RadioColumn = styled(FormColumn)`
  >div {
    max-width: 200px;
  }
  >div + div {
    margin-top: 10px;
  };
`;

const RadioColumnLabel = styled(Label)`
  margin-bottom: 15px;
`;
