import React, { Component } from 'react';
import styled from 'styled-components';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { HashRouter, Route, withRouter, Switch, Redirect } from 'react-router-dom';
import { fadeIn } from './animations';
import SpinnerOverlay from './components/SpinnerOverlay';
import ProtectedRoute from './components/ProtectedRoute';
import { includes } from 'lodash';

// Logged out screens
import Login from './screens/Login';
import ForgotPassword from './screens/ForgotPassword';
import ResetPassword from './screens/ResetPassword';

// Logged in screens
import Dashboard from './screens/Dashboard';
import Students from './screens/Students';
import Reports from './screens/Reports';
import EditProfile from './screens/EditProfile';
import About from './screens/About';
import MissingSchoolYear from './screens/MissingSchoolYear';

// Admin only screens
import SchoolSettings from './screens/SchoolSettings';
import AddUser from './screens/AddUser';
import AddYear from './screens/AddYear';
import ManageUsers from './screens/ManageUsers';

// For debugging
import BreakpointLabel from './components/BreakpointLabel';

@withRouter
@inject('store')
@observer
class AuthenticatedApp extends Component {
  @observable initTask = this.props.store.init();

  renderPending = () => (
    <SpinnerOverlay open>
      Loading
    </SpinnerOverlay>
  );

  renderRejected = error => {
    error = error || new Error('No details on the error were provided.');
    let errorMessage = error.message;
    const { response } = error;

    if(response && typeof response.data === 'string' && /ECONNREFUSED/.test(response.data)) {
      errorMessage = `Couldn't connect to API server. Check your internet connection.`;
    }

    return (
      <div>
        <h1>A server request resulted in an error.</h1>
        {errorMessage}
      </div>
    )
  };

  renderResolved = () => {
    const { store, location } = this.props;
    const { user, currentSchoolYear } = store;
    const { admin } = user;
    const { pathname } = location;

    if(!currentSchoolYear && !includes(['/About', '/EditProfile'], pathname)) {
      if(admin) {
        if(!includes(pathname, '/Users')) {
          return (<AddYear/>);
        }
      } else {
        return (<MissingSchoolYear/>);
      }
    }

    return (
      <FadeInWrapper>
        <Switch>
          <Route path="/Students" render={props => {
            if(store.currentSchoolYear) {
              return (<Redirect to={`${store.currentSchoolYear.id}/students`}/>);
            }
            return null;
          }}/>
          <Route path="/:schoolYearId/students" component={Students}/>
          <Route path="/Reports" component={Reports}/>
          <Route path="/EditProfile" component={EditProfile}/>
          <Route path="/About" component={About}/>
          {admin && <Route path="/AddUser" component={AddUser}/>}
          {admin && <Route path="/AddYear" component={AddYear}/>}
          {admin && <Route path="/SchoolSettings" component={SchoolSettings}/>}
          {admin && <Route path="/Users" component={ManageUsers}/>}
          <Route path="/" component={Dashboard}/>
        </Switch>
      </FadeInWrapper>
    );
  };

  render() {
    return this.initTask.match({
      pending: this.renderPending,
      resolved: this.renderResolved,
      rejected: this.renderRejected,
    });
  }
}

@withRouter
@inject('store')
@observer
class UnauthenticatedApp extends Component {
  render() {
    return (
      <Switch>
        <Route path={'/Login'} component={Login} />
        <Route path={'/ForgotPassword'} component={ForgotPassword} />
        <Route path={'/ResetPassword/:uid'} component={ResetPassword} />
        <ProtectedRoute path="/" component={AuthenticatedApp}/>
      </Switch>
    );
  }
}

@inject('store')
@observer
export default class AppRouter extends Component {
  render() {
    const { online } = this.props.store;

    return (
      <FadeInWrapper>
        <BreakpointLabel/>
        <HashRouter>
          <UnauthenticatedApp/>
        </HashRouter>

        <SpinnerOverlay open={!online}>
        Waiting for internet connection
        </SpinnerOverlay>
      </FadeInWrapper>
    );
  }
}

const FadeInWrapper = styled.div`
  width: 100%;
  height: 100%;
  animation: ${fadeIn} 0.25s linear;
  animation-fill-mode: forward;
`;
