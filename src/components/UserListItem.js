import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

@withRouter
@observer
class UserListItem extends Component {
  render() {
    const { user, children, onClick } = this.props;
    const active = user.locationMatches(this.props.location);

    return (
      <Root {...this.props} onClick={null} active={active}>
        <UserText onClick={onClick}>
          <UserName>{user.fullName}</UserName>
        </UserText>
        {children}
      </Root>
    );
  }
}

export default UserListItem;

const Root = styled.li`
  height: 70px;
  padding: 0 20px 0 40px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  background-color: ${props => props.active ? '#F2F2F2' : 'white'};

  &:not(:first-child) {
    border-top: 1px solid #D43425;
  }

  &:last-child {
    border-bottom: 1px solid #D43425;
  }
`;

const UserText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-decoration: none;
  flex: 1;
  height: 100%;
`;

const UserName = styled.div`
  font-weight: bold;
  color: #4A4A4A;
  font-size: 16px;
`;
