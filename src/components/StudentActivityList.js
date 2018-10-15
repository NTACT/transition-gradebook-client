import React, { Component } from 'react';
import styled from 'styled-components';
import { action } from 'mobx';
import { observer, inject } from 'mobx-react';
import List from './List';
import { withRouter } from 'react-router-dom';
import ExpandableListItem from './ExpandableListItem';
import Button from './Button';
import * as Icons from './Icons';

@withRouter
@inject('store')
@observer
export default class StudentActivityList extends Component {
  @action.bound async handleActivityEditClick(activity) {
    const { store, student, schoolYear, history } = this.props;
    if(store.currentSchoolYear.id !== schoolYear.id) {
      if(!await student.confirmHistoricEdit()) return;
    }
    history.push(student.getEditActivityRoute(schoolYear, activity));
  }

  @action.bound async handleActivityCreateClick(group) {
    const { store, student, schoolYear, history } = this.props;
    if(store.currentSchoolYear.id !== schoolYear.id) {
      if(!await student.confirmHistoricEdit()) return;
    }
    history.push(student.getCreateActivityRoute(schoolYear, group));
  }

  render() {
    const { store, activities } = this.props;
    const { activityTypeGroups } = store;
    const groups = groupActivities(activityTypeGroups, activities);

    return (
      <Root>
        <GroupList>
          {groups.map(([group, activities]) =>
            <ExpandableListItem key={group.id} 
              header={
                <React.Fragment>
                  <GroupName>{group.name}</GroupName>
                  <AddButton onClick={this.handleActivityCreateClick.bind(null, group)}>
                    <AddIcon/>
                  </AddButton>
                </React.Fragment>
              }
            >
              {activities.map(activity => 
                <ActivityListItem key={activity.id}>
                  <EditActivityButton onClick={this.handleActivityEditClick.bind(null, activity)}>
                    <EditIcon/>
                  </EditActivityButton>
                  <ActivityInfo>
                    <ActivityName>{activity.activityType.name}</ActivityName>
                    <ActivityFields>
                      <ActivityField>
                        # of Events: {activity.events.length}
                      </ActivityField>
                      <ActivityField>
                        Frequency: {activity.frequency}
                      </ActivityField>
                      <ActivityField>
                        <SpeechBubbleIcon/>
                      </ActivityField>
                    </ActivityFields>
                  </ActivityInfo>
                </ActivityListItem>
              )}
            </ExpandableListItem>
          )}
        </GroupList>
      </Root>
    );
  }
}

/* Returns an array of [group, activities] pairs */
function groupActivities(activityTypeGroups, activities) {
  return activityTypeGroups.map(typeGroup => [
    typeGroup,
    activities.filter(activity => activity.activityType.activityTypeGroupId === typeGroup.id)
  ]);
}

const Root = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #D43425;
`;

const GroupList = styled(List)`
  flex: 1;
  z-index: 2;
  overflow: visible;
`;

const GroupName = styled.span``;

const ActivityListItem = styled(ExpandableListItem.Item)``;

const AddButton = styled(Button)``;

const AddIcon = styled(Icons.RedCirclePlus)`
  height: 22px;
  width: 22px;
`;

const EditActivityButton = styled(Button)`
  margin-right: 24px;
`;

const EditIcon = styled(Icons.PenSquare)`
  width: 13px;
  height: 14px;
`;

const ActivityInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ActivityName = styled.div`
	color: #555555;
	font-size: 12px;
	font-weight: bold;
`;

const ActivityFields = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-top: 3px;
`;

const ActivityField = styled.div`
	color: #CE2D22;
  font-size: 12px;
`;

const SpeechBubbleIcon = styled(Icons.SpeechBubble)`
  width: 15px;
  height: 13px;
`;