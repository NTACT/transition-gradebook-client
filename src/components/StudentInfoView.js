import React, { Component } from 'react';
import styled from 'styled-components';
import { Route, Switch, withRouter } from 'react-router-dom';
import { observable, action } from 'mobx';
import { observer, inject } from 'mobx-react';

import StudentActivityList from './StudentActivityList';
import StudentRisksView from './StudentRisksView';
import EditActivityForm from './EditActivityForm';
import TabContainer from './TabContainer';
import Tab from './Tab';
import Tabs from './Tabs';
import TermSelect from './TermSelect';
import { Pending, Resolved, Rejected } from './Task';
import * as breakpoints from '../breakpoints';

const checkIsRiskRoute = pathname => /\/risks\/\d+\/?/.test(pathname);

@withRouter
@inject('store')
@observer
class StudentInfoView extends Component {
  @observable loadActivitiesTask = null;
  @observable activities = [];
  @observable expandedGroups = [];

  componentDidMount() {
    this.loadActivities();
  }

  async loadActivities() {
    const { store } = this.props;
    const { student, schoolYear } = this.props;
    if(student.isPostSchool) return;
    this.loadActivitiesTask = store.fetchStudentActivities(student, schoolYear);
    this.activities = await this.loadActivitiesTask;
  }

  @action.bound handleTermChange(event) {
    const termId = +event.target.value;
    const { student, schoolYear } = this.props;

    this.props.history.push(student.getRisksRoute(schoolYear, termId));
  }

  @action.bound handleActivitiesTabClick() {
    const { student, schoolYear } = this.props;
    this.props.history.push(student.getViewRoute(schoolYear));
  }

  @action.bound handleRisksTabClick() {
    const { student, schoolYear } = this.props;
    this.props.history.push(student.getRisksRoute(schoolYear));
  }

  @action.bound handleActivityCreated(activity) {
    this.activities.push(activity);
  }

  @action.bound handleActivityDeleted(activity) {
    this.activities.remove(activity);
  }

  renderTabs() {
    const { pathname } = this.props.location;
    const isRiskRoute = checkIsRiskRoute(pathname);

    return (
      <StudentTabContainer>
        <StudentTabs>
          <StudentTab
            onClick={this.handleActivitiesTabClick}
            active={!isRiskRoute}
          >
            ACTIVITIES
          </StudentTab>
          <StudentTab 
            onClick={this.handleRisksTabClick}
            active={isRiskRoute}
            data-risk-tab
          >
            RISK FACTORS & SKILLS
          </StudentTab>
        </StudentTabs>
      </StudentTabContainer>
    );
  }

  renderSubroutes = () => {
    const { activities } = this;
    const { store, student, schoolYear } = this.props;

    return (
      <Switch>

        <Route path="/*/risks/:termId" render={props => {
          const termId = +props.match.params.termId;
          const term = schoolYear.terms.find(term => term.id === termId);
          if(!term) return null;

          return (
            <React.Fragment>
              {this.renderTabs()}
              <StudentRisksView student={student} schoolYear={schoolYear} term={term}/>
            </React.Fragment>
          );
        }}/>

        <Route path="/*/activities/create/:groupId" render={props => {
          const groupId = +props.match.params.groupId;
          const group = store.getActivityTypeGroupById(groupId);

          return (
            <EditActivityForm 
              key="create-activity"
              student={student}
              schoolYear={schoolYear}
              group={group}
              onCreateActivity={this.handleActivityCreated}
            />
          );
        }}/>

        <Route path="/*/activities/edit/:activityId" render={props => {
          const activityId = +props.match.params.activityId;
          const activity = activities.find(activity => activity.id === activityId);
          if(!activity) return null;

          const group = store.getActivityTypeGroupById(activity.activityType.activityTypeGroupId);

          return(
            <EditActivityForm
              key="edit-activity"
              student={student} 
              schoolYear={schoolYear} 
              group={group}
              activity={activity}
              onDeleteActivity={this.handleActivityDeleted}
            />
          );
        }}/>

        <Route path="/" render={() =>
          <React.Fragment>
            {this.renderTabs()}
            <StudentActivityList
              student={student}
              schoolYear={schoolYear}
              activities={activities}
            />
          </React.Fragment>
        }/>

      </Switch>
    );
  };

