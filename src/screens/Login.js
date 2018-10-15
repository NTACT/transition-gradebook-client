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
class Login extends Component {
  @observable username = '';
  @observable password = '';
  @observable loginTask = null;
  @observable feedback = null;

  @action.bound handleUsernameChange(event) {
    this.username = event.target.value;
  }

  @action.bound handlePasswordChange(event) {
    this.password = event.target.value;
  }

  @action.bound async handleSubmit(event) {
    event.preventDefault();
    const { store } = this.props;
    const { username, password } = this;

    if (!username && !password) return this.feedback = 'Please enter your email and password.';
    else if (!username) return this.feedback = 'Please enter your email.';
    else if (!password) return this.feedback = 'Please enter your password.';

    this.feedback = '';
    this.disabled = true;

    this.loginTask = await store.login(username, password);
    this.disabled = false;

    if (this.loginTask.error) {
      const { data, status } = this.loginTask.error.response;
      if (status === 401) return this.feedback = data.error.message;
      this.feedback = `An error occurred (status code: ${status}).`
    }
  }

  render() {
    const { store } = this.props;
    const {
      username,
      password,
      disabled,
      feedback,
      handleSubmit,
      handleUsernameChange,
      handlePasswordChange,
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
          <LoginForm onSubmit={handleSubmit}>
            <LoginFormGroup>
              <LoginLabel>Email</LoginLabel>
              <Input type='email' value={username} onChange={handleUsernameChange} required />
            </LoginFormGroup>
            <LoginFormGroup>
              <LoginLabel>Password</LoginLabel>
              <Input type='password' value={password} onChange={handlePasswordChange} required />
            </LoginFormGroup>
            <LoginFeedback>{feedback}</LoginFeedback>
            <LoginButton disabled={disabled}>Get Started</LoginButton>
            <ForgotPasswordContainer>
              <ForgotPasswordLink to='/forgotpassword'>forgot password</ForgotPasswordLink>
            </ForgotPasswordContainer>
          </LoginForm>
        </Bottom>
        <Copyright>&copy; Copyright {year} NTACT Transition Gradebook</Copyright>
      </Root>
    );
  }
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100vh;
`;

const Top = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 140px;
  flex-shrink: 0;
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
  flex-shrink: 0;
`;

const LoginForm = styled.form`
  flex: 1;
  margin: auto;
  margin-top: 114px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
  flex-shrink: 0;
`;

const LoginFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  width: 100%;
  flex-shrink: 0;
`;

const LoginLabel = styled.label`
  color: #A20B0E;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 3px;
`;

const LoginFeedback = styled.div`
  align-self: flex-start;
  color: white;
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

const ForgotPasswordContainer = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  align-self: normal;
`;

const ForgotPasswordLink = styled(Link)`
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

export default Login;
