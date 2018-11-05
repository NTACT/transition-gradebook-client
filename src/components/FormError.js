import React from 'react';
import styled from 'styled-components';
import { startCase } from 'lodash';

const betterDescriptions = {
  'should be string': 'is required',
  'should be boolean': 'is required',
  'should be integer': 'is required',
  'should be equal to one of the allowed values': 'is required',
};

function formatErrorMessage(message) {
  if(!message) return 'Unknown error.';
  if(betterDescriptions[message]) return betterDescriptions[message];
  if(/should have required property/.test(message)) return 'is required';
  return message;
}

// Just a message
function SimpleError(props) {
  const { message, ...rest } = props;
  return (<Root {...rest}>{message}</Root>)
}

// Multiple errors by field
function DataError(props) {
  const { data, keyNames, ...rest }  = props;
  return (
    <Root {...rest}>
      <ErrorList>
        {Object.entries(data).map(([field, errors]) => {
          const message = errors[0].message;
          const formName = keyNames[field] || startCase(field);
          return (
            <ErrorListItem key={field}>
              <b>{formName}</b> {formatErrorMessage(message)}
            </ErrorListItem>
          );
        })}
      </ErrorList>
    </Root>
  );
}

export default function FormError(props) {
  const { error, keyNames={}, ...rest } = props;

  if(!error.response) {
    return (<SimpleError message={error.message} {...rest}/>);
  }

  if(error.response.data.error && error.response.data.error.data) {
    return (<DataError data={error.response.data.error.data} keyNames={keyNames} {...rest}/>);
  } else if (error.response && error.response.data && error.response.data.error) {
    return (<SimpleError message={error.response.data.error.message} {...rest}/>);
  } else {
    return (<SimpleError message={error.message} {...rest}/>)
  }
}

const Root = styled.div`
  background-color: #FECCCD;
  border: 1px solid #AD2D2F;
  border-radius: 3px;
  padding: 20px;
`;

const ErrorList = styled.ul`
  margin: 0;
  padding-left: 20px;
  list-style: none;
`;

const ErrorListItem = styled.li``;
