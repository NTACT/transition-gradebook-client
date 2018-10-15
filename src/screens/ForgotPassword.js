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
class ForgotPasword extends Component {
  @observable username = '';
  @observable loginTask = null;
  @observable disabled = false;
  @observable feedback = null;

  @action.bound async handleUsernameChange(event) {
    this.username = event.target.value;
  }

  @action.bound async handleSubmit(event) {
    event.preventDefault();
    const { store } = this.props;
    const { username } = this;

    if (!username) return this.feedback = 'Please enter your email.';

    this.feedback = '';
    this.disabled = true;

    this.forgotPasswordTask = await store.forgotPassword(username);
    this.disabled = false;

    if (this.forgotPasswordTask.error) {
      const { data, status } = this.forgotPasswordTask.error.response;
      if (status === 401)  return this.feedback = data;
      return this.feedback = `An error occurred (status code: ${status}).`;
    }

    const { message } = this.forgotPasswordTask.data;
    this.feedback = message;

  }

  render() {
    const { store } = this.props;
    const {
      username,
      disabled,
      feedback,
      handleSubmit,
      handleUsernameChange,
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
          <ForgotPasswordForm onSubmit={handleSubmit}>
            <Info>
              Enter your email address and we will send you a link to reset your password.
            </Info>
            <ForgotPasswordFormGroup>
              <ForgotPasswordLabel>Email</ForgotPasswordLabel>
              <Input type='email' value={username} onChange={handleUsernameChange} required />
            </ForgotPasswordFormGroup>
            <ForgotPasswordFeedback>{feedback}</ForgotPasswordFeedback>
            <LoginButton disabled={disabled}>Send Password Reset Link</LoginButton>
            <ReturnToLoginContainer>
              <ReturnToLoginLink to='/'>log in</ReturnToLoginLink>
            </ReturnToLoginContainer>
          </ForgotPasswordForm>
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

const ReturnToLoginContainer = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  align-self: normal;
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

export default ForgotPasword;
