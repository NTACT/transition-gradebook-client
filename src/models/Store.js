import axios from 'axios';
import { first, compact } from 'lodash';
import { observable, computed, action, runInAction, toJS } from 'mobx';
import wait from '../utils/wait';
import parseArrayBuffer from '../utils/parseArrayBuffer';
import { task } from './AsyncTask';
import User from './User';
import Disability from './Disability';
import SchoolYear from './SchoolYear';
import ActivityTypeGroup from './ActivityTypeGroup';
import Activity from './Activity';
import StudentTermInfo from './StudentTermInfo';
import SchoolSettings from './SchoolSettings';
import findById from '../utils/findById';
import Model from './Model';
import qs from 'qs';

const authTokenKey = 'com.emberex.transition_gradebook.authToken';

export default class Store {
  @observable online = window.navigator.onLine;
  @observable authToken = localStorage.getItem(authTokenKey);
  @observable user = null;
  @observable schoolSettings = null;
  @observable users = [];
  @observable disabilities = [];
  @observable schoolYears = [];
  @observable activityTypeGroups = [];
  @observable initTask;

  constructor() {
    Model.setStore(this);
    window.addEventListener('online', action(() => this.online = true));
    window.addEventListener('offline', action(() => this.online = false));
  }

  // Authenticated axios instance
  @computed get axios() {
    const { authToken } = this;
    if(!authToken) return axios;
    const axiosInstance = axios.create({
      headers: { 'Authorization': authToken }
    });

    if(authToken) {
      // Logout automatically if a 401 response is received
      axiosInstance.interceptors.response.use(
        response => response,
        error => {
          if(error.response && error.response.status === 401) {
            this.logout();
          }
          throw error;
        }
      );
    }

    return axiosInstance;
  }

  

  @computed get loggedIn() {
    return !!this.authToken;
  }

  @computed get today() {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth()+1;
    const year = now.getFullYear();
    return `${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}-${year}`;
  }

  @computed get currentSchoolYear() {
    return first(this.schoolYears.sort((a, b) => b.year - a.year));
  }

  @computed get students() {
    const { currentSchoolYear } = this;
    if(!currentSchoolYear) return [];
    return currentSchoolYear.students;
  }

  @computed get admins() {
    return this.users.filter(user => user.admin);
  }

  isCurrentSchoolYear(schoolYear) {
    return schoolYear.id === this.currentSchoolYear.id;
  }

  isCurrentTerm(term) {
    return term.id === this.currentSchoolYear.currentTerm.id;
  }

  getActivityTypeGroupById(groupId) {
    return findById(this.activityTypeGroups, groupId);
  }

  getSchoolYearById(schoolYearId) {
    return findById(this.schoolYears, schoolYearId);
  }

  @task('Init')
  async _init() {
    while(!this.online) await wait(1000);
    await Promise.all(compact([
      !this.user && this.fetchUser(),
      this.fetchSchoolSettings(),
      this.fetchActivityGroups(),
      this.fetchSchoolYears(),
      this.fetchDisabilities(),
      this.fetchUsers(),
    ]));
  }

  init() {
    this.initTask = this._init();
    return this.initTask;
  }

  @task('login')
  async login(username, password) {
    const result = await this.axios.post('/api/login', { username, password }).catch(error => ({error}));

    if (result.error) {
      return result;
    }

    const { user, authToken } = result.data;

    runInAction(() => {
      this.user = new User(user);
      this.authToken = authToken;
      localStorage.setItem(authTokenKey, authToken);
    });

    return this.authToken;
  }

  @task('Request password reset')
  async forgotPassword(username) {
    return await this.axios.post('/api/forgotPassword', { username }).catch(error => ({error}));
  }

  @task('Check reset password request')
  async checkResetPasswordIdentifier(uid) {
    return await this.axios.get(`/api/checkResetPasswordRequest?uid=${uid}`).catch(error => ({error}));
  }

  @task('Update password')
  async resetPassword(uid, password) {
    return await this.axios.post('/api/resetPassword', { uid, password }).catch(error => ({error}));
  }

  @task('Fetch user')
  async fetchUser() {
    const result = await this.axios.get('/api/user');
    const { user } = result.data;

    runInAction(() => {
      this.user = new User(user);
    });

    return this.user;
  }

  @task('Fetch users')
  async fetchUsers() {
    const result = await this.axios.get('/api/users');
    const { users } = result.data;

    runInAction(() => {
      this.users = User.fromArray(users);
    });

    return this.users;
  }

  @task('Create user')
  async createUser(fields) {
    const result = await this.axios.post('/api/users', fields);
    const user = new User(result.data.user);
    this.users.push(user);
    return user;
  }

