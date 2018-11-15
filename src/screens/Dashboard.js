import React, { Component } from 'react';
import styled from 'styled-components';
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import { Link } from 'react-router-dom';
import { enums } from 'tgb-shared';
import Screen from '../components/Screen';
import Row from '../components/Row';
import Column from '../components/Column';
import { Resolved, Rejected, Pending } from '../components/Task';
import Modal from '../components/Modal';
import StudentList from '../components/StudentList';
import StudentListItem from '../components/StudentListItem';
import getMonthName from '../utils/getMonthName';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import * as Icons from '../components/Icons';
import * as breakpoints from '../breakpoints';
import { fadeIn } from '../animations';

const riskColors = {
  'No Data': '#AAA',
  low: '#9BD55D',
  medium: '#F9E33D',
  high: '#FCA92A',
  ultra: '#CE2D22',
};

@inject('store')
@observer
class Dashboard extends Component {
  @observable loadTask;
  @observable openedStudentList = null;

  @action.bound handleOpenStudentList(students) {
    if(students.length) this.openedStudentList = students;
  }

  @action.bound handleCloseStudentList() {
    this.openedStudentList = null;
  }

  componentWillMount() {
    this.loadTask = this.props.store.fetchDashboardData();
  }

  renderPending = () => (
    <SpinnerContainer>
      <Spinner/>
    </SpinnerContainer>
  );

  renderRejected = error => {
    return (
      <Content>
        {error.message}
      </Content>
    );
  };

  renderResolved = data => {
    const {
      studentCount,
      studentGradeGroups,
      studentRiskGroups,
      offTrackStudents,
      chronicAbsentStudents,
      activityGroups,
      interventionGroups,
      raceGroups,
    } = data;
    const now = new Date();

    return (
      <Content>
        <Title>Current Statistics</Title>
        <Subtitle>{formateDate(now)}</Subtitle>

        <RowTitle>Total students</RowTitle>
        <GradeCountRow>
          {studentGradeGroups.map(({ gradeLevel, students }) =>
            <GradeCountColumn
              key={gradeLevel} 
              onClick={students.length
                ? this.handleOpenStudentList.bind(null, students)
                : null
              }
            >
              <GradeName>{formatGradeName(gradeLevel)}</GradeName>
              <GradeCount>{students.length}</GradeCount>
            </GradeCountColumn>
          )}
          <TotalCountColumn>
            <TotalCountLabel>TOTAL</TotalCountLabel>
            <TotalCount>{studentCount}</TotalCount>
          </TotalCountColumn>
        </GradeCountRow>

        <RowTitle>Number of students receiving activities support</RowTitle>
        <ActivitiesRow>
          {activityGroups.map(activityGroup => 
            <CircleBox 
              key={activityGroup.id}
              onClick={activityGroup.students.length 
                ? this.handleOpenStudentList.bind(null, activityGroup.students)
                : null
              }
            >
              {activityGroup.name}
              <Circle>
                <h1>{activityGroup.students.length}</h1>
              </Circle>
            </CircleBox>
          )}
        </ActivitiesRow>

        <RowTitle>Distribution of students across risk categories</RowTitle>
        <RiskRow>
          {studentRiskGroups.map(({ risk, students }) =>
            <RiskColumn
              key={risk}
              onClick={students.length
                ? this.handleOpenStudentList.bind(null, students)
                : null
              }
            >
              <RiskColumnContent>
                <RiskTriangle color={riskColors[risk]}/>
                <RiskCount>{students.length}</RiskCount>
                <RiskPercent>{formatPercent(students.length, studentCount)}</RiskPercent>
              </RiskColumnContent>
              <RiskName>{risk}</RiskName>
            </RiskColumn>
          )}
          <RiskColumn 
            onClick={offTrackStudents.length
              ? this.handleOpenStudentList.bind(null, offTrackStudents) 
              : null
            }
          >
            <RiskColumnContent>
              <RiskCount>{offTrackStudents.length}</RiskCount>
              <RiskPercent>{formatPercent(offTrackStudents.length, studentCount)}</RiskPercent>
            </RiskColumnContent>
            <RiskName>off-track to graduate<br/>on time</RiskName>
          </RiskColumn>
          <RiskColumn
            onClick={chronicAbsentStudents.length
              ? this.handleOpenStudentList.bind(null, chronicAbsentStudents) 
              : null
            }
          >
            <RiskColumnContent>
              <RiskCount>{chronicAbsentStudents.length}</RiskCount>
              <RiskPercent>{formatPercent(chronicAbsentStudents.length, studentCount)}</RiskPercent>
            </RiskColumnContent>
            <RiskName>chronically absent<br/>(absent 10% or more)</RiskName>
          </RiskColumn>
        </RiskRow>
        
        <RowTitle>Students who need intervention / supports in</RowTitle>
        <InterventionsRow>
          {interventionGroups.map(({ name, students }) =>
            <CircleBox
              key={name}
              onClick={students.length
                ? this.handleOpenStudentList.bind(null, students)
                : null
              }
            >
              {name}
              <Circle color="#A20B0E">
                <h1>{students.length}</h1>
                <h2>{formatPercent(students.length, studentCount)}</h2>
              </Circle>
            </CircleBox>
          )}
        </InterventionsRow>

        <RowTitle>Total number of students by race</RowTitle>
        <RaceRow>
          {raceGroups.map(({ race, students }, i) =>
            <RaceColumn key={race}
              onClick={students.length 
                ? this.handleOpenStudentList.bind(null, students)
                : null
              }
            >
              <RaceBox index={i}>
                <RaceCode>{race}</RaceCode>
                <RaceCount>{students.length}</RaceCount>
              </RaceBox>
              <RaceLabel>{race === 'N/A' ? race : enums.raceLabels[race]}</RaceLabel>
            </RaceColumn>
          )}
        </RaceRow>
      </Content>
    );
  };

