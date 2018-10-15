import React, { Component } from 'react';
import styled from 'styled-components';
import swal from 'sweetalert2';
import { observable, action, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withRouter, Link } from 'react-router-dom';
import Button from './Button';
import Checkbox from './Checkbox';
import FormError from './FormError';
import AsyncTask from '../models/AsyncTask';
import { Rejected } from './Task';
import FormRow from './FormRow';
import FormColumn from './FormColumn';
import XButton from './XButton';
import SpinnerOverlay from './SpinnerOverlay';

@withRouter
@inject('store')
@observer
class EditUserForm extends Component {
  @observable userToEdit = null;
  @observable firstName = '';
  @observable lastName = '';
  @observable email = '';
  @observable password = '';
  @observable passwordConfirmed = '';
  @observable admin = false;
  @observable submitTask = null;

  @computed get fields() {
    const {
      userToEdit,
      firstName,
      lastName,
      email,
      password,
      admin,
    } = this;

    return {
      firstName,
      lastName,
      admin,
      email: userToEdit && email === userToEdit.email ? null : email, // send null if the email hasn't changed
      password: password.length ? password : null,
    };
  }

  @computed get title() {
    const { title } = this.props;
    if(title) return title;
    const { userToEdit } = this;
    if(userToEdit) {
      return 'EDIT USER';
    }
    return 'ADD A NEW USER';
  }

  @action.bound handleFirstNameChange(event) {
    this.firstName = event.target.value;
  }

  @action.bound handleLastNameChange(event) {
    this.lastName = event.target.value;
  }

  @action.bound handleEmailChange(event) {
    this.email = event.target.value;
  }

  @action.bound handlePasswordChange(event) {
    this.password = event.target.value;
  }

  @action.bound handlePasswordConfirmedChange(event) {
    this.passwordConfirmed = event.target.value;
  }

  @action.bound handleAdminToggled() {
    this.admin = !this.admin;
  }

  @action.bound async handleSubmit(event) {
    event.stopPropagation();
    event.preventDefault();
    const { userToEdit, fields } = this;
    const { store, redirectTo } = this.props;
    let user;

    if(this.password.length && this.password !== this.passwordConfirmed) {
      this.submitTask = new AsyncTask(new Error('Passwords don\'t match'));
      this.submitTask.catch(() => {});
      return;
    }

    if(userToEdit) {
      this.submitTask = store.updateUser(userToEdit, fields);
      user = await this.submitTask;
      if(this.submitTask.resolved) {
        this.props.history.push(redirectTo || user.viewRoute);
        await swal(
          'Success',
          `User ${user.fullName} updated`,
          'success'
        );
      }
    } else {
      this.submitTask = store.createUser(fields);
      user = await this.submitTask;

      if(this.submitTask.resolved) {
        this.props.history.push(redirectTo || user.viewRoute);
        await swal(
          'Success',
          `User ${user.fullName} created`,
          'success'
        );
      }
    }
  }

  @action.bound async handleDeleteClick(event) {
    event.stopPropagation();
    event.preventDefault();
    const { userToEdit } = this;
    const confirmResult = await swal({
      title: 'Are you sure?',
      text: `This will delete the user ${userToEdit.fullName} permanently.`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    });

    if(!confirmResult.value) return;

    const { store } = this.props;
    if(userToEdit) {
      const removeTask = store.deleteUser(this.userToEdit);
      await removeTask;
      if(removeTask.resolved) {
        this.props.history.push('/Users');

        await swal(
          'Success',
          `Student ${userToEdit.fullName} removed`,
          'success'
        );
      }
    }
  }

  @action editExisting(user) {
    this.userToEdit = user;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.admin = user.admin;
  }

  componentDidMount() {
    if(this.props.user) {
      this.editExisting(this.props.user);
    }
  }

  render() {
    const { user, store, hideDeleteButton, hideAdminCheckbox, hideCloseButton, ...rest } = this.props;
    const {
      userToEdit,
      firstName,
      lastName,
      email,
      password,
      passwordConfirmed,
      admin,
      submitTask,
    } = this;

    return (
      <Root {...rest}>
        <SpinnerOverlay open={submitTask && submitTask.pending}/>
        <Form onSubmit={this.handleSubmit}>
          <Header>
            <Title>
              {this.title}
            </Title>

            <XButton hidden={hideCloseButton} component={Link} to="/Users"/>
          </Header>

          <Rejected task={submitTask}>
            {() => <SubmitError error={submitTask.error}/>}
          </Rejected>

          <FormRow>
            <FormColumn>
              <InputLabel>User First Name</InputLabel>
              <Input value={firstName} onChange={this.handleFirstNameChange}/>
            </FormColumn>

            <FormColumn>
              <InputLabel>User Last Name</InputLabel>
              <Input value={lastName} onChange={this.handleLastNameChange}/>
            </FormColumn>
          </FormRow>

          <FormRow>
            <FormColumn>
              <InputLabel>User Email</InputLabel>
              <Input value={email} onChange={this.handleEmailChange}/>
            </FormColumn>
          </FormRow>

          <FormRow>
            <FormColumn>
              <InputLabel>Password</InputLabel>
              <Input type="password" value={password} onChange={this.handlePasswordChange}/>
            </FormColumn>

            <FormColumn>
              <InputLabel>Password (Confirmed)</InputLabel>
              <Input type="password" value={passwordConfirmed} onChange={this.handlePasswordConfirmedChange}/>
            </FormColumn>
          </FormRow>

          {!hideAdminCheckbox && 
            <FormRow>
              <FormColumn>
                <Checkbox label="Admin" checked={admin} onChange={this.handleAdminToggled} disabled={user && user.id === store.user.id}/>
              </FormColumn>
            </FormRow>
          }

          <ButtonFormRow>
            <FormColumn>
              <SaveButton onClick={this.handleSubmit}>SAVE</SaveButton>
            </FormColumn>
            <FormColumn>
              {userToEdit && !hideDeleteButton &&
                <RemoveButton onClick={this.handleDeleteClick}>DELETE</RemoveButton>
              }
            </FormColumn>
          </ButtonFormRow>
        </Form>
      </Root>
    );
  }
}

export default EditUserForm;

const Root = styled.div`
  position: relative;
  flex: 1 0 auto;
  padding: 33px 38px 33px 38px;
  background-color: #F2F2F2;
  overflow: auto;
`;

const SubmitError = styled(FormError)`
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.h1`
	color: #D43425;
  font-family: "Oswald";
  font-weight: 200;
	font-size: 16px;
  line-height: 21px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  height: 100%;
  flex: 1;
`;

const InputLabel = styled.label`
	color: #555555;
	font-family: "Open Sans";
	font-size: 14px;
	font-weight: bold;
  line-height: 19px;
  margin-bottom: 7px;
`;

const Input = styled.input`
  min-height: 40px;
  padding-left: 20px;
  border: none;
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

const ButtonFormRow = styled(FormRow)`
  padding-top: 40px;
  align-items: flex-start;
  flex: 1;
`;