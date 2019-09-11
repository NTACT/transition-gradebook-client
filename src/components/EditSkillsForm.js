import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import swal from 'sweetalert2';
import Label from './Label';
import YesNoNullSelect from './YesNoNullSelect';
import FormRow from './FormRow';
import FormColumn from './FormColumn';
import RiskFormWrapper from './RiskFormWrapper';

@inject('store')
@observer
class SkillsEditForm extends Component {
  @observable hasSelfDeterminationSkills = null;
  @observable hasIndependentLivingSkills = null;
  @observable hasTravelSkills = null;
  @observable hasSocialSkills = null;
  @observable dirty = false;
  @observable saveTask = null;

  @action setKey(key, value) {
    this.dirty = true;
    this[key] = value;
  }

  handleBoolChange = key => value => this.setKey(key, value);
  handleHasSelfDeterminationSkillsChange = this.handleBoolChange(
    'hasSelfDeterminationSkills'
  );
  handleHasIndependentLivingSkillsChange = this.handleBoolChange(
    'hasIndependentLivingSkills'
  );
  handleHasTravelSkillsChange = this.handleBoolChange('hasTravelSkills');
  handleHasSocialSkillsChange = this.handleBoolChange('hasSocialSkills');

  @action.bound async handleSubmit(event) {
    const { store, student } = this.props;
    event.preventDefault();
    this.saveTask = store.editStudentTermInfo(student, {
      hasSelfDeterminationSkills: this.hasSelfDeterminationSkills,
      hasIndependentLivingSkills: this.hasIndependentLivingSkills,
      hasTravelSkills: this.hasTravelSkills,
      hasSocialSkills: this.hasSocialSkills
    });

    await this.saveTask;
    this.dirty = false;
    await swal('Success', 'Student skills saved successfully.', 'success');
  }

  edit(student) {
    this.hasSelfDeterminationSkills = student.hasSelfDeterminationSkills;
    this.hasIndependentLivingSkills = student.hasIndependentLivingSkills;
    this.hasTravelSkills = student.hasTravelSkills;
    this.hasSocialSkills = student.hasSocialSkills;
  }

  componentDidMount() {
    this.edit(this.props.student);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.student !== this.props.student) {
      this.edit(this.props.student);
    }
  }

  render() {
    const {
      hasSelfDeterminationSkills,
      hasIndependentLivingSkills,
      hasTravelSkills,
      hasSocialSkills,
      dirty,
      saveTask
    } = this;

    return (
      <RiskFormWrapper
        {...this.props}
        title="EDIT STUDENT SKILLS"
        onSubmit={this.handleSubmit}
        dirty={dirty}
        saveTask={saveTask}
      >
        <FormRow>
          <FormColumn>
            <Label>Self-determination skills/self advocacy training</Label>
            <YesNoNullSelect
              value={hasSelfDeterminationSkills}
              onChange={this.handleHasSelfDeterminationSkillsChange}
            />
          </FormColumn>
          <FormColumn>
            <Label>Independent living skills</Label>
            <YesNoNullSelect
              value={hasIndependentLivingSkills}
              onChange={this.handleHasIndependentLivingSkillsChange}
            />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn>
            <Label>Travel skills</Label>
            <YesNoNullSelect
              value={hasTravelSkills}
              onChange={this.handleHasTravelSkillsChange}
            />
          </FormColumn>
          <FormColumn>
            <Label>Social skills</Label>
            <YesNoNullSelect
              value={hasSocialSkills}
              onChange={this.handleHasSocialSkillsChange}
            />
          </FormColumn>
        </FormRow>
      </RiskFormWrapper>
    );
  }
}
export default SkillsEditForm;
