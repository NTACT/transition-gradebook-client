import { observable } from 'mobx';
import Model from './Model';
import ActivityType from './ActivityType';
import ActivityEvent from './ActivityEvent';

class Activity extends Model {
  @observable events = [];
  @observable activityType = null;
  @observable frequency = null;

  patch(fields) {
    super.patch(fields);
    this.modelFields({
      activityType: ActivityType,
      events: [ActivityEvent],
    });
  }
}

export default Activity;