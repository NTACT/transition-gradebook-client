import React, { Component } from 'react';
import { observable, computed, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import swal from 'sweetalert2';
import styled from 'styled-components';
import Screen from '../components/Screen';
import Section from '../components/Section';
import Select from '../components/Select';
import Button from '../components/Button';
import SpinnerOverlay from '../components/SpinnerOverlay';

@withRouter
@inject('store')
@observer
class ManageYears extends Component {
  @observable year = '';
  @observable removeStudentData = null; 
  @observable removeSchoolYear = null; 
  @computed get schoolYears() {
    return this.props.store.schoolYears; 
  }

  @action.bound handleYearSelectChange(event) {
    this.year = +event.target.value || '';
  }

  @action.bound async handleDeleteYearSubmit() {
    let {removeStudentData, removeSchoolYear} = this; 
    const{ store } = this.props; 

    const schoolYear = await store.fetchSchoolYear(this.year);

    const confirmResult = await swal({
      title: `Are you sure you want to delete school year ${schoolYear.year} - ${schoolYear.year+1}?`,
      text: `Deleting this school year will permanently delete all of the student data associated .`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    });

    if(!confirmResult.value) return;

    try{
      removeStudentData = store.removeAllStudentsFromYear(schoolYear); 
      await removeStudentData; 
      if(removeStudentData.resolved){
        removeSchoolYear =  store.deleteSchoolYear(schoolYear);
        await removeSchoolYear; 
        if(removeSchoolYear.resolved) {
          await swal(
            'Success',
            `School year ${schoolYear.year} - ${schoolYear.year+1} removed`,
            'success'
          );

        } 
      }
    } catch(e){
      await swal(
        'Error',
        'Something went wrong',
        'error'
      ); 
    }
  }
  render() {
    const {removeStudentData, removeSchoolYear, year} = this; 
    return (
      <Screen>
      <SpinnerOverlay open={(removeStudentData && removeStudentData.pending) && (removeSchoolYear && removeSchoolYear.pending) }/>
      <Main fullWidth>
        <Content>
          <StartFormRoot>
            <Title>Manage School Years</Title>
            <InputLabel>School Year Name</InputLabel>
            <YearSelect value={year} onChange={this.handleYearSelectChange}>
              <option>Select a year</option>
              {this.schoolYears.map(schoolYear =>
                <option key={schoolYear.id} value={schoolYear.id}>{schoolYear.year} - {schoolYear.year + 1}</option>
              )}
            </YearSelect>
            {(year) && <DeleteButton onClick={this.handleDeleteYearSubmit}>Delete </DeleteButton>}
          </StartFormRoot>
        </Content>
      </Main>
    </Screen>
    );
  }
}

export default ManageYears;

const Main = styled(Section)`
  height: 100%;
  background-color: #5B5B5B;
  padding-bottom: 20px;
  overflow: auto;
`;

const Content = styled(Section.Content)`
  margin-top: auto; 
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

const Title = styled.h1`
  color: white;
  width: 100%;
	font-size: 20px;
	font-weight: bold;
	line-height: 27px;
  text-align: center;
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  color: white;
  text-align: left;
  margin-bottom: 7px;
  font-size: 14px;
  font-weight: bold;
  line-height: 19px;
  margin-top: 14px;
`;

const YearSelect = styled(Select).attrs({inverted: true})`
  width: 300px;
`;

const DeleteButton = styled(Button)`
  color: white;
  height: 50px;
  background-color: #D43425;
  width: 50%;
  font-family: "Oswald";
  font-size: 16px;
  line-height: 21px;
  font-weight: 200;
  margin-top: 25px; 
`;

const StartFormRoot = styled.div`
  margin-top: 100px; 
  display: flex;
  flex-direction: column;
  align-items: center;
`;