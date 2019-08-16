import React, { Component } from 'react';
import { observable, computed, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Route, Redirect, withRouter } from 'react-router-dom';
import styled from 'styled-components';
import swal from 'sweetalert2';
import downloadString from '../utils/downloadString';
import Section from '../components/Section';
import Button from '../components/Button';
import Select from '../components/Select';
import StudentList from '../components/StudentList';
import StudentListItem from '../components/StudentListItem';
import Screen from '../components/Screen';
import EditStudentForm from '../components/EditStudentForm';
import CreateStudentForm from '../components/CreateStudentForm';
import StudentInfoView from '../components/StudentInfoView';
import StudentFilterForm from '../components/StudentFilterForm';
import Divider from '../components/Divider';
import AsyncTask from '../models/AsyncTask';
import SpinnerOverlay from '../components/SpinnerOverlay';
import { Pending } from '../components/Task';
import responsive from '../utils/responsive';
import * as Icons from '../components/Icons';
import * as breakpoints from '../breakpoints';
import OpenFiltersButton from '../components/OpenFiltersButton';
import RadioButton from '../components/RadioButton';
import MultipleStudentInfoView from '../components/MultipleStudentInfoView';

@responsive
@withRouter
@inject('store')
@observer
class Students extends Component {
  @observable search = '';
  @observable filtersOpen = false;
  @observable filter = null;
  @observable loadTask = null;
  @observable selectedStudents = []

  @computed get normalizedSearch() {
    return (this.search || '').trim().toLowerCase();
  }

  get schoolYearId() {
    return this.props.schoolYearId || +this.props.match.params.schoolYearId;
  }

  @computed get filteredStudents() {
    const { normalizedSearch, filter, students } = this;
    if (!normalizedSearch.length && !filter) return students;
    return students.filter(student => {
      if (normalizedSearch.length && student.searchMatches(normalizedSearch)) return true;
      if (filter && student.filterMatches(filter)) return true;
      return false;
    });
  }

  @computed get schoolYear() {
    const { loadTask } = this;
    if (!loadTask.resolved) return null;
    return loadTask.result;
  }

  @computed get students() {
    const { schoolYear } = this;
    return schoolYear ? schoolYear.students : [];
  }

  @action.bound handleStudentClick(student) {
    const { schoolYear, schoolYearId, selectedStudents } = this;
    if (!selectedStudents.includes(student)) {
      selectedStudents.push(student)
    }

    if (selectedStudents.length === 1) {
      this.props.history.push(student.getViewRoute(schoolYear));
    } else {
      this.props.history.push(`/${schoolYearId}/students/multiple`)
    }
  }

