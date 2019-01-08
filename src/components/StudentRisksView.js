import React, { Component } from 'react';
import styled from 'styled-components';
import { observable, computed, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Route, Switch, withRouter } from 'react-router-dom';
import Button from './Button';
import ExpandableListItem from './ExpandableListItem';
import EditRiskFactorForm  from './EditRiskFactorForm';
import EditSkillsForm  from './EditSkillsForm';
import EditCareerDevForm  from './EditCareerDevForm';
import responsive from '../utils/responsive';
import formatGrade from '../utils/formatGrade';

@responsive
@withRouter
@inject('store')
@observer
class StudentRisksView extends Component {
  @observable loadTask = null;

  @computed get termStudent() {
    const { term, student } = this.props;
    return term.students.find(s => s.id === student.id);
  }

  confirmHistoricEdit() {
    const { store, student, term } = this.props;
    if(store.isCurrentTerm(term)) return true;
    return student.confirmHistoricEdit();
  }

  @action.bound async handleEditRiskFactorsClick() {
    if(!await this.confirmHistoricEdit()) return;
    this.props.history.push(this.props.location.pathname + '/riskFactors');
  }

  @action.bound async handleEditStudentSkillsClick() {
    if(!await this.confirmHistoricEdit()) return;
    this.props.history.push(this.props.location.pathname + '/skills');
  }

  @action.bound async handleEditCareerDevClick() {
    if(!await this.confirmHistoricEdit()) return;
    this.props.history.push(this.props.location.pathname + '/careerDev');
  }

  render() {
    const { schoolYear, term, breakpoints } = this.props;
    const groupListItemHeight = breakpoints.small ? 40 : 60;
    const student = this.termStudent;

    return (
      <Root>
        <GroupList
          title="Risk Factors"
          completePercent={student.riskFactorPercentage}
          onEditClick={this.handleEditRiskFactorsClick}
          childHeight={groupListItemHeight}
        >
          <ValueRow name="Grade" value={formatGrade(student.gradeType, student.grade)}/>
          <ValueRow name="% of school time absent (excused or not)" value={student.absentPercent}/>
          <ValueRow name="# of behavior marks/office referrals this yr" value={student.behaviorMarks}/>
          <ValueRow name="Suspended this year" value={student.suspended}/>
          <ValueRow name="Failing English/ELA class" value={student.failingEnglish}/>
          <ValueRow name="Failing Math class" value={student.failingMath}/>
          <ValueRow name="Failing any other course" value={student.failingOther}/>
          <ValueRow name="On-track for grade level" value={student.onTrack}/>
          <ValueRow name="Retained one or more years" value={student.retained}/>
          <ValueRow name="Number of schools attended K-present" value={student.schoolsAttended}/>
          <ValueRow name="Participated in at least 1 extracurricular activity" value={student.hasExtracurricular}/>
        </GroupList>

        <GroupList 
          title="Student Skills" 
          completePercent={student.skillPercentage}
          onEditClick={this.handleEditStudentSkillsClick}
          childHeight={groupListItemHeight}
        >
          <ValueRow name="Self-determination skills" value={student.hasSelfDeterminationSkills}/>
          <ValueRow name="Independent-living skills" value={student.hasIndependentLivingSkills}/>
          <ValueRow name="Travel skills" value={student.hasTravelSkills}/>
          <ValueRow name="Social skills" value={student.hasSocialSkills}/>
        </GroupList>

        <GroupList
          title="Career Dev and IEP"
          completePercent={student.careerDevPercentage}
          onEditClick={this.handleEditCareerDevClick}
          childHeight={groupListItemHeight}
        >
          <ValueRow name="Student attended IEP meeting" value={student.attendedIepMeeting}/>
          {student.attendedIepMeeting &&
            <ValueRow name="IEP Meeting Role" value={student.iepRole}/>
          }
          <ValueRow name="Career development/Graduation plan" value={student.hasGraduationPlan}/>
        </GroupList>

        <Switch>
          <Route path="/*/riskFactors" render={props =>
            <Overlay>
              <EditRiskFactorForm 
                key={student.id} 
                student={student}
                schoolYear={schoolYear}
                term={term}
              />
            </Overlay>
          }/>
          <Route path="/*/skills" render={props =>
            <Overlay>
              <EditSkillsForm 
                key={student.id} 
                student={student}
                schoolYear={schoolYear}
                term={term}
              />
            </Overlay>
          }/>
          <Route path="/*/careerDev" render={props =>
            <Overlay>
              <EditCareerDevForm 
                key={student.id} 
                student={student}
                schoolYear={schoolYear}
                term={term}
              />
            </Overlay>
          }/>
        </Switch>
      </Root>
    );
  }
}

export default StudentRisksView;

const Root = styled.div`
  position: relative;
  flex: 1;
  background-color: #D43425;
`;

function GroupList(props) {
  const { title, completePercent, onEditClick, ...rest } = props;

  return (
    <ExpandableListItem {...rest}
      header={
        <GroupListHeader>
          <GroupTitle>{title}</GroupTitle>
          <GroupCompletePercent>{completePercent}% complete</GroupCompletePercent>
          <EditButton onClick={onEditClick}><EditIcon/></EditButton>
        </GroupListHeader>
      }
    />
  );
}

const ValueRow = styled(ExpandableListItem.Item).attrs({
  children(props) {
    return (
      <React.Fragment>
        <Key>{props.name}</Key>
        <Value>{formatValue(props.value)}</Value>
      </React.Fragment>
    );
  }
})`
  justify-content: space-between;
`;

function formatValue(value) {
  if(value == null) return '--';
  if(value === true) return 'Yes';
  if(value === false) return 'No';
  return value;
}

const Key = styled.div``;
const Value = styled.div`
  color: #D43425;
`;

const EditIcon = styled.img.attrs({
  src: require('../assets/edit_icon.png')
})`
  opacity: 0.5;
  transition: opacity 0.2s;
  width: 20px;
  height: 19px;
`;

const EditButton = styled(Button)`
  &:hover img {
    opacity: 1;
  }
`;

const GroupListHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  flex: 1;
`;

const GroupTitle = styled.div`
  flex: 1;
  font-size: 16px;
`;

const GroupCompletePercent = styled.div`
  color: #A20B0E;
  margin-right: 32px;
  font-size: 12px;
  font-style: italic;
  font-weight: 600;
`;

const Overlay = styled.div`
  position: absolute;
  left: 0;
  width: 100%;

  // 44px is the height of the tabs
  height: calc(100% + 44px);
  top: -44px;
  background-color: #F2F2F2;
  border-top: 1px solid #D43425;
  padding: 29px 35px 29px 35px;

  > * {
    height: 100%;
    width: 100%;
  }
`;
