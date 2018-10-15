import { observable, computed } from 'mobx';
import Model from './Model';
import Disability from './Disability';

class User extends Model {
  @observable firstName = '';
  @observable lastName = '';
  @observable email = '';

  @computed get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  @computed get lowercaseFullName() {
    return this.fullName.toLowerCase();
  }

  @computed get editRoute() {
    return `/Users/${this.id}`;
  }

  locationMatches(location) {
    const { pathname } = location;
    return pathname === this.editRoute || pathname === this.viewRoute;
  }

  patch(fields) {
    super.patch(fields);

    this.modelFields({
      disabilities: [Disability],
    });
  }
}

export default User;