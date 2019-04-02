import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withRouter, Route } from 'react-router-dom';
import styled from 'styled-components';
import Screen from '../components/Screen';
import Main from '../components/Main';
import Content from '../components/Content';
import NavigationBar from '../components/NavigationBar';
import ListContainer from '../components/ListContainer';
import ListItem from '../components/ListItem';
import ListItemInfo from '../components/ListItemInfo';
import List from '../components/List';
import TabContainer from '../components/TabContainer';
import Tabs from '../components/Tabs';
import Tab from '../components/Tab';
import SummaryReport from '../components/reports/SummaryReport';
import RiskRosterReport from '../components/reports/RiskRosterReport';
import RiskSummaryReport from '../components/reports/RiskSummaryReport';
import NumberOfStudents from '../components/reports/NumberOfStudents';
import StudentReport from '../components/reports/StudentReport';
import StudentRiskReport from '../components/reports/StudentRiskReport';
import PostSchoolReport from '../components/reports/PostSchoolReport';
import Divider from '../components/Divider';
import * as breakpoints from '../breakpoints';

const subroute = '/Reports';
const summary = '/Summary';
const individual = '/Individual';

const pathNames = {
  summary: subroute + summary + '/',
  riskRoster: subroute + summary + '/RiskRoster',
  riskSummary: subroute + summary + '/RiskSummary',
  numberOfStudents: subroute + summary + '/StudentCount',
  student: subroute + individual + '/Student',
  studentRisk: subroute + individual + '/StudentRisk',
  postSchool: subroute + individual + '/PostSchool',
};

@inject('store')
@withRouter
@observer
class Reports extends Component {
  @observable reportType = 'summary';

  componentDidMount() {
    this.checkReportTypeRoute();
  }

