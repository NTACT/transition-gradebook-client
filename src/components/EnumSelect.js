import React from 'react';
import Select from './Select';
import enums from '../enums';

export default function EnumSelect(props) {
  const { name, inputName, format, ...rest } = props;
  const values = enums[name];

  return (
    <Select {...rest} name={inputName}>
      {values.map(value =>
        <option key={value} value={value}>{format ? format(value) : value}</option>
      )}
    </Select>
  );
}