  @task('Update user')
  async updateUser(user, fields) {
    const result = await this.axios.post(`/api/users/${user.id}`, fields);
    const userListUser = this.users.find(u => u.id === user.id);
    user.patch(result.data.user);

    if(userListUser) {
      userListUser.patch(result.data.user);
    }
    if(user.id === this.user.id) {
      this.user.patch(result.data.user);
    }
    return user;
  }

  @task('Delete user')
  async deleteUser(user) {
    await this.axios.delete(`/api/users/${user.id}`);
    this.users.remove(user);
    if(user.id === this.user.id) this.logout();
  }

  @task('Create student and add to a school year')
  async createStudent(schoolYear, fields) {
    const result = await this.axios.post(`/api/schoolYears/${schoolYear.id}/students`, fields);
    const studentTermInfos = result.data.studentTermInfos.map(studentTermInfo =>
      new StudentTermInfo(studentTermInfo)
    );

    return runInAction(() => {
      studentTermInfos.forEach(studentTermInfo => {
        const term = schoolYear.terms.find(term => term.id === studentTermInfo.termId);
        term.studentTermInfos.push(studentTermInfo);
      });
      return studentTermInfos[0];
    });
  }

  @task('Update student')
  async updateStudent(student, schoolYear, fields) {
    const result = await this.axios.post(`/api/schoolYears/${schoolYear.id}/students/${student.id}`, fields);
    const { studentTermInfos } = result.data;

    schoolYear.terms.forEach(term => {
      term.studentTermInfos.forEach(termInfo => {
        if(termInfo.student.id === student.id) {
          termInfo.gradeLevel = fields.gradeLevel;
          const modifiedTermInfo = studentTermInfos.find(t => t.id === termInfo.studentTermInfoId);
          if(modifiedTermInfo) {
            termInfo.patch(modifiedTermInfo);
          }
        }
      });
    });

    return student;
  }

  @task('Remove student from a school year')
  async removeStudentFromSchoolYear(student, schoolYear) {
    await this.axios.delete(`/api/schoolYears/${schoolYear.id}/students/${student.id}`);
    schoolYear.terms.forEach(term => {
      const studentTermInfo = term.studentTermInfos.find(termInfo => termInfo.student.id === student.id);
      if(studentTermInfo) term.studentTermInfos.remove(studentTermInfo);
    });
  }

  @task('Fetch disabilities')
  async fetchDisabilities() {
    const result = await this.axios.get('/api/disabilities');
    const { disabilities } = result.data;

    runInAction(() => {
      this.disabilities = Disability.fromArray(disabilities);
    });

    return this.disabilities;
  }

  @task('Fetch activity type groups')
  async fetchActivityGroups() {
    const result = await this.axios.get('/api/activities/groups');
    const { activityTypeGroups } = result.data;

    runInAction(() => {
      this.activityTypeGroups = ActivityTypeGroup.fromArray(activityTypeGroups);
    });

    return this.activityTypeGroups;
  }

  @task('Fetch school years')
  async fetchSchoolYears() {
    const result = await this.axios.get('/api/schoolyears');
    const { schoolYears } = result.data;

    runInAction(() => {
      this.schoolYears = SchoolYear.fromArray(schoolYears);
    });

    return this.schoolYears;
  }

  @task('Fetch school year with students')
  async fetchSchoolYear(schoolYearId) {
    const { schoolYears } = this;
    const result = await this.axios.get(`/api/schoolyears/${schoolYearId}`);
    const { schoolYear } = result.data;
    schoolYear.studentsLoaded = true;
    let model = findById(schoolYears, schoolYear.id);

    runInAction(() => {
      if(model) {
        model.patch(schoolYear);
      } else {
        model = new SchoolYear(schoolYear);
        this.schoolYears.push(model);
      }
    });

    return model;
  }

