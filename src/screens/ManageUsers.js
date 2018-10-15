import React, { Component } from 'react';
import { observable, action, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Route, Link, withRouter } from 'react-router-dom';
import styled from 'styled-components';
import Section from '../components/Section';
import UserList from '../components/UserList';
import UserListItem from '../components/UserListItem';
import Screen from '../components/Screen';
import EditUserForm from '../components/EditUserForm';
import * as Icons from '../components/Icons';
import * as breakpoints from '../breakpoints';

@withRouter
@inject('store')
@observer
class ManageUsers extends Component {
  @observable search = '';

  @computed get normalizedSearch() {
    return this.search.trim().toLowerCase();
  }

  @computed get sortedUsers() {
    return this.props.store.users.sort((a, b) => {
      if(a.lowercaseFullName < b.lowercaseFullName) return -1;
      if(a.lowercaseFullName > b.lowercaseFullName) return 1;
      return 0;
    });
  }

  @computed get filteredUsers() {
    const { normalizedSearch, sortedUsers } = this;

    return normalizedSearch.length
      ? sortedUsers.filter(user => user.lowercaseFullName.match(normalizedSearch))
      : sortedUsers;
  }

  @action.bound handleUserClick(user) {
    this.props.history.push(user.editRoute);
  }

  @action.bound handleSearchChange(event) {
    this.search = event.target.value;
  }

  render() {
    const { search, filteredUsers } = this;
    const { users } = this.props.store;

    return (
      <Screen>
        <Main fullWidth>
          <Content>
            <UserListContainer>
              <SearchForm>
                <SearchInputContainer>
                  <SearchInput onChange={this.handleSearchChange} value={search}/>
                  <SearchIcon/>
                </SearchInputContainer>
              </SearchForm>
              <AddStudentButton>
                <AddIcon/>
              </AddStudentButton>

              <UserList>
                {filteredUsers.map(user =>
                  <UserListItem
                    key={user.id}
                    user={user}
                    onClick={this.handleUserClick.bind(null, user)}
                  />
                )}
              </UserList>
            </UserListContainer>

            <Route path="/Users/new" component={props =>
              <SubRouteWrapper>
                <EditUserForm key="new"/>
              </SubRouteWrapper>
            }/>
            <Route path="/Users/:userId" component={props => {
              const user = users.find(user => user.id === +props.match.params.userId);
              if(!user) return null;
              return (
                <SubRouteWrapper>
                  <EditUserForm key={`edit-${user.id}`} user={user}/>
                </SubRouteWrapper>
              );
            }}/>
          </Content>
        </Main>
      </Screen>
    );
  }
}

export default ManageUsers;

const Main = styled(Section)`
  height: 100%;
  background-color: #F0F0F0;
`;

const Content = styled(Section.Content)`
  display: flex;
  position: relative;
  flex-direction: row;
  height: 100%;
`;

const UserListContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  max-width: 450px;
  height: 100%;
`;

const AddStudentButton = styled(Link).attrs({to: '/Users/new'})`
  width: 100%;
  height: 40px;
  background-color: #262626;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const AddIcon = styled(Icons.Plus)`
  width: 17px;
  height: 17px;
`;

const SearchForm = styled.div`
  width: 100%;
  height: 71px;
  background-color: #5B5B5B;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 40px 0 40px;
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  height: 40px;
`;

const SearchInput = styled.input`
  position: relative;
  border: none;
  outline: none;
  height: 100%;
  width: 100%;
  border-radius: 20px;
  background-color: #434343;
  padding-left: 20px;
  color: white;
  font-size: 14px;
`;

const SearchIcon = styled(Icons.Magnifier)`
  width: 18px;
  height: 18px;
  position: absolute;
  right: 11px;
  top: 11px;
  pointer-events: none;
`;

const SubRouteWrapper = styled.div`
  overflow: auto;
  flex: 1;

  @media ${breakpoints.medium} {
    min-width: 440px;
  }

  @media ${breakpoints.small} {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-color: #F0F0F0;
  }
`;
