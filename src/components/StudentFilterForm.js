import React, { Component } from 'react';
import styled from 'styled-components';
import { observable, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import capitalize from 'lodash/capitalize';
import Button from './Button';
import Checkbox from './Checkbox';
import toggleArrayValue from '../utils/toggleArrayValue';
import * as Icons from './Icons';
import enums from '../enums';
import * as breakpoints from '../breakpoints';

@inject('store')
@observer
class StudentFilterForm extends Component {
  @observable selectedGrades = (this.props.filter && this.props.filter.grades.slice()) || [];
  @observable selectedDisabilities =  (this.props.filter && this.props.filter.disabilities.slice()) || [];
  @observable selectedRiskLevels = (this.props.filter && this.props.filter.riskLevels.slice()) || [];
  @observable selectedSupportNeeded = (this.props.filter && this.props.filter.supportNeeded.slice()) || [];
  @observable selectedRaces = (this.props.filter && this.props.filter.races.slice()) || [];

  @action.bound handleGradeToggle(grade) {
    toggleArrayValue(this.selectedGrades, grade);
  }

  @action.bound handleGradeHeaderClick() {
    if(this.selectedGrades.length === enums.grades.length) {
      this.selectedGrades = [];
    } else {
      this.selectedGrades = enums.grades.slice();
    }
  }

  @action.bound handleRiskLevelToggle(riskLevel) {
    toggleArrayValue(this.selectedRiskLevels, riskLevel);
  }

  @action.bound handleRiskLevelHeaderClick() {
    if(this.selectedRiskLevels.length === enums.riskLevels.length) {
      this.selectedRiskLevels = [];
    } else {
      this.selectedRiskLevels = enums.riskLevels.slice();
    }
  }

  @action.bound handleDisabilityToggle(disability) {
    toggleArrayValue(this.selectedDisabilities, disability);
  }

  @action.bound handleDisabilityHeaderClick() {
    const { disabilities } = this.props.store;
    if(this.selectedDisabilities.length === disabilities.length) {
      this.selectedDisabilities = [];
    } else {
      this.selectedDisabilities = disabilities.slice();
    }
  }

  @action.bound handleSupportNeededToggle(supportNeeded) {
    toggleArrayValue(this.selectedSupportNeeded, supportNeeded);
  }

  @action.bound handleRaceToggle(race) {
    toggleArrayValue(this.selectedRaces, race);
  }

  @action.bound handleSupportNeededHeaderClick() {
    if(this.selectedSupportNeeded.length === enums.supportNeeded.length) {
      this.selectedSupportNeeded = [];
    } else {
      this.selectedSupportNeeded = enums.supportNeeded.slice();
    }
  }

  @action.bound handleRaceHeaderClick() {
    if(this.selectedRaces.length === enums.races.length) {
      this.selectedRaces = [];
    } else {
      this.selectedRaces = enums.supportNeeded.slice();
    }
  }

  @action.bound handleClearClick() {
    this.selectedGrades = [];
    this.selectedDisabilities = [];
    this.selectedRiskLevels = [];
    this.selectedSupportNeeded = [];
    this.selectedRaces = [];
  }

  @action.bound handleSubmitClick() {
    const { onSubmit } = this.props;
    if(onSubmit) {
      const { selectedGrades, selectedDisabilities, selectedRiskLevels, selectedSupportNeeded, selectedRaces } = this;
      if(
        !selectedGrades.length &&
        !selectedDisabilities.length &&
        !selectedRiskLevels.length &&
        !selectedSupportNeeded.length &&
        !selectedRaces.length
      ) {
        onSubmit(null);
      } else {
        onSubmit({
          grades: selectedGrades.slice(),
          disabilities: selectedDisabilities.slice(),
          riskLevels: selectedRiskLevels.slice(),
          supportNeeded: selectedSupportNeeded.slice(),
          races: selectedRaces.slice(),
        });
      }
    }
  }

  render() {
    const { disabilities } = this.props.store;
    const { onClose, ...rest } = this.props;
    const { selectedDisabilities, selectedGrades, selectedRiskLevels, selectedSupportNeeded, selectedRaces } = this;

    return (
      <Root {...rest}>

        <Header>
          <ClearButton onClick={this.handleClearClick}>clear filters</ClearButton>
          <Title>FILTER STUDENTS</Title>
          <CloseButton onClick={onClose}>
            <CloseIcon/>
          </CloseButton>
        </Header>

        <Checkboxes>
          <CheckboxRow>
            <CheckboxColumn>
              <CheckboxColumnHeader onClick={this.handleGradeHeaderClick}>Grade</CheckboxColumnHeader>
              {enums.grades.slice(0,7).map(grade =>
                <FilterCheckbox
                  key={grade}
                  label={grade}
                  checked={selectedGrades.includes(grade)}
                  onChange={this.handleGradeToggle.bind(null, grade)}
                />
              )}
            </CheckboxColumn>
            <CheckboxColumn>
              {enums.grades.slice(7).map(grade =>
                <FilterCheckbox
                  key={grade}
                  label={grade}
                  checked={selectedGrades.includes(grade)}
                  onChange={this.handleGradeToggle.bind(null, grade)}
                />
              )}
            </CheckboxColumn>
          </CheckboxRow>
          <CheckboxRow>
            <CheckboxColumn>
              <CheckboxColumnHeader onClick={this.handleDisabilityHeaderClick}>Category</CheckboxColumnHeader>
              {disabilities.slice(0, 6).map(disability =>
                <FilterCheckbox
                  key={disability.id}
                  label={disability.name}
                  checked={selectedDisabilities.includes(disability)}
                  onChange={this.handleDisabilityToggle.bind(null, disability)}
                />
              )}
            </CheckboxColumn>
            <CheckboxColumn>
              {disabilities.slice(6).map(disability =>
                <FilterCheckbox
                  key={disability.id}
                  label={disability.name}
                  checked={selectedDisabilities.includes(disability)}
                  onChange={this.handleDisabilityToggle.bind(null, disability)}
                />
              )}
            </CheckboxColumn>
          </CheckboxRow>

          <CheckboxColumn>
              <CheckboxColumnHeader onClick={this.handleRiskLevelHeaderClick}>Risk Level</CheckboxColumnHeader>
              {enums.riskLevels.map(riskLevel =>
                <FilterCheckbox
                  key={riskLevel}
                  label={capitalize(riskLevel)}
                  checked={selectedRiskLevels.includes(riskLevel)}
                  onChange={this.handleRiskLevelToggle.bind(null, riskLevel)}
                />  
              )}
          </CheckboxColumn>

          <CheckboxColumn>
            <CheckboxColumnHeader onClick={this.handleSupportNeededHeaderClick}>Intervention</CheckboxColumnHeader>
            {enums.supportNeeded.map(supportType =>
              <FilterCheckbox
                key={supportType}
                label={capitalize(supportType)}
                checked={selectedSupportNeeded.includes(supportType)}
                onChange={this.handleSupportNeededToggle.bind(null, supportType)}
              />  
            )}
          </CheckboxColumn>

          <CheckboxColumn>
            <CheckboxColumnHeader onClick={this.handleRaceHeaderClick}>Race</CheckboxColumnHeader>
            {enums.races.map(race =>
              <FilterCheckbox
                key={race}
                label={enums.raceLabels[race]}
                checked={selectedRaces.includes(race)}
                onChange={this.handleRaceToggle.bind(null, race)}
              />  
            )}
          </CheckboxColumn>
        </Checkboxes>

        <Spacer/>
        <SaveButton onClick={this.handleSubmitClick}>SAVE FILTERS</SaveButton>
        <SaveButtonPlaceholder/>
      </Root>
    );
  }
}

export default StudentFilterForm;

const Root = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(74, 74, 74, 0.95);
  z-index: 10;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  height: 80px;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px 0 40px;
  flex-shrink: 0;
`;

const Title = styled.div`
  color: white;
  font-family: "Oswald";
  font-size: 16px;
`;

const SaveButton = styled(Button)`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  max-width: 450px;
  height: 50px;
  color: white;
  font-family: "Oswald";
  font-size: 16px;
  background-color: #F5633A;
  flex-shrink: 0;

  @media ${breakpoints.mediumOrSmall} {
    max-width: 100%;
  }
`;

const SaveButtonPlaceholder = styled.div`
  width: 100%;
  height: 50px;
  flex-shrink: 0;
`;

const Spacer = styled.div`
  flex: 1 1 auto;
  min-height: 20px;
`;

const CloseButton = styled(Button)`
  width: 80px;
  text-align: right;
`;

const CloseIcon = styled(Icons.X)`
  width: 22px;
  height: 22px;
`;

const ClearButton = styled(Button)`
  color: black;
  font-size: 12px;
  text-decoration: underline;
  width: 80px;
`;

const Checkboxes = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 40px 0 40px;
  flex-shrink: 0;
`;

const FilterCheckbox = styled(Checkbox).attrs({
  checkboxColor:'black', 
  labelColor:'white',
})`
  & + & {
    margin-top: 12px;
  }
`;

const CheckboxColumn = styled.div`
  display: flex;
  flex-direction: column;
  overflow: visible;
  flex: 1 1 100%;

  * + & {
    margin-top: 15px;
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  flex-direction: row;
  * + & {
    margin-top: 15px;
  }
  height: 100%;
`;

const CheckboxColumnHeader = styled.div`
	color: #F5633A;
	font-size: 14px;
  font-weight: bold;
  margin-bottom: 7px;
  height: 20px;
  cursor: pointer;
`;