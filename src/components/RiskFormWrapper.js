import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import FormRow from './FormRow';
import FormColumn from './FormColumn';
import FormError from './FormError';
import { Rejected } from './Task';
import BlockButton from './BlockButton';
import XButton from './XButton';

@observer
class RiskFormWrapper extends Component {
  render() {
    const { title, student, schoolYear, term, dirty, saveTask, onSubmit, children } = this.props;

    return (
      <Root>
        <Header>
          <Title>{title}</Title>
          <XButton component={Link} to={student.getRisksRoute(schoolYear, term)}/>
        </Header>

        <Rejected task={saveTask}>
          {error => <FormError error={error}/>}
        </Rejected>

        <Form onSubmit={onSubmit}>
          {children}
          <FormRow>
            <FormColumn>
              <SaveButton disabled={!dirty}>SAVE</SaveButton>
            </FormColumn>
            <FormColumn/>
          </FormRow>
        </Form>
      </Root>
    );
  }
};
export default RiskFormWrapper;

const Root = styled.div``;

const Form = styled.form`
  margin-top: 30px;
  padding-bottom: 30px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.div`
  color: #D43425;
  font-family: "Oswald";
  font-size: 16px;
  line-height: 21px;
`;

const SaveButton = styled(BlockButton)`
  margin-top: 18px;
`;
