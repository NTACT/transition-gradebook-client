import React, { Component } from 'react';
import styled from 'styled-components';
import { observable, action, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Link, withRouter } from 'react-router-dom';
import swal from 'sweetalert2';
import isValidDate from '../utils/isValidDate';
import Label from './Label';
import Select from './Select';
import Textarea from './Textarea';
import Button from './Button';
import FormError from './FormError';
import FormRow from './FormRow';
import FormColumn from './FormColumn';
import { Rejected } from './Task';
import List from './List';
import * as Icons from './Icons';
import EnumSelect from './EnumSelect';
import XButton from './XButton';
import SpinnerOverlay from './SpinnerOverlay';
import * as breakpoints from '../breakpoints';
import MultipleDatePicker from './MultipleDatePicker';
import { DateUtils } from 'react-day-picker/DayPicker';

const NONE = '';
const eventSortFn = (a, b) => b.eventTime - a.eventTime; // most recent first
let tempIdCounter = 0;

@withRouter
@inject('store')
@observer
class EditActivityForm extends Component {
  @observable activityToEdit = null;
  @observable activityTypeId = null;
  @observable frequency = null;
  @observable eventTimes = [];
  @observable events = [];
  @observable dirty = true;
  @observable invalidDateError = null;

  @observable notes = '';
  @observable submitTask = null;

  @computed get edit() {
    return !!this.activityToEdit;

  }

  @action handleChange() {
    this.dirty = true;
  }

  @action.bound handleActivityTypeChange(event) {
    this.handleChange();
    const value = event.target.value;
    this.activityTypeId = value === NONE ? null : +value;
  }

  @action.bound handleFrequencyChange(event) {
    this.handleChange();
    this.frequency = event.target.value;
  }

  @action.bound handleAddEventClick(event) {
    this.handleChange();
    event.preventDefault();
    this.eventTimes.forEach(event => {
      const date = new Date(event);
      if (!isValidDate(date)) {
        this.invalidDateError = new Error(`Invalid date. Format should be: YYYY-MM-DD`);
        return;
      }
      if (this.events.every(event => event.eventTime.getTime() !== date.getTime())) {
        this.events.push({
          id: `event-${tempIdCounter++}`,
          eventTime: date
        });
      }
    })
    this.eventTimes = []
    this.events = this.events.sort(eventSortFn);
    return false;
  }

  @action.bound handleEventTimeChange(event) {
    this.handleChange();
    this.eventTimes = event.target.value;
  }

  @action.bound async handleEventRemove(activityEvent, event) {
    event.preventDefault();
    const confirmResult = await swal({
      title: 'Are you sure?',
      text: `This will delete the event permanently.`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    });

    if (!confirmResult.value) return;

    this.handleChange();
    this.events.remove(activityEvent);

    return false;
  }

  @action.bound handleNotesChange(event) {
    this.handleChange();
    this.notes = event.target.value;
  }

  @action.bound async handleSubmit(event) {
    event.preventDefault();
    const { store, student, students, schoolYear, onCreateActivity } = this.props;
    const {
      edit,
      frequency,
      activityToEdit,
      activityTypeId,
      notes,
      events,
    } = this;

    const fields = {
      activityTypeId,
      frequency,
      notes,
      events,
    };
    
    if (edit) {
      this.submitTask = store.editStudentActivity(student, schoolYear, activityToEdit, fields);
      const activity = await this.submitTask;
      activityToEdit.patch(activity);
      swal('Success', 'Activity saved', 'success');
    } else {
      this.submitTask = store.createStudentActivity(students || [student], schoolYear, fields);
      const activity = await this.submitTask;
      if (onCreateActivity) onCreateActivity(activity);
      swal('Success', 'Activity saved', 'success');
    }
    this.close();
  }

  @action async delete() {
    const confirmResult = await swal({
      title: 'Are you sure?',
      text: `This will delete this activity permanently.`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    });

    if (!confirmResult.value) return false;
    const { store, onDeleteActivity } = this.props;
    try {
      await store.deleteActivity(this.activityToEdit);
      if (onDeleteActivity) onDeleteActivity(this.activityToEdit);
      this.close();
    } catch (error) {
      await swal({
        type: 'error',
        title: 'Oops...',
        text: error.message,
      });
    }
  }

  @action.bound handleDeleteClick(event) {
    event.preventDefault();
    this.delete();
    return false;
  }

  @action close() {
    const { history, student, students, schoolYear } = this.props;
    history.push(students ? `/${schoolYear.id}/students/multiple` : student.getViewRoute(schoolYear));
  }

  @action.bound handleDayClick(day, { selected }) {
    const { eventTimes } = this
    if (selected) {
      const selectedIndex = eventTimes.findIndex(selectedDay => DateUtils.isSameDay(selectedDay, day))
      eventTimes.splice(selectedIndex, 1)
    } else {
      eventTimes.push(day)
    }
  }

  @action componentDidMount() {
    const { activity } = this.props;

    if (activity) {
      this.activityToEdit = activity;
      this.activityTypeId = activity.activityType.id;
      this.events = activity.events.sort(eventSortFn);
      this.frequency = activity.frequency;
      this.notes = activity.notes;
      this.dirty = false;
    }
  }

