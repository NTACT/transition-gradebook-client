import React, { Component } from 'react';
import { chunk, capitalize } from 'lodash';
import styled from 'styled-components';
import swal from 'sweetalert2';
import { observable, action, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withRouter, Link } from 'react-router-dom';
import Button from './Button';
import RadioButton from './RadioButton';
import Checkbox from './Checkbox';
import { Rejected } from './Task';
import FormError from './FormError';
import FormRow from './FormRow';
import FormColumn from './FormColumn';
import EnumSelect from './EnumSelect';
import XButton from './XButton';
import Input from './Input';
import SpinnerOverlay from './SpinnerOverlay';
import enums from '../enums';

const formatRaceLabel = race => enums.raceLabels[race];

@withRouter
@inject('store')
@observer
class EditStudentForm extends Component {
  @observable studentToEdit = null;
  @observable firstName = '';
  @observable lastName = '';
  @observable birthday = '';
  @observable studentId = '';
  @observable gender = '';
  @observable race = '';
  @observable ell = null;
  @observable gradeLevel = '';
  @observable postSchoolOutcome = null;
  @observable postSchoolOutcomeOther = null;
  @observable exitCategory = null;
  @observable selectedDisabilities = [];
  @observable plan504 = null; 
  @observable fetchDisabilitiesTask = null;
  @observable submitTask = null;

  @computed get fields() {
    const {
      firstName,
      lastName,
      birthday,
      studentId,
      gender,
      race,
      ell,
      gradeLevel,
      postSchoolOutcome,
      postSchoolOutcomeOther,
      exitCategory,
      selectedDisabilities,
      plan504,
    } = this;

    return {
      firstName,
      lastName,
      studentId,
      gender,
      race,
      ell,
      gradeLevel,
      exitCategory,
      postSchoolOutcome: postSchoolOutcome === 'Other'
        ? (postSchoolOutcomeOther || '')
        : postSchoolOutcome,
      birthday: new Date(birthday),
      disabilities: selectedDisabilities,
      plan504,
    };
  }

  @action.bound handleFirstNameChange(event) {
    this.firstName = event.target.value;
  }

  @action.bound handleLastNameChange(event) {
    this.lastName = event.target.value;
  }

  @action.bound handleStudentIdChange(event) {
    this.studentId = event.target.value;
  }

  @action.bound handleBirthdayChange(event) {
    this.birthday = event.target.value;
  }

  @action.bound handleGenderChange(gender) {
    this.gender = gender;
  }

  @action.bound handleRaceChange(event) {
    this.race = event.target.value;
  }

  @action.bound handleEllChange(enabled) {
    this.ell = enabled;
  }

  @action.bound handle504PlanChange(enabled){
    this.plan504 = enabled; 
  }

  @action.bound handleGradeLevelChange(event) {
    const gradeLevel = event.target.value;
    this.gradeLevel = gradeLevel;
    if(gradeLevel !== 'Post-school') {
      this.exitCategory = null;
      this.postSchoolOutcome = null;
      this.postSchoolOutcomeOther = null;
    }
  }

  @action.bound handlePostSchoolOutcomeChange(event) {
    const outcome = event.target.value;
    this.postSchoolOutcome = outcome;

    if(outcome === 'Other') {
      this.postSchoolOutcomeOther = '';
    }
  }

  @action.bound handlePostSchoolOutcomeOtherChange(event) {
    this.postSchoolOutcomeOther = event.target.value;
  }

  @action.bound handleExitCategoryChange(event) {
    this.exitCategory = event.target.value;
  }

  @action.bound handleAddDisability(disabilityId) {
    this.selectedDisabilities.push(disabilityId);
  }

  @action.bound handleRemoveDisability(disabilityId) {
    this.selectedDisabilities.remove(disabilityId);
  }

  @action.bound async handleSubmit(event) {
    event.stopPropagation();
    event.preventDefault();
    const { studentToEdit, fields } = this;
    const { schoolYear, store } = this.props;
    let student;

    if(studentToEdit) {
      this.submitTask = store.updateStudent(studentToEdit, schoolYear, fields);
      student = await this.submitTask;
      if(this.submitTask.resolved) {
        await swal(
          'Success',
          `Student ${student.fullName} updated`,
          'success'
        );
      }
    } else {
      this.submitTask = store.createStudent(schoolYear, fields);
      student = await this.submitTask;
      if(this.submitTask.resolved) {
        this.props.history.push(student.getEditRoute(schoolYear));
        await swal(
          'Success',
          `Student ${student.fullName} created`,
          'success'
        );
      }
    }
  }

