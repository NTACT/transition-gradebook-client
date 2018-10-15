import React, { Component } from 'react';
import { action } from 'mobx';
import { observer, inject } from 'mobx-react';
import Select from './Select';
import getId from '../utils/getId';

@inject('store')
@observer
export default class SchoolYearSelect extends Component {
  @action.bound handleChange(event) {
    const { onChange } = this.props;
    if(onChange) {
      onChange(+event.target.value);
    }
  }

  render() {
    const { value, store, ...rest } = this.props;
    const { schoolYears } = this.props.store;

    return (
      <Select {...rest} value={getId(value)} onChange={this.handleChange}>
        <option value={0}>School Year</option>
        {schoolYears.map(schoolYear =>
          <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.yearRange}</option>
        )}
      </Select>
    );
  }
}
