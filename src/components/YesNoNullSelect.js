import React, { Component } from 'react';
import Select from './Select';

const YES_VALUE = 'YES';
const NO_VALUE = 'NO';
const NULL_VALUE = 'NULL';

export default class YesNoNullSelect extends Component {
  handleChange = event => {
    const { onChange } = this.props;
    if(onChange) onChange(event.target.value === YES_VALUE);
  };

  render() {
    const { value } = this.props;
    const selectValue = value == null 
      ? NULL_VALUE
      : (value ? YES_VALUE : NO_VALUE);

    return (
      <Select {...this.props} value={selectValue} onChange={this.handleChange}>
        <option value={NULL_VALUE} disabled>Choose yes/no</option>
        <option value={YES_VALUE}>Yes</option>
        <option value={NO_VALUE}>No</option>
      </Select>
    );
  }
}
