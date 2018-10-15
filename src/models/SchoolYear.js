import { observable, computed } from 'mobx';
import { capitalize } from 'lodash';
import Model from './Model';
import Term from './Term';

class SchoolYear extends Model {
  @observable year = 0;
  @observable studentsLoaded = false; // Set in store#fetchSchoolYear

  @computed get yearRange() {
    return `${this.year}-${this.year + 1}`;
  }

  @computed get sortedTerms() {
    return this.terms.sort((a, b) => a.index - b.index);
  }

  @computed get listOfTerms() {
    return this.sortedTerms
      .map((term, index) => ({id: term.id, label: `${this.capitalizedTermType} ${index+1}`}));
  }

  @computed get capitalizedTermType() {
    return capitalize(this.termType);
  }

  @computed get students() {
    const { currentTerm } = this;
    return currentTerm ? currentTerm.students : [];
  }

  @computed get termIndexPrefix() {
    return this.termType[0].toUpperCase();
  }

  // Pick the latest term that started before the current date
  // If none is found, returns the first term
  @computed get currentTerm() {
    const terms = this.sortedTerms;
    const { length } = terms;

    if(length === 1) return terms[0];
    const now = new Date();
    
    for(let i = 0; i < length; i++) {
      const term = terms[i];
      const nextTerm = terms[i + 1];

      if(term.startDate < now && (!nextTerm || nextTerm.startDate > now)) {
        return term;
      }
    }

    return terms[0];
  }

  patch(fields) {
    super.patch(fields);

    this.modelFields({
      terms: [Term],
    });
  }
}

export default SchoolYear;