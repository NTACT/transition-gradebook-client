import { observable, computed } from 'mobx';
import Model from './Model';
import StudentTermInfo from './StudentTermInfo';

class Term extends Model {
  @observable studentTermInfos = [];
  @observable startDate = null;

  @computed get students() {
    return this.studentTermInfos.sort(StudentTermInfo.sorter);
  }

  @computed get isInFuture() {
    return this.startDate > new Date();
  }

  patch(fields) {
    super.patch(fields);

    this.modelFields({
      startDate: Date,
      studentTermInfos: [StudentTermInfo],
    });
  }
}

export default Term;