  @action.bound async handleDeleteClick(event) {
    event.stopPropagation();
    event.preventDefault();
    const { studentToEdit } = this;
    const { schoolYear } = this.props;
    const confirmResult = await swal({
      title: 'Are you sure?',
      text: `This will remove all ${schoolYear.year} data for ${studentToEdit.fullName}.`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    });

    if(!confirmResult.value) return;

    const { store } = this.props;
    if(studentToEdit) {
      const removeTask = store.removeStudentFromSchoolYear(this.studentToEdit, schoolYear);
      await removeTask;
      if(removeTask.resolved) {
        this.props.history.push('/Students');

        await swal(
          'Success',
          `Student ${studentToEdit.fullName} removed`,
          'success'
        );
      }
    }
  }

  @action editExisting(student) {
    const { postSchoolOutcome } = student;
    this.studentToEdit = student;
    this.firstName = student.firstName;
    this.lastName = student.lastName;
    this.birthday = student.birthdayDateString;
    this.studentId = student.studentId;
    this.gender = student.gender;
    this.race = student.race || '';
    this.ell = student.ell;
    this.gradeLevel = student.gradeLevel;
    this.exitCategory = student.exitCategory;
    this.selectedDisabilities = student.disabilities.map(d => d.id);
    this.plan504 = student.plan504; 
    if(enums.postSchoolOutcomes.includes(postSchoolOutcome)) {
      this.postSchoolOutcome = postSchoolOutcome;
    } else {
      this.postSchoolOutcome = 'Other';
      this.postSchoolOutcomeOther = postSchoolOutcome;
    }
  }

  componentDidMount() {
    if(this.props.student) {
      this.editExisting(this.props.student);
    }
  }

  render() {
    const { schoolYear, student } = this.props;
    const {
      studentToEdit,
      firstName,
      lastName,
      birthday,
      studentId,
      gender,
      race,
      ell,
      gradeLevel,
      postSchoolOutcome,
      postSchoolOutcomeOther,
      exitCategory,
      selectedDisabilities,
      plan504,
      submitTask,
    } = this;
    const { disabilities } = this.props.store;
    const disabilityRows = chunk(disabilities, 2);

    const renderDisability = disability => {
      const checked = selectedDisabilities.includes(disability.id);
      return (
        <DisabilityCheckbox
          name={`disability__${disability.name}`}
          checked={checked}
          onChange={checked
            ? this.handleRemoveDisability.bind(null, disability.id)
            : this.handleAddDisability.bind(null, disability.id)
          }
          key={disability.id}
          label={<div><b>{disability.name}</b> {disability.fullName}</div>}
        />
      );
    };

    return (
      <Root>
        <SpinnerOverlay open={submitTask && submitTask.pending}/>
        <Form onSubmit={this.handleSubmit}>
          <Header>
            <Title>
              {studentToEdit
                ? 'EDIT STUDENT'
                : 'ADD A NEW STUDENT'
              }
            </Title>
            <XButton component={Link} to={`/${schoolYear.id}/students/view/${studentToEdit ? student.id : ''}`}/>
          </Header>

          <Rejected task={submitTask}>
            {() => <SubmitError error={submitTask.error}/>}
          </Rejected>

          <FormRow>
            <FormColumn>
              <InputLabel>Student First Name</InputLabel>
              <Input name="firstName" value={firstName} onChange={this.handleFirstNameChange}/>
            </FormColumn>

            <FormColumn>
              <InputLabel>Student Last Name</InputLabel>
              <Input name="lastName" value={lastName} onChange={this.handleLastNameChange}/>
            </FormColumn>
          </FormRow>

          <FormRow>
            <FormColumn>
              <InputLabel>Student ID</InputLabel>
              <Input name="studentId" value={studentId} onChange={this.handleStudentIdChange}/>
            </FormColumn>

            <FormColumn>
              <InputLabel>Date of Birth</InputLabel>
              <Input name="birthday" type="date" value={birthday} onChange={this.handleBirthdayChange}/>
            </FormColumn>
          </FormRow>
        
          <FormRow>
            <FormColumn>
              <InputLabel>Gender</InputLabel>
              <RadioRow>
                {enums.genders.map(g =>
                  <RadioButton
                    key={g}
                    name={`gender__${g}`}
                    label={capitalize(g)}
                    onChange={this.handleGenderChange.bind(null, g)}
                    checked={gender === g}
                  />
                )}
              </RadioRow>
            </FormColumn>

            <FormColumn>
              <InputLabel>ELL</InputLabel>
              <RadioRow>
                <RadioButton onChange={this.handleEllChange.bind(null, true)} checked={ell === true} name="ell__yes" label="Yes"/>
                <RadioButton onChange={this.handleEllChange.bind(null, false)} checked={ell === false} name="ell__no" label="No"/>
              </RadioRow>
            </FormColumn>
          </FormRow>

          <FormRow>
            <FormColumn>
              <InputLabel>Race</InputLabel>
              <RaceSelect onChange={this.handleRaceChange} value={race} format={formatRaceLabel}/>
            </FormColumn>
            <FormColumn>
              <InputLabel>Grade</InputLabel>
              <GradeSelect onChange={this.handleGradeLevelChange} value={gradeLevel}/>
            </FormColumn>
          </FormRow>

          {gradeLevel === 'Post-school' &&
            <FormRow>
              <FormColumn>
                <InputLabel>Exit Category</InputLabel>
                <EnumSelect
                  name="exitCategories"
                  placeholder="Exit Categories"
                  onChange={this.handleExitCategoryChange}
                  value={exitCategory}
                />
              </FormColumn>
              <FormColumn>
                <InputLabel>Post School Outcome</InputLabel>
                <EnumSelect
                  name="postSchoolOutcomes"
                  placeholder="Post School Outcome"
                  onChange={this.handlePostSchoolOutcomeChange}
                  value={postSchoolOutcome}
                />
              </FormColumn>
              {postSchoolOutcome === 'Other' &&
                <FormColumn>
                  <InputLabel>&nbsp;{/* Non-breaking space for height */}</InputLabel>
                  <Input
                    placeholder="Post School Outcome"
                    onChange={this.handlePostSchoolOutcomeOtherChange}
                    value={postSchoolOutcomeOther}
                  />
                </FormColumn>
              }
            </FormRow>
          }

          <DisabilitiesHeader>
            <b>Disability Category</b> (select all that apply)
          </DisabilitiesHeader>
          <DisabilityCheckboxes>
            {disabilityRows.map((disabilities, i) => 
              <DisabilityCheckboxRow key={i}>
                {disabilities.map(renderDisability)}
              </DisabilityCheckboxRow>
            )}
          </DisabilityCheckboxes>
          <FormRow>
          <FormColumn>
              <InputLabel>Has 504 Plan</InputLabel>
              <RadioRow>
                <RadioButton onChange={this.handle504PlanChange.bind(null, true)} checked={plan504} name="yes__504" label="Yes"/>
                <RadioButton onChange={this.handle504PlanChange.bind(null, false)} checked={!plan504} name="no__504" label="No"/>
              </RadioRow>
            </FormColumn>
            </FormRow>
          <FormRow>
            <FormColumn>
              <SaveButton onClick={this.handleSubmit}>SAVE</SaveButton>
            </FormColumn>
            <FormColumn>
              {studentToEdit &&
                <RemoveButton onClick={this.handleDeleteClick}>DELETE</RemoveButton>
              }
            </FormColumn>
          </FormRow>
        </Form>
      </Root>
    );
  }
}

