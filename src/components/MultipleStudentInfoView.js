import React, { Component } from 'react';
import styled from 'styled-components'
import { observer, inject } from 'mobx-react';
import * as breakpoints from '../breakpoints'
import { XIcon } from './Icons';
import Button from './Button';
import Tabs from './Tabs';
import Tab from './Tab';
import TabContainer from './TabContainer'
import { groupActivities } from './StudentActivityList';
import List from './List';
import MultipleStudentActivityListItem from './MultipleStudentActivityListItem';
import { Route, Switch, withRouter } from 'react-router-dom';
import EditActivityForm from './EditActivityForm';

@withRouter
@inject('store')
@observer
class MultipleStudentInfoView extends Component {

  ActivityList = () => {
    const { MultipleStudentTabs } = this
    const { store } = this.props;
    const { activityTypeGroups } = store
    return (
      <>
        <MultipleStudentTabs />
        <ListRoot>
          <GroupList>
            {activityTypeGroups.map(group => (
              <MultipleStudentActivityListItem key={group.id} group={group} />
            ))}
          </GroupList>
        </ListRoot>
      </>
    )
  }

  SelectedStudent = ({ id, name }) => {
    const { handleStudentRemove } = this.props
    return (
      <SelectedStudentItem>
        <Button onClick={() => handleStudentRemove(id)} >
          <RemoveIcon />
        </Button>
        <SelectedStudentText>{name}</SelectedStudentText>
      </SelectedStudentItem>
    )
  }

  MultipleStudentTabs = () => {
    return (
      <MultipleTabContainer>
        <MultipleTabs>
          <MultipleTab active={true}>
            ACTIVITIES
          </MultipleTab>
        </MultipleTabs>
      </MultipleTabContainer>
    )
  }

  render() {
    const { selectedStudents, schoolYear, location, store } = this.props
    const { SelectedStudent, ActivityList } = this

    const numberSelected = `${selectedStudents.length} Students Selected`
    return (
      <Root>
        <Main>
          <Header>
            <SelectedHeader>
              <StudentsSelected>{numberSelected}</StudentsSelected>
              <StudentsSelectedSubtitle>
                You will be adding an activity to multiple students.
              </StudentsSelectedSubtitle>
              <SelectedStudentRow>
                {selectedStudents.map((s, key) => <SelectedStudent key={key} name={s.fullName} id={s.id} />)}
              </SelectedStudentRow>
            </SelectedHeader>
          </Header>
          <Content>
            <Switch>
              <Route path={`/*/multiple/activities/create/:groupId`} render={props => {
                const groupId = +props.match.params.groupId
                const group = store.getActivityTypeGroupById(groupId)
                return (
                  <FormContainer>
                    <EditActivityForm
                      key="create-activity"
                      schoolYear={schoolYear}
                      group={group}
                      students={selectedStudents}
                    />
                  </FormContainer>
                )
              }} />
              <Route path={`${location.pathname}/`} render={ActivityList} />
            </Switch>
          </Content>
        </Main>
      </Root>
    )
  }
}
export default MultipleStudentInfoView;

const FormContainer = styled.div`
  margin-top: 20px;
`

const GroupList = styled(List)`
  flex: 1;
  z-index: 2;
  overflow: visible;
`

const ListRoot = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: #D43425;
`

const MultipleTab = styled(Tab).attrs({
  activeBackgroundColor: '#D43425',
  inactiveBackgroundColor: 'white',
  activeTextColor: 'white',
  inactiveTextColor: '#D43425'
})``

const MultipleTabs = styled(Tabs)`
  padding-left: 38px;
  padding-top: 0;
  max-width: 100%;
  justify-content: flex-start;
`

const MultipleTabContainer = styled(TabContainer)`
  border-bottom: 0px solid white;
  background-color: #F0F0F0;
  height: auto;
  max-width: 100%;
  margin-top: 20px;
`

const Content = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
`

const SelectedStudentItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`

const SelectedStudentText = styled.div`
  font-size: 12px;
  font-family: 'Open Sans';
  font-weight: bold;
  color: #555555;
`

const SelectedStudentRow = styled.div`
  display: flex;
  flex-direction: row;
`

// Found these filters throught this codepen: https://codepen.io/sosuke/pen/Pjoqqp
const RemoveIcon = styled(XIcon)`
  margin-right: 4px;
  filter: invert(98%) sepia(2%) saturate(1959%) hue-rotate(188deg) brightness(116%) contrast(69%);
  cursor: pointer;
  &:hover {
    filter: invert(47%) sepia(50%) saturate(2353%) hue-rotate(338deg) brightness(99%) contrast(94%);
  }
`

const StudentsSelectedSubtitle = styled.div`
  font-size: 12px;
  margin-bottom: 13px;
`

const StudentsSelected = styled.div`
  font-size: 22px;
  font-weight: bold;
`

const SelectedHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 30px 30px 11px 30px;
  color: #4A4A4A;
`

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  max-height: 75px;
  min-height: 75px;
  margin: 9px 30px 9px 0;
  justify-content: space-between;

  @media ${breakpoints.small} {
    max-height: none;
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 0;
    margin-right: 0;
  }
`

const Main = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-start;
`

const Root = styled.div`
  display: flex;
  flex: 1;
  background-color: #F0F0F0;
  max-width: 100vew;
`