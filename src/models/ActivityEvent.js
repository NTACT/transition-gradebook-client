import { observable } from 'mobx';
import Model from './Model';

class ActivityEvent extends Model {
  @observable eventTime;

  patch(fields) {
    super.patch(fields);
    this.modelFields({
      eventTime: Date
    });
  }
}

export default ActivityEvent;