  renderStudentListItem = student => (
    <StudentListItem
      component={Link}
      key={student.id}
      student={student}
      to={student.getViewRoute(this.props.store.currentSchoolYear)}
    />
  );

  render() {
    const { loadTask, openedStudentList } = this;

    return (
      <Root>
        <StudentModal
          open={openedStudentList}
          onOverlayClick={this.handleCloseStudentList}
          renderOnOverlay={
            <StudentModalClosebutton onClick={this.handleCloseStudentList}><CloseButtonIcon/></StudentModalClosebutton>
          }
        >
          {openedStudentList &&
            <StudentList
              students={openedStudentList}
              renderItem={this.renderStudentListItem}
            />
          }
        </StudentModal>
        {!loadTask ? this.renderPending() : null}
        <Pending task={loadTask}>{this.renderPending}</Pending>
        <Resolved task={loadTask}>{this.renderResolved}</Resolved>
        <Rejected task={loadTask}>{this.renderRejected}</Rejected>
      </Root>
    );
  }
}

function formatGradeName(gradeName) {
  if(gradeName.startsWith('age')) return gradeName.replace('age ', 'AGE');
  return 'GR' + gradeName;
}

function formatPercent(count, total) {
  return Math.floor(100 * count / total) + '%';
}

function formateDate(date) {
  return `${getMonthName(date)} ${date.getDate()}, ${date.getFullYear()}`;
}

export default Dashboard;

const Root = styled(Screen)``;

const Content = styled.div`
  width: 100%;
  overflow: auto;
  padding-bottom: 100px;
  animation: ${fadeIn} 0.25s linear;
  animation-fill-mode: forward;
`;

const SpinnerContainer = styled(Content)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StudentModal = styled(Modal)`
  min-width: 400px;
  max-width: 100%;
  min-height: 400px;
`;

const StudentModalClosebutton = styled(Button)`
  position: absolute;
  right: 50px;
  top: 50px;
  background-color: transparent;
  @media ${breakpoints.small} {
    right: 50px;
    top: 20px;
  }
`;

const CloseButtonIcon = styled(Icons.WhiteCircleX)`
  width: 22px;
  height: 22px;
`;

const Title = styled.h1`
	color: #4A4A4A;
	font-size: 20px;
	font-weight: bold;
  text-align: center;
  margin: 17px 0 0 0;
`;

const Subtitle = styled.h2`
	color: #4A4A4A;
	font-size: 14px;
	text-align: center;
`;

const CenterRow = styled(Row)`
  max-width: 100%;
  width: 940px;
  margin: 0 auto;
`;

const RowTitle = styled(CenterRow)`
	color: #4A4A4A;
	font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  margin-top: 100px;
`;

const GradeCountRow = styled(CenterRow)`
  min-height: 114px;
  align-items: stretch;

  @media ${breakpoints.small} {
    flex-wrap: wrap;
  }
`;

