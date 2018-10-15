import Model from './Model';
import { observable } from 'mobx';

class SchoolSettings extends Model {
  @observable name = '';
  @observable gradeConversions = [];
}

export default SchoolSettings;
