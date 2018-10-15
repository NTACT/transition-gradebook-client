import React, { Component } from 'react';
import styled from 'styled-components';
import { observable, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Redirect, Link } from 'react-router-dom';
import Input from '../components/Input';
import logo from '../assets/logo.png';

const year = (new Date()).getFullYear();

@inject('store')
@observer
class ResetPasword extends Component {
  @observable uid = null;
  @observable uidValidationTask = null;
  @observable uidValidationStatus = null;
  @observable uidValidationFeedback = null;
  @observable password = '';
  @observable confirmPassword = '';
  @observable resetPasswordTask = null;
  @observable passwordStatus = null;
  @observable passwordFeedback = null;
  @observable disabled = false;

  async componentDidMount() {
    const { uid } = this.props.match.params;
    this.uid = uid;
    this.uidValidationTask = await this.props.store.checkResetPasswordIdentifier(uid);

    if (this.uidValidationTask.error) {
      const { status } = this.uidValidationTask.error.response;
      this.uidValidationStatus = 'error';
      return this.uidValidationFeedback = `An error occurred (status code: ${status}).`;
    }

    const {
      message,
      valid,
    } = this.uidValidationTask.data;
    if (!valid) {
      this.uidValidationStatus = 'error';
      return this.uidValidationFeedback = message;
    }

    this.uidValidationStatus = 'success';
  }

  @action.bound handlePasswordChange(event) {
    this.password = event.target.value;
  }

  @action.bound handleConfirmPasswordChange(event) {
    this.confirmPassword = event.target.value;
  }

  @action.bound async handleSubmit(event) {
    event.preventDefault();
    if (this.passwordStatus === 'success') return this.props.history.push('/Login');

    const { store } = this.props;
    const { uid, password, confirmPassword } = this;

    if (!password) return this.passwordFeedback = 'Please enter a new password.';
    else if (!confirmPassword) return this.passwordFeedback = 'Please confirm your password.';
    else if (password !== confirmPassword) return this.passwordFeedback = 'Password does not match the confirm password.';

    this.passwordFeedback = '';
    this.disabled = true;

    this.resetPasswordTask = await store.resetPassword(uid, password);
    this.disabled = false;

    if (this.resetPasswordTask.error) {
      const { data } = this.resetPasswordTask.error.response;
      if (data.data && data.data.password) {
        const { message } = data.data.password[0]
        return this.passwordFeedback = `Error: ${message}.`;
      }
      else {
        const { status } = this.uidValidationTask.error.response;
        return this.passwordFeedback = `An error occurred (status code: ${status}).`;
      }
    }

    const { message } = this.resetPasswordTask.data;
    this.passwordFeedback = message;
    this.passwordStatus = 'success';

  }

  render() {
    const { store } = this.props;
    const {
      uidValidationStatus,
      uidValidationFeedback,
      disabled,
      password,
      confirmPassword,
      passwordStatus,
      passwordFeedback,
      handleSubmit,
      handlePasswordChange,
      handleConfirmPasswordChange,
    } = this;
    const { from } = this.props.location.state || {
      from: { pathname: '/' }
    };

    if (store.loggedIn) {
      return (<Redirect to={from}/>);
    }
    return (
      <Root>
        <Top>
          <Link to="/Login">
            <Logo src={logo}/>
          </Link>
        </Top>
        <Bottom>
          {uidValidationStatus === 'error' &&
            <ForgotPasswordContainer>
              <Info>
                {uidValidationFeedback}
              </Info>
              <LoginLink to='/'>Log In</LoginLink>
            </ForgotPasswordContainer>
          }
          {uidValidationStatus === 'success' &&
            <ForgotPasswordForm onSubmit={handleSubmit}>
              <Info>
                Create a new password
              </Info>
              {passwordStatus !== 'success' &&
                <React.Fragment>
                  <ForgotPasswordFormGroup>
                    <ForgotPasswordLabel>Password</ForgotPasswordLabel>
                    <Input type='password' value={password} onChange={handlePasswordChange} required />
                  </ForgotPasswordFormGroup>
                  <ForgotPasswordFormGroup>
                    <ForgotPasswordLabel>Confirm Password</ForgotPasswordLabel>
                    <Input type='password' value={confirmPassword} onChange={handleConfirmPasswordChange} required />
                  </ForgotPasswordFormGroup>
                </React.Fragment>
              }
              <ForgotPasswordFeedback>{passwordFeedback}</ForgotPasswordFeedback>
              <LoginButton disabled={disabled}>{passwordStatus === 'success' ? 'Log In' : 'Update Password'}</LoginButton>
              {passwordStatus !== 'success' &&
                <ReturnToLoginContainer>
                  <ReturnToLoginLink to='/'>log in</ReturnToLoginLink>
                </ReturnToLoginContainer>
              }
            </ForgotPasswordForm>
          }
        </Bottom>
        <Copyright>&copy; Copyright {year} NTACT Transition Gradebook</Copyright>
      </Root>
    );
  }
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Top = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 140px;
`;

const Logo = styled.img`
  width: 291px;
  height: 99px;
`;

const Bottom = styled.div`
  background: linear-gradient(180deg, #F5633A 0%, #AE0F13 100%);
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ForgotPasswordContainer = styled.div`
  flex: 1;
  margin: auto;
  margin-top: 114px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
`;

const ForgotPasswordForm = styled.form`
  flex: 1;
  margin: auto;
  margin-top: 114px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
`;

const Info = styled.h2`
  margin-bottom: 40px;
  font-weight: normal;
  color: white;
  justify-content: flex-start;
`;

const ForgotPasswordFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  width: 100%;
`;

const ForgotPasswordLabel = styled.label`
  color: #A20B0E;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 3px;
`;

const ForgotPasswordFeedback = styled.div`
  align-self: flex-start;
  color: white;
  margin-top: 5px;
`;

const LoginButton = styled.button`
  width: 100%;
  margin-top: 20px;
  text-transform: uppercase;
  font-family: 'Oswald', sans-serif;
  background: #A20B0E;
  color: white;
  padding: 15px;
  border: none;
  font-size: 16px;
  cursor: pointer;
`;

const LoginLink = styled(Link)`
  width: 100%;
  margin-top: 20px;
  text-transform: uppercase;
  text-align: center;
  font-family: 'Oswald', sans-serif;
  background: #A20B0E;
  color: white;
  padding: 15px;
  border: none;
  font-size: 16px;
  cursor: pointer;
`;

const ReturnToLoginContainer = styled.div`
  margin-top: 10px;
  display: flex;
  align-self: normal;
  justify-content: flex-end;
`;

const ReturnToLoginLink = styled(Link)`
  color: #A20B0E;
  font-size: 12px;
  padding-bottom: 1px;
  border-bottom: 1px solid #A20B0E;
`;

const Copyright = styled.div`
  position: absolute;
  bottom: 14px;
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #F5633A;
`;

export default ResetPasword;
