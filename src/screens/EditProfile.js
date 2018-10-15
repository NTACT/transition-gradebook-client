import React, { Component } from 'react';
import styled from 'styled-components';
import EditUserForm from '../components/EditUserForm';
import { observer, inject } from 'mobx-react';
import Screen from '../components/Screen';
import Section from '../components/Section';

@inject('store')
@observer
class EditProfile extends Component {
  render() {
    const { user } = this.props.store;

    return (
      <Screen>
        <Main fullWidth>
          <StyledEditUserForm
            hideDeleteButton
            hideCloseButton
            hideAdminCheckbox
            title="Edit Profile"
            redirectTo="/EditProfile"
            user={user}
          />
        </Main>
      </Screen>
    );
  }
}

export default EditProfile;

const Main = styled(Section)`
  height: 100%;
  background-color: #F2F2F2;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledEditUserForm = styled(EditUserForm)`
  overflow: hidden;
  width: 100%;
  max-width: 800px;
`;