export default EditStudentForm;

const Root = styled.div`
  position: relative;
  flex: 1;
  padding: 33px 38px 33px 38px;
  background-color: #F2F2F2;
  overflow: auto;
`;

const SubmitError = styled(FormError)`
  margin-bottom: 20px;
`;

const Title = styled.h1`
	color: #D43425;
  font-family: "Oswald";
  font-weight: 200;
	font-size: 16px;
  line-height: 21px;
`;

const Header = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 800px;
`;

const InputLabel = styled.label`
	color: #555555;
	font-family: "Open Sans";
	font-size: 14px;
	font-weight: bold;
  line-height: 19px;
  margin-bottom: 7px;
`;

const RadioRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 40px;

  > div + div {
    margin-left: 30px;
  }
`;

const GradeSelect = styled(EnumSelect).attrs({
  name: 'grades',
  inputName: 'gradeLevel',
  placeholder: 'Select a grade',
})``;

const RaceSelect = styled(EnumSelect).attrs({
  name: 'races',
  inputName: 'race',
  placeholder: 'Select a race',
})``;

const DisabilitiesHeader = styled.div`
	color: #555555;
	font-family: "Open Sans";
	font-size: 14px;
  line-height: 19px;
  margin: 24px 0 24px;
`;

const DisabilityCheckboxes = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
`;

const DisabilityCheckboxRow = styled.div`
  display: flex;
  flex-direction: row;

  & + & {
    margin-top: 20px;
  }

  > div + div {
    margin-left: 50px;
  }
`;

const DisabilityCheckbox = styled(Checkbox)`
  flex: 1 1 100%;
  b {
    font-weight: bold;
  }
`;

const SaveButton = styled(Button)`
  color: white;
  height: 50px;
  background-color: #D43425;
  width: 100%;
  font-family: "Oswald";
  font-size: 16px;
  line-height: 21px;
  font-weight: 200;
`;

const RemoveButton = styled(Button)`
  color: white;
  height: 50px;
  background-color: #4A4A4A;
  width: 100%;
  font-family: "Oswald";
  font-size: 16px;
  line-height: 21px;
  font-weight: 200;
`;