const GradeCountColumn = styled(Column)`
  background-color: #E3E3E4;
  flex: 1 1 100%;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
  max-width: 33%;
  &:nth-child(2n) {
    background-color: #F2F2F2;
  }

  &:hover h3 {
    transition: color 0.2s;
    color: ${props => props.onClick ? '#af472a' : '#F5633A'};
  }
`;

const GradeName = styled.h2`
  margin: 0;
	color: #A20B0E;
	font-size: 16px;
	font-weight: bold;
`;

const GradeCount = styled.h3`
  margin: 0;
	color: #F5633A;
  font-size: 32px;
`;

const TotalCountColumn = styled(Column)`
  flex: 1 1 100%;
  color: white;
  background-color: #CE2D22;
  width: 150px;
  justify-content: center;
  align-items: center;
  max-width: 33%;
`;

const TotalCountLabel = styled.div`
	font-size: 16px;
	font-weight: bold;
`;

const TotalCount = styled.div`
	font-size: 32px;
  font-weight: 300;
`;

const RiskRow = styled(CenterRow)`
  @media ${breakpoints.small} {
    flex-wrap: wrap;
  }
`;

const RiskColumn = styled(Column)`
  flex: 1 1 100%;
  text-align: center;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
  * + & {
    margin-left: 20px;
  }

  @media ${breakpoints.small} {
    width: 33%;
    margin-left: 0;

    * + & {
      margin-top: 20px;
    }
  }
`;

const RiskColumnContent = styled(Column)`
  width: 100%;
  position: relative;
  background-color: #F2F2F2;
  height: 114px;
  align-items: center;
  justify-content: center;
`;

const RiskCount = styled.div`
	color: #A20B0E;
	font-size: 50px;
`;

const RiskPercent = styled.div`
	height: 33px;
	width: 48px;
	color: #D43425;
	font-family: "Open Sans";
	font-size: 24px;
  line-height: 33px;
  margin-top: -10px;
`;

const RiskName = styled.div`
  width: 100%;
  color: #4A4A4A;
  font-size: 12px;
  font-weight: bold;
  margin-top: 8px;
`;

const RiskTriangle = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scale(1.25, 0.9);
  width: 0; 
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 20px solid ${props => props.color};
`;

const ActivitiesRow = styled(CenterRow)`
  @media ${breakpoints.small} {
    flex-direction: column;
  }
`;

const circleWidth = 86;
const CircleBox = styled(Column)`
  flex: 1 1 100%;
  position: relative;
  border: 3px solid #F5633A;
  text-align: center;
  padding: 20px;
  color: #4A4A4A;
  font-size: 20px;
  line-height: 20px;
  min-height: 140px;
  transition: border-color 0.2s;
  margin-bottom: ${circleWidth * 0.4}px; // space for circle hanging over bottom
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
  max-width: 20%;
  * + & {
    margin-left: 20px;
  }

  @media ${breakpoints.medium} {
    padding: 10px;
  }

  @media ${breakpoints.small} {
    margin-left: 0;
    width: 100%;
    max-width: none;
  }
`;

const Circle = styled(Column)`
  width: ${circleWidth}px;
  height: ${circleWidth}px;
  background-color: ${props => props.color || '#D43425'};
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 40%);
  border-radius: 50%;
  justify-content: center;
  text-align: center;
  
  h1 {
    color: white;
    font-size: 32px;
    margin: 0;
  }

  h2 {
    margin: 8px 0 0 0;
    color: #F5633A;
    font-size: 18px;
  }
`;

const InterventionsRow = styled(CenterRow)`
  height: 140px;

  @media ${breakpoints.small} {
    flex-direction: column;
  }
`;

const RaceRow = styled(CenterRow)`
  min-height: 114px;
`;

const RaceColumn = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  flex: 1 1 100%;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
`;

const RaceBox = styled.div`
  background-color: ${props => props.index % 2 ? '#F4F4F4' : '#E7E7E7'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0 20px;
`;

const RaceCode = styled.div`
	color: #A20B0E;
	font-size: 16px;
	font-weight: bold;
`;

const RaceCount = styled.div`
	color: #F5633A;
  font-size: 32px;
  margin-top: 20px;
`;

const RaceLabel = styled.div`
  font-size: 16px;
  margin-top: 10px;
`;