  @action.bound async handleCreateStudentClick() {
    await this.loadTask;
    const { store } = this.props;
    const { schoolYear } = this;

    const confirmed = schoolYear.id === store.currentSchoolYear.id || await swal({
      title: 'Are you sure?',
      text: `You are about to edit historical data. Are you sure you want to continue?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(result => result.value);

    if (!confirmed) return;

    this.props.history.push(`/${schoolYear.id}/students/new`);
  }

  @action.bound handleSearchChange(event) {
    this.search = event.target.value;
  }

  @action.bound handleFilterPanelToggle() {
    this.filtersOpen = !this.filtersOpen;
  }

  @action.bound handleFiltersChange(filter) {
    this.filter = filter;
    this.filtersOpen = false;
  }

  @action.bound handleSchoolYearChange(event) {
    const schoolYearId = +event.target.value;
    this.props.history.push(`/${schoolYearId}/students`);
  }

  @action.bound async handleStudentEditClick(student) {
    const { history, store } = this.props;
    const { schoolYear } = this;

    if (!store.isCurrentSchoolYear(schoolYear) && !await student.confirmHistoricEdit()) return;

    history.push(student.getEditRoute(schoolYear));
  }

  @action.bound async handleExportClick() {
    const { schoolYear, filter, filteredStudents } = this;
    const { store } = this.props;
    const csvString = await store.getStudentExportData(schoolYear, filter ? filteredStudents : null);
    const filename = `students-${schoolYear.yearRange}${filter ? '-filtered' : ''}.csv`;
    downloadString(csvString, 'text/csv', filename);
  }

  @action async load() {
    const { store } = this.props;
    const schoolYear = store.getSchoolYearById(this.schoolYearId);

    if (schoolYear && schoolYear.students.length) {
      this.loadTask = AsyncTask.resolve(schoolYear);
    } else {
      this.loadTask = store.fetchSchoolYear(this.schoolYearId);
    }
  }

  @action.bound handleStudentRemove(id) {
    this.selectedStudents = this.selectedStudents.filter(student => student.id !== id)
  }

  componentWillMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    const schoolYearId = +this.props.match.params.schoolYearId;
    const prevSchoolYearId = +prevProps.match.params.schoolYearId;
    if (schoolYearId !== prevSchoolYearId) {
      this.load();
      this.filter = null;
    }
  }

  renderLoadingSubroute() {
    return (
      <SubRouteWrapper>
        <SpinnerOverlay open />
      </SubRouteWrapper>
    );
  }

  @action.bound renderStudentListItem(student) {
    const { selectedStudents, handleStudentClick } = this

    return (
      <StudentListItem key={student.id} student={student}>
        <RadioButton checked={selectedStudents.includes(student)} onChange={handleStudentClick.bind(null, student)} />
      </StudentListItem>
    )
  };

  render() {
    const { search, filter, schoolYearId, filteredStudents, schoolYear, loadTask, handleStudentRemove, selectedStudents } = this;
    const { schoolYears } = this.props.store;

    return (
      <Screen>
        <Main fullWidth>
          <YearSelectBar>
            <YearSelectLabel>School Year</YearSelectLabel>
            <YearSelect value={schoolYearId} onChange={this.handleSchoolYearChange}>
              {schoolYears.map(schoolYear =>
                <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.year} - {schoolYear.year + 1}</option>
              )}
            </YearSelect>
          </YearSelectBar>
          <Content>
            <StudentListContainer>
              {this.filtersOpen &&
                <StudentFilterForm
                  filter={filter}
                  onClose={this.handleFilterPanelToggle}
                  onSubmit={this.handleFiltersChange}
                />
              }
              <SearchForm>
                <OpenFiltersButton onClick={this.handleFilterPanelToggle} />
                <SearchInputContainer>
                  <SearchInput onChange={this.handleSearchChange} value={search} />
                  <SearchIcon />
                </SearchInputContainer>
                <AddStudentButton onClick={this.handleCreateStudentClick}>
                  <AddIcon />
                </AddStudentButton>
              </SearchForm>


              <StudentList
                students={filteredStudents}
                selectedStudents={selectedStudents}
                renderItem={this.renderStudentListItem}
              />

              <Pending task={loadTask}>
                {() => !this.props.breakpoints.mediumOrSmall && <SpinnerOverlay open />}
              </Pending>

              <ExportButton onClick={this.handleExportClick}>
                <div />
                EXPORT STUDENT DATA
                <ExportIcon />
              </ExportButton>
            </StudentListContainer>

            <StyledDivider />

            <Route path={`/${schoolYearId}/students/new`} render={props => {
              if (schoolYear) {
                return (
                  <SubRouteWrapper>
                    <CreateStudentForm schoolYear={schoolYear} />
                  </SubRouteWrapper>
                );
              } else {
                return this.renderLoadingSubroute();
              }
            }} />

            <Route path={`/${schoolYearId}/students/edit/:studentId`} render={props => {
              if (!schoolYear) return this.renderLoadingSubroute();
              const student = filteredStudents.find(student => student.id === +props.match.params.studentId);

              if (!student) return (<Redirect to={`/${schoolYearId}/students`} />);

              return (
                <SubRouteWrapper>
                  <EditStudentForm
                    key={student.id}
                    student={student}
                    schoolYear={schoolYear}
                  />
                </SubRouteWrapper>
              );
            }} />

            <Route path={`/${schoolYearId}/students/view/:studentId`} render={props => {
              if (!schoolYear) return this.renderLoadingSubroute();
              const studentId = +props.match.params.studentId;
              const student = filteredStudents.find(student => student.id === studentId);

              if (!student) return (<Redirect to={`/${schoolYearId}/students`} />);

              return (
                <SubRouteWrapper>
                  <StudentInfoView
                    key={`${student.id}-${schoolYear.id}` /* Force re-mounting/re-loading on change */}
                    student={student}
                    schoolYear={schoolYear}
                  />
                </SubRouteWrapper>
              );
            }} />

            <Route path={`/${schoolYearId}/students/multiple`} render={props => {
              const { selectedStudents } = this

              if (selectedStudents.length <= 1) {
                // TODO: need to see what the expected behavior is at this level
                this.selectedStudents = [] 
                return (<Redirect to={`/${schoolYearId}/students`} />)
              }

              return (
                <SubRouteWrapper>
                  <MultipleStudentInfoView
                    selectedStudents={selectedStudents}
                    handleStudentRemove={handleStudentRemove}
                    schoolYear={schoolYear}
                  />
                </SubRouteWrapper>
              )
            }} />
          </Content>
        </Main>
      </Screen>
    );
  }
}

export default Students;

const YearSelectBarHeight = 35;
const Main = styled(Section)`
  position: relative;
  flex: 1;
  background-color: #F2F2F2;
  max-height: calc(100% - ${YearSelectBarHeight}px);
`;

const YearSelectBar = styled.div`
  width: 100%;
  height: ${YearSelectBarHeight}px;
  background-color: black;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0 44px 0 44px;
`;

const Content = styled(Section.Content)`
  display: flex;
  position: relative;
  flex-direction: row;
  height: 100%;
  background-color: #F2F2F2;

  @media ${breakpoints.mediumOrSmall} {
    flex-direction: column;
  }
`;

const StyledDivider = styled(Divider)`
  @media ${breakpoints.mediumOrSmall} {
    display: none;
  }
`;

const StudentListContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 450px;
  height: 100%;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.3);

  @media ${breakpoints.mediumOrSmall} {
    max-width: none;
    height: auto;
  }
`;

const AddStudentButton = styled(Button)`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddIcon = styled(Icons.OrangeCirclePlus)`
  width: 20px;
  height: 20px;
`;

const ExportButton = styled(Button)`
  width: 100%;
  height: 40px;
  background-color: #262626;
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px 0 25px;
  font-family: "Oswald";
  font-size: 14px;
`;

const ExportIcon = styled(Icons.ArrowSquare)`
  width: 22px;
  height: 20px;
`;

const SearchForm = styled.div`
  width: 100%;
  height: 71px;
  background-color: #F2F2F2;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 40px;
  padding-right: 13px;
  border-bottom: 1px solid #E1E1E1;
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  height: 40px;
  margin-right: 14px;
`;

const SearchInput = styled.input`
  position: relative;
  border: none;
  outline: none;
  height: 100%;
  width: 100%;
  background-color: white;
  padding-left: 20px;
  color: black;
  font-size: 14px;
  border-radius: 5px;
`;

const SearchIcon = styled(Icons.Magnifier)`
  width: 18px;
  height: 18px;
  position: absolute;
  right: 11px;
  top: 11px;
  pointer-events: none;
`;

const YearSelectHandle = styled(Icons.WhiteChevron)`
  width: 16px;
  height: 8px;
`;

const YearSelect = styled(Select).attrs({
  Handle: () => () => (<YearSelectHandle />)
})`
  min-width: 120px;
  background-color: inherit;
  color: white;
  font-size: 12px;
`;

const YearSelectLabel = styled.div`
	color: #9B9B9B;
	font-size: 12px;
	font-weight: bold;
  line-height: 17px;
  margin-right: 20px;
`;

const SubRouteWrapper = styled.div`
  display: flex;
  position: relative;
  overflow: auto;
  flex: 1;
  max-width: 100vw;

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
