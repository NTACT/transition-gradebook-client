import React, { Component } from 'react'
import styled from 'styled-components';
import Button from './Button';
import { inject, observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { withRouter } from 'react-router-dom';
import { RedCirclePlus } from './Icons';
import * as breakpoints from '../breakpoints';

@withRouter
@inject('store')
@observer
class MultipleStudentActivityListItem extends Component {
  @action.bound handleActivityCreateClick() {
    const { history, group, location } = this.props
    history.push(`${location.pathname}/activities/create/${group.id}`)
  }

  render() {
    const { group } = this.props
    const { handleActivityCreateClick } = this

    return (
      <Root>
        <ActivityListItem>
          <ActivityListItemContainer>
            <ActivityGroupName>{group.name}</ActivityGroupName>
            <Button onClick={handleActivityCreateClick}>
              <AddIcon />
            </Button>
          </ActivityListItemContainer>
        </ActivityListItem>
      </Root>
    )
  }
}
export default MultipleStudentActivityListItem;

const AddIcon = styled(RedCirclePlus)`
  height: 22px;
  width: 22px;
`;

const ActivityGroupName = styled.span`
  margin-left: 35px;
`

const ActivityListItemContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  flex-direction: row;
`

const ActivityListItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #D43425;
  padding: 0 40px 0 40px;
  height: 60px;

  @media ${breakpoints.small} {
    padding: 0 20px 0 20px;
  }
`

const Root = styled.li`
  color: white;
  margin: 0;
  display: flex;
  flex-direction: column;

  &:not(:first-child) {
    border-top: 1px solid #A20B0E;
  }
  
  &:last-child {
    border-bottom: 1px solid #A20B0E;
  }
`