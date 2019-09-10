import React, { Component } from 'react';
import { observer } from 'mobx-react';
import Select from './Select';
import getId from '../utils/getId';

@observer
class TermSelect extends Component {
  render() {
    const { schoolYear, value, ...rest } = this.props;

    return (
      <Select {...rest} value={(schoolYear && getId(value)) || null}>
        {schoolYear && schoolYear.sortedTerms.map(term =>
          <option
            key={term.id}
            value={term.id}
          >
            {schoolYear.capitalizedTermType} {term.index + 1}
          </option>
        )}
      </Select>
    );
  }
};
export default TermSelect;
