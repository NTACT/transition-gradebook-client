import Model from './Model';
import ActivityType from './ActivityType';

class ActivityTypeGroup extends Model {
  patch(fields) {
    super.patch(fields);

    this.modelFields({
      activityTypes: [ActivityType],
    });
  }
}

export default ActivityTypeGroup;