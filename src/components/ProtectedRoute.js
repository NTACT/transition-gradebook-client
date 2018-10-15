import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Route, Redirect, withRouter } from 'react-router-dom';

@withRouter
@inject('store')
@observer
export default class ProtectedRoute extends Component {
  _renderer = loggedIn => props => {
    const { component : Component, loginPath='/Login' } = this.props;

    if(loggedIn) {
      return (<Component {...props}/>);
    } else {
      return (
        <Redirect to={{
          pathname: loginPath,
          state: { from: props.location }
        }}/>
      );
    }
  };

  render() {
    const { store } = this.props;

    return (
      <Route {...this.props} component={undefined} render={this._renderer(store.loggedIn)}/>
    );
  }
}
