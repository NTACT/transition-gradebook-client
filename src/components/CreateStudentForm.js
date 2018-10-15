import React from 'react';
import EditStudentForm from './EditStudentForm';

export default function CreateStudentForm(props) {
  return (<EditStudentForm {...props} student={null}/>);
}