  renderPostSchoolContent() {
    const { student } = this.props;
    const { postSchoolOutcome, exitCategory } = student;
    return (
      <PostSchoolContent>
        <StudentTabContainer>
          <StudentTabs>
            <StudentTab active>
              POST-SCHOOL TRACKING
            </StudentTab>
          </StudentTabs>
        </StudentTabContainer>
        <PostSchoolContentBody>
          <h2>Exit Category</h2>
          <h3>{exitCategory || 'No Data'}</h3>

          <h2>Post School Category</h2>
          <h3>{postSchoolOutcome || 'No Data'}</h3>
        </PostSchoolContentBody>
      </PostSchoolContent>
    );
  }

  render() {
    const { student, schoolYear } = this.props;
    const { loadActivitiesTask } = this;

    return (
      <Root>
        <Main>
          <Header>
            <StudentText>
              <StudentName>{student.fullName}</StudentName>
              <StudentDescription>{student.description}</StudentDescription>
            </StudentText>

            <Route path="/*/risks/:termId" render={props =>
              <StyledTermSelect
                hidden={schoolYear.termType === 'annual'}
                value={props.match.params.termId}
                schoolYear={schoolYear}
                onChange={this.handleTermChange}
              />
            }/>
          </Header>
          {student.isPostSchool 
            ? this.renderPostSchoolContent()
            : <Content>
                <Resolved task={loadActivitiesTask}>
                  {this.renderSubroutes}
                </Resolved>

                <Rejected task={loadActivitiesTask}>
                  {error => error.message}
                </Rejected>

                <Pending task={loadActivitiesTask}>
                  {this.renderSubroutes}
                </Pending>
              </Content>
          }
        </Main>
      </Root>
    );
  }
}

export default StudentInfoView;

const Root = styled.div`
  flex: 1;
  display: flex;
  background-color: #F0F0F0;
  max-width: 100vw;
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const Content = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const PostSchoolContent = styled(Content)`
  flex: 1;
`;

const PostSchoolContentBody = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #D43425;
  flex: 1;
  padding: 50px;

  h2 {
    color: white;
    margin: 0;
    font-size: 14px;
    font-weight: bold;
    line-height: 19px;
  }

  h3 {
    margin: 7px 0 23px;
    color: #A20B0E;
    font-size: 12px;
    font-weight: bold;
    line-height: 17px;
  }
`;

const StudentTabs = styled(Tabs).attrs({flipped: true})`
  padding-left: 38px;
  padding-top: 0;
  max-width: 100%;

  @media ${breakpoints.small} {
    padding-left: 0;
  }
`;

const StudentTabContainer = styled(TabContainer)`
  border-bottom: 0px solid white;
  background-color: #F0F0F0;
  height: auto;
  max-width: 100%;
`;

const StudentTab = styled(Tab).attrs({
  activeBackgroundColor: '#D43425',
  inactiveBackgroundColor: 'white',
  activeTextColor: 'white',
  inactiveTextColor: '#D43425',
})``;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  max-height: 75px;
  min-height: 75px;
  margin: 9px 30px 9px 0;

  @media ${breakpoints.small} {
    max-height: none;
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 0;
    margin-right: 0;
  }
`;

const StudentText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #4A4A4A;
  padding: 0 30px 11px 30px;

  @media ${breakpoints.small} {
    border-bottom: 1px solid #D43425;
  }
`;

const StudentName = styled.h1`
  font-size: 22px;
  font-weight: bold;
  margin: 0 0 0 0;
`;

const StudentDescription = styled.h2`
  font-size: 12px;
  line-height: 14px;
  margin: 5px 0 0 0;
`;

const StyledTermSelect = styled(TermSelect)`
  min-width: 150px;
  background-color: #E7E7E7;
  border-radius: 4px;
  color: #9B9B9B;
  overflow: hidden;
  @media ${breakpoints.small} {
    margin: 8px 10px 12px 10px;
  }
`;
