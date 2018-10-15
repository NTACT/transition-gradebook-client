import React from 'react';
import Input from './Input';
import EnumSelect from './EnumSelect';

export default function GradeInput(props) {
  const { gradeType } = props;
  switch(gradeType) {
    case 'percent': return (<PercentGradeInput {...props}/>);
    case 'gpa': return (<GpaGradeInput {...props}/>);
    default: return (<LetterGradeInput {...props}/>);
  }
}

function LetterGradeInput(props) {
  return (<EnumSelect {...props} name="gradeLetters" placeholder="Select a grade letter"/>);
}

function PercentGradeInput(props) {
  return (
    <Input placeholder="Enter a grade percent" {...props} type="number" min="0" max="100" step="0.01"/>
  );
}

function GpaGradeInput(props) {
  return (
    <Input placeholder="Enter a GPA" {...props} type="number" min="0" max="6" step="0.01"/>
  )
}
