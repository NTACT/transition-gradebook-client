import { capitalize } from 'lodash';
import { observable, computed } from 'mobx';
import swal from 'sweetalert2';
import Model from './Model';
import Disability from './Disability';
import getId from '../utils/getId';
import riskUtils from '../utils/riskUtils';

class StudentTermInfo extends Model {
  static sorter(a, b) {
    if(a.sortName === b.sortName) return 0;
    if(a.sortName > b.sortName) return 1;
    return -1;
  }

  // Cross-term student info
  @observable id;
  @observable studentId = '';
  @observable firstName = '';
  @observable lastName = '';
  @observable gender = '';
  @observable birthday = '';
  @observable birthdayString = '';
  @observable disabilities = [];

  @observable gradeType = null;
  @observable exitCategory = '';
  @observable postSchoolOutcome = '';
  @observable postSchoolOutcomeOther = '';

  // Risk factors
  @observable absentPercent = null;
  @observable behaviorMarks = null;
  @observable suspended = null;
  @observable grade = null;
  @observable gradeLevel = null;
  @observable failingEnglish = null;
  @observable failingMath = null;
  @observable failingOther = null;
  @observable onTrack = null;
  @observable retained = null;
  @observable schoolsAttended = null;
  @observable hasExtracurricular = null;

  // Skills
  @observable hasSelfDeterminationSkills = null;
  @observable hasIndependentLivingSkills = null;
  @observable hasTravelSkills = null;
  @observable hasSocialSkills = null;

  // Career dev + IEP
  @observable attendedIepMeeting = null;
  @observable iepRole = null;
  @observable hasGraduationPlan = null;

  @computed get sortName() {
    return `${this.lastName} ${this.firstName}`.toLowerCase();
  }

  @computed get riskData() {
    const { schoolSettings } = this.store;
    if(!schoolSettings) return null;
    return observable(riskUtils.calcTermInfoRiskData(schoolSettings, this));
  }

  @computed get risk() {
    const { riskData } = this;
    if(!riskData) return null;
    return riskData.risk;
  }

  @computed get riskFactorValues() {
    return [
      this.grade,
      this.absentPercent,
      this.behaviorMarks,
      this.suspended,
      this.failingEnglish,
      this.failingMath,
      this.failingOther,
      this.onTrack,
      this.retained,
      this.schoolsAttended,
      this.hasExtracurricular,
    ];
  }

  @computed get skillValues() {
    return [
      this.hasSelfDeterminationSkills,
      this.hasIndependentLivingSkills,
      this.hasTravelSkills,
      this.hasSocialSkills,
    ];
  }

  @computed get careerDevValues() {
    return [
      this.attendedIepMeeting,
      // If student hasn't attended IEP meeting,
      // not selecting a role shouldn't count against complete %
      this.attendedIepMeeting == null
        ? null
        : this.iepRole,
      this.hasGraduationPlan,
    ];
  }

  @computed get riskFactorPercentage() {
    return calcCompletedPercent(this.riskFactorValues);
  }

  @computed get skillPercentage() {
    return calcCompletedPercent(this.skillValues);
  }

  @computed get careerDevPercentage() {
    return calcCompletedPercent(this.careerDevValues);
  }

  @computed get fullName() {
    return `${capitalize(this.firstName)} ${capitalize(this.lastName)}`;
  }

  @computed get lowercaseFullName() {
    return this.fullName.toLowerCase();
  }

  @computed get lowercaseStudentId() {
    return this.studentId.toLowerCase();
  }

  @computed get disabilityIds() {
    const { disabilities } = this;
    return disabilities.map(d => d.id);
  }

  @computed get birthdayDateString() {
    return this.birthdayString.split('T')[0];
  }

  @computed get genderLetter() {
    return this.gender ? this.gender[0].toUpperCase() : '';
  }

  @computed get description() {
    const { disabilities } = this;
    const disabilityString = disabilities && disabilities.length
      ? disabilities.map(d => d.name).join(' ')
      : 'NONE';

    return `${this.genderLetter}, Grade ${this.gradeLevel} ${disabilityString}`;
  }

  // Used to check if the current route references this user
  @computed get locationMatchRegexp() {
    return new RegExp('/\\d+/students/\\w+/' + this.id);
  }

  @computed get isPostSchool() {
    return this.gradeLevel === 'Post-school';
  }

  locationMatches(location) {
    return this.locationMatchRegexp.test(location.pathname);
  }

  getViewRoute(schoolYear) {
    return `/${schoolYear.id}/students/view/${this.id}`;
  }

  getEditRoute(schoolYear) {
    return `/${getId(schoolYear)}/students/edit/${this.id}`;
  }

  getRisksRoute(schoolYear, term=schoolYear.currentTerm) {
    return this.getViewRoute(schoolYear) + '/risks/' + getId(term);
  }

  getCreateActivityRoute(schoolYear, group) {
    return this.getViewRoute(schoolYear) + `/activities/create/${group.id}`;
  }

  getEditActivityRoute(schoolYear, activity) {
    return this.getViewRoute(schoolYear) + `/activities/edit/${activity.id}`;
  }

  searchMatches(search) {
    search = search.toLowerCase();
    return this.lowercaseFullName.match(search) ||
      this.lowercaseStudentId.match(search);
  }

  filterMatches(filter) {
    if(!filter) return true;
    const { riskData } = this;
    const { grades, disabilities, riskLevels, supportNeeded } = filter;
    const { disabilityIds } = this;

    return (
      (!riskLevels.length || riskLevels.includes(this.risk)) &&
      (!grades.length || grades.includes(this.gradeLevel)) &&
      (!disabilities.length || disabilities.some(d => disabilityIds.includes(d.id))) &&
      (!supportNeeded.length || supportNeeded.some(key => riskData.interventions[key]))
    );
  }

  confirmHistoricEdit() {
    return swal({
      title: 'Are you sure?',
      text: `You are about to edit historical data for ${this.fullName}. Are you sure you want to continue?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(result => result.value);
  }

  patch(fields) {
    super.patch(fields);
    const { student } = fields;
    if(student) {
      this.studentTermInfoId = this.id;
      Object.assign(this, student);
      this.birthdayString = this.birthday;
      this.modelFields({
        birthday: Date,
        disabilities: [Disability]
      });
    }
  }
}

// returns the percent of `values` that aren't null
// example: calcCompletedPercent([false, null, 3, 5]) -> 75
function calcCompletedPercent(values) {
  return Math.floor(100 * values.reduce((total, v) => v == null ? total : total + 1, 0) / values.length);
}

export default StudentTermInfo;
