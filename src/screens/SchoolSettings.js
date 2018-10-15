import React, { Component } from 'react';
import styled from 'styled-components';
import { observable, action, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import swal from 'sweetalert2';
import Screen from '../components/Screen';
import Section from '../components/Section';
import Label from '../components/Label';
import Input from '../components/Input';
import BlockButton from '../components/BlockButton';
import FormError from '../components/FormError';
import { Rejected } from '../components/Task';
import splitArray from '../utils/splitArray';
import responsive from '../utils/responsive';
import * as breakpoints from '../breakpoints';

@responsive
@inject('store')
@observer
class SchoolSettings extends Component {
  @observable name = '';
  @observable gradeConversions = [];
  @observable saveTask = null;
  @observable dirty = false;

  @computed get gradeConversionColumns() {
    const { breakpoints } = this.props;
    const { gradeConversions } = this;
    return breakpoints.small 
      ? [gradeConversions]
      : splitArray(gradeConversions);
  }

  constructor(props) {
    super(props);
    const { schoolSettings } = props.store;
    this.name = schoolSettings.name;
    this.gradeConversions = schoolSettings.gradeConversions.map(g => ({...g}));
  }

  @action.bound handleNameChange(event) {
    this.dirty = true;
    this.name = event.target.value;
  }

  @action.bound handleGradeConversionChange(gradeConversion, key, value) {
    this.dirty = true;
    gradeConversion[key] = value;
  }

  @action.bound async handleSubmit(event) {
    event.preventDefault();
    const { store } = this.props;
    const { name, gradeConversions } = this;
    this.saveTask = store.editSchoolSettings({name, gradeConversions});
    await this.saveTask;
    await swal('Success', 'School settings saved successfully', 'success');
  }

  @action.bound handleClearClick(event) {
    event.preventDefault();
    this.dirty = true;
    this.gradeConversions.forEach(gradeConversion => {
      gradeConversion.percent = '';
      gradeConversion.letter = '';
    });
    return false;
  }

  render() {
    const { name, gradeConversionColumns, dirty, saveTask } = this;

    return (
      <Root>
        <Main>
          <Title>School Settings</Title>

          <Rejected task={saveTask}>
            {error => <ErrorMessages error={error}/>}
          </Rejected>

          <Form onSubmit={this.handleSubmit}>
            <Label>School Name</Label>
            <SchoolNameInput value={name} onChange={this.handleNameChange}/>
            <ConversionTitle>GPA Converter</ConversionTitle>
            <ConversionInstructions>
              How do you want Transition Gradebook to compute GPAs?
              Enter letter grade or percent grade information below.
            </ConversionInstructions>
            <Conversions>
              {gradeConversionColumns.map((gradeConversions, i) =>
                <ConversionColumn key={i}>
                  <ConversionColumnHeaders>
                    <Label>Percent</Label>
                    <Label>Letter</Label>
                    <Label>GPA</Label>
                  </ConversionColumnHeaders>
                  {gradeConversions.map((gradeConversion, j) =>
                    <ConversionRow
                      key={j}
                      gradeConversion={gradeConversion}
                      onChange={this.handleGradeConversionChange}
                    />
                  )}
                </ConversionColumn>
              )}
            </Conversions>

            <ButtonRow>
              <SaveButton disabled={!dirty}>SAVE</SaveButton>
              <ClearButton onClick={this.handleClearClick}>CLEAR ALL</ClearButton>
            </ButtonRow>
          </Form>
        </Main>
      </Root>
    );
  }
}

export default SchoolSettings;

const Root = styled(Screen)``;

const Main = styled(Section)`
  background-color: #5B5B5B;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  padding: 24px;
`;

const Title = styled.h1`
	font-size: 20px;
	font-weight: bold;
  line-height: 27px;
  text-align: center;
  margin: 0 24px 24px 24px;
  color: white;
`;

const ErrorMessages = styled(FormError)`
  max-height: 200px;
  overflow: auto;
  margin-bottom: 20px;
`;

const Form = styled.form`
  max-width: 513px;
  width: 100%;
  color: white;
`;

const StyledInput = styled(Input)`
  background-color: #4A4A4A;
  color: white;
`;

const SchoolNameInput = styled(StyledInput).attrs({
  placeholder: 'Type school name here',
})`
  width: 100%;
`;

const PercentInput = styled(StyledInput).attrs({type: 'number', min: 0, max: 100})``;

const LetterInput = styled(StyledInput).attrs({type: 'text'})``;

const GpaInput = styled(StyledInput).attrs({disabled: true})`
  color: #CCC;
`;

const ConversionTitle = styled.h2`
  font-size: 14px;
  font-weight: bold;
  line-height: 19px;
  margin: 30px 0 10px 0;
`;

const ConversionInstructions = styled.p`
	font-size: 14px;
  line-height: 19px;
  margin: 0 0 12px;
`;

const Conversions = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const ConversionColumn = styled.div`
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;

  & + & {
    margin-left: 53px;
  }
`;

const ConversionColumnHeaders = styled.div`
  display: flex;
  flex-direction: row;

  > label {
    width: 60px;
    color: #F5633A;
    font-size: 14px;
    font-weight: bold;
    line-height: 19px;
    margin-bottom: 3px;

    @media ${breakpoints.small} {
      width: 33.3%;
      text-align: center;
    }
  }

  > label + label {
    margin-left: 22px;
  }
`;

const ConversionRow = styled(observer(props => {
  const { gradeConversion, onChange, ...rest } = props;
  const { letter, gpa, percent } = gradeConversion;

  return (
    <div {...rest}>
      <PercentInput
        value={percent}
        onChange={event => onChange(gradeConversion, 'percent', +event.target.value)}
      />
      <LetterInput
        value={letter}
        onChange={event => onChange(gradeConversion, 'letter', event.target.value)}
      />
      <GpaInput value={gpa}/>
    </div>
  );
}))`
  display: flex;
  flex-direction: row;
  width: 100%;

  input { 
    width: 60px;
    padding: 0;
    text-align: center;
    @media ${breakpoints.small} {
      width: 33.3%;
    }
  }

  > * + * {
    margin-left: 22px;
  }

  & + & {
    margin-top: 6px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-top: 33px;
  width: 100%;

  > button {
    flex: 1;
  }
`;

const SaveButton = BlockButton;

const ClearButton = styled(BlockButton).attrs({
  color: '#9B9B9B',
  hoverColor: '#757575',
})`
  max-width: 110px;
  margin-left: 23px;
`;