  render() {
    const { student, students, schoolYear, group } = this.props;
    const {
      edit,
      activityTypeId,
      frequency,
      notes,
      eventTimes,
      events,
      submitTask,
      dirty,
      invalidDateError,
      handleDayClick
    } = this;

    return (
      <Root>
        <SpinnerOverlay open={submitTask && submitTask.pending} />
        <Rejected task={submitTask}>
          {error =>
            <FormError
              error={error}
              keyNames={{
                activityTypeId: 'Activity Type'
              }}
            />
          }
        </Rejected>
        <Form onSubmit={this.handleSubmit}>
          <Header>
            <Title>{edit ? 'EDIT' : 'ADD'} {group.name.toUpperCase()} ACTIVITY</Title>
            <XButton component={Link} to={students ? `/${schoolYear.id}/students/multiple` : student.getViewRoute(schoolYear)} />
          </Header>

          <FormRow>
            <FormColumn>
              <Label>{group.name} Activity</Label>
              <Select value={activityTypeId} onChange={this.handleActivityTypeChange} placeholder="Select an activity type">
                {group.activityTypes.map(type =>
                  <option key={type.id} value={type.id}>{type.name}</option>
                )}
              </Select>
            </FormColumn>

            <FormColumn>
              <Label>Frequency</Label>
              <EnumSelect name="activityFrequencies" value={frequency} onChange={this.handleFrequencyChange} placeholder="Select a frequency" />
            </FormColumn>
          </FormRow>

          <FormRow>
            <FormColumn>
              <Label>Number of Events: {events.length}</Label>
              <EventTimeContainer>
                <EventTimeInputRow>
                  {/* onChange={this.handleEventTimeChange} */}
                  <EventTimePicker value={eventTimes} handleDayClick={handleDayClick} />
                  <EventAddButton onClick={this.handleAddEventClick} disabled={eventTimes.length === 0}>
                    ADD {eventTimes.length > 1 ? "EVENTS" : "EVENT"}
                  </EventAddButton>
                </EventTimeInputRow>

                {events.length > 0 &&
                  <EventListContainer>
                    <EventListLabel>Event Dates</EventListLabel>
                    <EventList>
                      {events.map(event =>
                        <EventListItem key={event.id}>
                          {event.eventTime.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}

                          <EventDeleteButton onClick={this.handleEventRemove.bind(null, event)}><EventDeleteIcon /></EventDeleteButton>
                        </EventListItem>
                      )}
                    </EventList>
                  </EventListContainer>
                }
              </EventTimeContainer>
            </FormColumn>
            <FormColumn>
              {invalidDateError && <FormError error={invalidDateError} />}
            </FormColumn>
          </FormRow>

          <FormRow>
            <FormColumn>
              <Label>Notes</Label>
              <NoteTextarea value={notes} onChange={this.handleNotesChange} />
            </FormColumn>
          </FormRow>

          <ButtonRow>
            <SaveButton disabled={!dirty}>SAVE</SaveButton>
            <DeleteButton invisible={!edit} onClick={this.handleDeleteClick}>DELETE ACTIVITY</DeleteButton>
          </ButtonRow>
        </Form>
      </Root>
    );
  }
}

export default EditActivityForm;

const Root = styled.div`
  position: relative;
  padding: 29px 35px 29px 35px;
  border-top: 1px solid #D43425;
  background-color: #F2F2F2;
  margin-bottom: 29px;
  min-height: 100%;

  @media ${breakpoints.small} {
    border-top: none;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
	color: #D43425;
	font-family: "Oswald";
	font-size: 16px;
	line-height: 21px;
`;

const NoteTextarea = styled(Textarea)`
  min-height: 131px;
  resize: none;
  overflow: auto;
  font-size: 14px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 30px;
`;

const FormButton = styled(Button)`
  flex: 1;
  height: 50px;
  color: white;
  font-family: "Oswald";
  font-size: 16px;
  transition: background-color 0.3s;
`;

const SaveButton = styled(FormButton)`
  background-color: #D43425;
  margin-right: 20px;

  &:hover {
    background-color: #9e271c;
  }

  &:disabled {
    background-color: gray;
  }
`;

const DeleteButton = styled(FormButton)`
  background-color: #4A4A4A;
  visibility: ${props => props.invisible ? 'hidden' : 'visible'};

  &:hover {
    background-color: #282828;
  }
`;

const EventTimeContainer = styled.div`
  padding: 15px;
  background-color: white;
  width: 100%;
  display: flex;
  flex-direction: column;
  
  @media ${breakpoints.small} {
    input {
      flex: 1;
    }
  }
`;

const EventTimeInputRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const EventTimePicker = styled(MultipleDatePicker)`
  background-color: #F2F2F2;
  height: 40px;	
  width: 234px;
  font-size: 12px;
  margin-right: 15px;
  font-family: "Open Sans";
  color: #4A4A4A;
  display: flex;
  justify-content: center;
  align-items: center
`;

const EventAddButton = styled(Button)`
  flex: 1;
  color: white;
  background-color: #F36442;
  font-size: 15px;
  font-family: 'Oswald';
  transition: background-color 0.3s;
  
  min-width: 80px;
  max-width: 150px;

  &:hover {
    background-color: #c95238;
  }

  &:disabled {
    background-color: gray;
  }
`;

const EventListContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
`;

const EventList = styled(List)``;

const EventListLabel = styled(Label)``;

const EventListItem = styled.li`
  background-color: #4A4A4A;
  color: white;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 15px 17px 15px 17px;
  color: #D8D8D8;

  & + & {
    margin-top: 12px;
  };
`;

const EventDeleteIcon = styled(Icons.X)`
  width: 20px;
  height: 20px;
`;

const EventDeleteButton = styled(Button)``;