  @task('Download report PDF')
  async downloadReport(endpoint, filename, filters) {
    if(endpoint[0] !== '/') endpoint = '/' + endpoint;
    const { grades, riskLevels, supportNeeded, races, disabilities, ...others} = filters;
    const disabilitiesFilter = disabilities ? disabilities.map(disability => disability.name) : undefined;
    const response = await this.axios.get(`/api/reports${endpoint}`, {
      params: {
        //toJS so that they are a "real array" that qs can understand
        grades: toJS(grades),
        riskLevels: toJS(riskLevels),
        supportNeeded: toJS(supportNeeded), 
        races: toJS(races),
        disabilities: disabilitiesFilter,
        ...others
      },
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/pdf'
      },
      paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat'}),
    }).catch(error => {
      if(error.response && error.response.data instanceof ArrayBuffer) {
        error.response.parsedData = parseArrayBuffer(error.response.data);
      }
      throw error;
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.pdf`);
    document.body.appendChild(link);
    link.click();
  }

  @task('Create school year')
  async createSchoolYear({year, students, terms, termType}) {
    const result = await this.axios.post('/api/schoolYears', {
      year, students, terms, termType
    });
    const schoolYear = new SchoolYear(result.data.schoolYear);
    this.schoolYears.push(schoolYear);
    return schoolYear;
  }

  @task('Fetch student activities')
  async fetchStudentActivities(student, schoolYear) {
    const result = await this.axios.get(`/api/activities/${student.id}/${schoolYear.id}`);
    return Activity.fromArray(result.data.activities).sort((a, b) => b.createdAt - a.createdAt);
  }

  @task('Create student activity')
  async createStudentActivity(student, schoolYear, fields) {
    const result = await this.axios.post(`/api/activities/${student.id}/${schoolYear.id}`, fields);
    return new Activity(result.data.activity);
  }

  @task('Edit student activity')
  async editStudentActivity(student, schoolYear, activity, fields) {
    const result = await this.axios.post(`/api/activities/${student.id}/${schoolYear.id}/${activity.id}`, {
      ...fields,
      events: fields.events.map(event => ({
        eventTime: event.eventTime
      }))
    });
    activity.patch(result.data.activity);
    return activity;
  }

  @task('Delete activity')
  async deleteActivity(activity) {
    return this.axios.delete(`/api/activities/${activity.id}`);
  }

  @task('Fetch student term info')
  async fetchStudentTermInfo(student, term) {
    const result = await this.axios.get(`/api/students/${student.id}/termInfo/${term.id}`);
    return new StudentTermInfo(result.data.studentTermInfo);
  }

  @task('Edit student term info')
  async editStudentTermInfo(studentTermInfo, fields) {
    const result = await this.axios.post(`/api/studentTermInfo/${studentTermInfo.studentTermInfoId}`, fields);
    studentTermInfo.patch(result.data.studentTermInfo);
    return studentTermInfo;
  }

  @task('Fetch school settings')
  async fetchSchoolSettings() {
    const result = await this.axios.get('/api/schoolSettings');
    const schoolSettings = new SchoolSettings(result.data.schoolSettings);
    this.schoolSettings = schoolSettings;
    return schoolSettings;
  }

  @task('Edit school settings')
  async editSchoolSettings(fields) {
    const result = await this.axios.post('/api/schoolSettings', fields);
    this.schoolSettings.patch(result.data.schoolSettings);
    return this.schoolSettings;
  }

  @task('Get student export CSV')
  async getStudentExportData(schoolYear, students) {
    const result = await this.axios.post(`/api/schoolYears/${schoolYear.id}/export`, {
      studentIds: students && students.map(s => s.id)
    });
    return result.data;
  }

  @task('Import students from CSV')
  async importStudentsFromCSV(schoolYear, csvData) {
    await this.axios.post(`/api/schoolYears/${schoolYear.id}/import`, csvData);
    // Create and edit paths are very different, so instead of handling those paths, just re-fetch the school year
    return this.fetchSchoolYear(schoolYear.id)
  }

  @task('Fetch term student list')
  async fetchTermStudents(term) {
    const result = await this.axios.get(`/api/term/${term.id}/students`);
    term.studentTermInfos = StudentTermInfo.fromArray(result.data.students);
    return term.studentTermInfos;
  }

  @task('Fetch dashboard data')
  async fetchDashboardData() {
    const result = await this.axios.get(`/api/dashboard/${this.currentSchoolYear.currentTerm.id}`);
    const {
      students,
      studentGradeGroups,
      activityGroups,
      studentRiskGroups,
      offTrackStudents,
      chronicAbsentStudents,
      interventionGroups,
      raceGroups,
    } = result.data;

    const studentMap = students.reduce((map, student) => {
      map.set(student.id, new StudentTermInfo(student));
      return map;
    }, new Map());
  
    const resolveStudents = studentIds => studentIds.map(id => studentMap.get(id)).sort(StudentTermInfo.sorter);

    for(let group of studentGradeGroups) {
      group.students = resolveStudents(group.students);
    }

    for(let group of studentRiskGroups) {
      group.students = resolveStudents(group.students);
    }

    for(let group of activityGroups) {
      group.students = resolveStudents(group.students);
    }

    for(let group of interventionGroups) {
      group.students = resolveStudents(group.students);
    }

    for(let group of raceGroups) {
      group.students = resolveStudents(group.students);
    }

    return {
      studentCount: students.length,
      studentGradeGroups,
      activityGroups,
      studentRiskGroups,
      interventionGroups,
      raceGroups,
      offTrackStudents: resolveStudents(offTrackStudents),
      chronicAbsentStudents: resolveStudents(chronicAbsentStudents),
    };
  }

  @action logout() {
    localStorage.removeItem(authTokenKey);
    this.authToken = null;
    this.user = null;
    this.users = [];
    this.disabilities = [];
    this.schoolYears = [];
    this.activityTypeGroups = [];
  }
}
