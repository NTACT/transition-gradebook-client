import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import swal from 'sweetalert2';
import Label from './Label';
import YesNoNullSelect from './YesNoNullSelect';
import FormRow from './FormRow';
import FormColumn from './FormColumn';
import RiskFormWrapper from './RiskFormWrapper';
import EnumSelect from './EnumSelect';

@inject('store')
@observer
class SkillsCareerDevForm extends Component {
  @observable attendedIepMeeting = null;
  @observable iepRole = null;
  @observable hasGraduationPlan = null;
  @observable dirty = false;
  @observable saveTask = null;

  @action setKey(key, value) {
    this.dirty = true;
    this[key] = value;
  }

  handleBoolChange = key => value => this.setKey(key, value);
  handleStringChange = key => event => this.setKey(key, event.target.value);

  handleAttendedIepMeetingChange = attended => {
    this.setKey('attendedIepMeeting', attended);
    if(!attended) this.setKey('iepRole', null);
  };
  handleIepRoleChange = this.handleStringChange('iepRole')
  handleHasGraduationPlanChange = this.handleBoolChange('hasGraduationPlan');

  @action.bound async handleSubmit(event) {
    const { store, student } = this.props;
    event.preventDefault();
    this.saveTask = store.editStudentTermInfo(student, {
      attendedIepMeeting: this.attendedIepMeeting,
      iepRole: this.iepRole,
      hasGraduationPlan: this.hasGraduationPlan,
    });
    
    await this.saveTask;
    this.dirty = false;
    await swal('Success', 'Student skills saved successfully.', 'success');
  }

  edit(student) {
    this.attendedIepMeeting = student.attendedIepMeeting;
    this.iepRole = student.iepRole;
    this.hasGraduationPlan = student.hasGraduationPlan;
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
      attendedIepMeeting,
      iepRole,
      hasGraduationPlan,
      dirty,
      saveTask,
    } = this;

    return (
      <RiskFormWrapper {...this.props} title="EDIT STUDENT CAREER DEV & IEP" onSubmit={this.handleSubmit} dirty={dirty} saveTask={saveTask}>
        <FormRow>
          <FormColumn>
            <Label>Attended IEP meeting</Label>
            <YesNoNullSelect value={attendedIepMeeting} onChange={this.handleAttendedIepMeetingChange}/>
          </FormColumn>
          <FormColumn>
            <Label>If yes, what was their role</Label>
            <EnumSelect
              name="iepRoles"
              value={iepRole}
              onChange={this.handleIepRoleChange}
              disabled={!attendedIepMeeting}
              placeholder="Choose a role"
            />
          </FormColumn>
        </FormRow>

        <FormRow>
          <FormColumn>
            <Label>Career development or graduation plan</Label>
            <YesNoNullSelect value={hasGraduationPlan} onChange={this.handleHasGraduationPlanChange}/>
          </FormColumn>
          <FormColumn/>
        </FormRow>
      </RiskFormWrapper>
    );
  }
};
export default SkillsCareerDevForm;
