import React, { Component } from 'react';
import styled from 'styled-components';
import { observer, inject } from 'mobx-react';
import Screen from '../components/Screen';

@inject('store')
@observer
class MissingSchoolYear extends Component {
  render() {
    const { admins } = this.props.store;

    return (
      <Root>
        <Content>
          <Instructions>
            There is no current school year.
            Contact an admin to create one.
          </Instructions>

          <AdminListTitle>Admins</AdminListTitle>
          <AdminList>
            {admins.map(admin =>
              <AdminListItem key={admin.id}>
                <a href={`mailto:${admin.email}`}>{admin.email}</a>
              </AdminListItem>
            )}
          </AdminList>
        </Content>
      </Root>
    );
  }
}

export default MissingSchoolYear;

const Root = styled(Screen)`
  background-color: #5B5B5B;
  color: white;
  flex-direction: column;
  align-items: center;
`;

const Content = styled.div`
  max-width: 100%;
  width: 600px;
  display: flex;
  flex-direction: column;
`;

const Instructions = styled.h1`
  text-align: center;
  width: 100%;
  margin-top: 100px;
`;

const AdminListTitle = styled.h2`
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 3px;
`;

const AdminList = styled.ul`
  list-style: none;
  padding: 0;
`;

const AdminListItem = styled.li`
  text-align: center;
`;