  componentDidUpdate(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.checkReportTypeRoute();
    }
  }

  switchReportType = reportType => {
    const { history } = this.props;
    if(reportType === 'individual') {
      history.push('/Reports/Individual');
    } else {
      history.push('/Reports')
    }
  };

  checkReportTypeRoute = () => this.reportType = this.props.location.pathname.indexOf(individual) > -1 ? 'individual' : 'summary';

  checkRoute = (path) => this.props.location.pathname === path;

  handleReportClick = (path) => {
    if (this.props.location.pathname !== path) {
      this.props.history.push(path);
    }
  };

  render() {
    const { store } = this.props;
    const { schoolYears } = store;
    const {
      checkRoute,
      handleReportClick,
      reportType,
      switchReportType,
    } = this;

    return (
      <Screen>
        <Main fullWidth>
          <Content>
            <NavigationBar/>
            <ListWrapper>
              <TabContainer>
                <Tabs>
                  <Tab active={reportType === 'individual'} onClick={() => switchReportType('individual')}>Individual</Tab>
                  <Tab active={!reportType || reportType === 'summary'} onClick={() => switchReportType('summary')}>Summary</Tab>
                </Tabs>
              </TabContainer>
              <ReportLinkList hidden={reportType !== 'summary'}>
                <ReportLink onClick={() => handleReportClick(pathNames.summary)}>
                  <ListItem active={checkRoute(pathNames.summary)}>
                    <div>
                      Summary Report
                      <ListItemInfo>for one term</ListItemInfo>
                    </div>
                  </ListItem>
                </ReportLink>
                <ReportLink onClick={() => handleReportClick(pathNames.riskRoster)}>
                  <ListItem active={checkRoute(pathNames.riskRoster)}>
                    <div>
                      Risk Roster Report
                      <ListItemInfo>for one term</ListItemInfo>
                    </div>
                  </ListItem>
                </ReportLink>
                <ReportLink onClick={() => handleReportClick(pathNames.riskSummary)}>
                  <ListItem active={checkRoute(pathNames.riskSummary)}>
                    <div>
                      Risk Summary
                      <ListItemInfo>over time</ListItemInfo>
                    </div>
                  </ListItem>
                </ReportLink>
                <ReportLink onClick={() => handleReportClick(pathNames.numberOfStudents)}>
                  <ListItem active={checkRoute(pathNames.numberOfStudents)}>
                    <div>
                      Number of Students
                      <ListItemInfo>by disability, risk level, IEP role, support need, skills training, post-school outcomes (chart)</ListItemInfo>
                    </div>
                  </ListItem>
                </ReportLink>
              </ReportLinkList>
              <ReportLinkList hidden={reportType !== 'individual'}>
                <ReportLink onClick={() => handleReportClick(pathNames.student)}>
                  <ListItem active={checkRoute(pathNames.student)}>
                    <div>
                      Student Report
                      <ListItemInfo>for one term or over time</ListItemInfo>
                    </div>
                  </ListItem>
                </ReportLink>
                <ReportLink onClick={() => handleReportClick(pathNames.studentRisk)}>
                  <ListItem active={checkRoute(pathNames.studentRisk)}>
                    <div>
                      Risk Report
                      <ListItemInfo>for one term or over time</ListItemInfo>
                    </div>
                  </ListItem>
                </ReportLink>
                <ReportLink onClick={() => handleReportClick(pathNames.postSchool)}>
                  <ListItem active={checkRoute(pathNames.postSchool)}>
                    <div>
                      Post-School Student Report
                      <ListItemInfo>for one year</ListItemInfo>
                    </div>
                  </ListItem>
                </ReportLink>
              </ReportLinkList>
            </ListWrapper>

            <StyledDivider/>

            <Route exact path={pathNames.summary} render={props =>
              <SubRouteWrapper>
                <SummaryReport store={store} schoolYears={schoolYears}/>
              </SubRouteWrapper>
            }/>
            <Route path={pathNames.riskRoster} render={props =>
              <SubRouteWrapper>
                <RiskRosterReport store={store} schoolYears={schoolYears}/>
              </SubRouteWrapper>
            }/>
            <Route path={pathNames.riskSummary} render={props =>
              <SubRouteWrapper>
                <RiskSummaryReport store={store} schoolYears={schoolYears}/>
              </SubRouteWrapper>
            }/>
            <Route path={pathNames.numberOfStudents} render={props =>
              <SubRouteWrapper>
                <NumberOfStudents store={store} schoolYears={schoolYears}/>
              </SubRouteWrapper>
            }/>
            <Route exact path={pathNames.student} render={props =>
              <SubRouteWrapper>
                <StudentReport store={store} schoolYears={schoolYears} closePath="/Reports/Individual"/>
              </SubRouteWrapper>
            }/>
            <Route path={pathNames.studentRisk} render={props =>
              <SubRouteWrapper>
                <StudentRiskReport store={store} schoolYears={schoolYears} closePath="/Reports/Individual"/>
              </SubRouteWrapper>
            }/>
            <Route path={pathNames.postSchool} render={props =>
              <SubRouteWrapper>
                <PostSchoolReport store={store} schoolYears={schoolYears} closePath="/Reports/Individual"/>
              </SubRouteWrapper>
            }/>
          </Content>
        </Main>
      </Screen>
    );
  }
}

const ReportLinkList = styled.div`
  margin-top: 5px;  
`;

const ReportLink = styled.div``;

const ListWrapper = styled(ListContainer)`
  min-width: 450px;
  max-width: 450px;
  flex: 1 1 100%;
  @media ${breakpoints.mediumOrSmall} {
    width: 100%;
    min-width: 0;
    max-width: none;
  }
`;

const StyledDivider = styled(Divider)`
  @media ${breakpoints.mediumOrSmall} {
    display: none;
  }
`;

const SubRouteWrapper = styled.div`
  overflow: auto;
  flex: 1;

  @media ${breakpoints.mediumOrSmall} {
    min-width: 440px;
  }

  @media ${breakpoints.mediumOrSmall} {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-color: #F0F0F0;
  }
`;

export default Reports;
