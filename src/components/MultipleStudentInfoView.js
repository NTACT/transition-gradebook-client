import React, { Component } from 'react';
import styled from 'styled-components'
import { observer, inject } from 'mobx-react';
import * as breakpoints from '../breakpoints'
import { XIcon } from './Icons';
import Button from './Button';

@inject('store')
@observer
class MultipleStudentInfoView extends Component {

  SelectedStudent = ({ id, name }) => {
    const { handleStudentRemove } = this.props
    return (
      <SelectedStudentItem>
        <Button onClick={() => handleStudentRemove(id)} >
          <RemoveIcon />
        </Button>
        <SelectedStudentText>{name}</SelectedStudentText>
      </SelectedStudentItem>
    )
  }

  render() {
    const { selectedStudents } = this.props
    const { SelectedStudent } = this

    const numberSelected = `${selectedStudents.length} Students Selected`
    return (
      <Root>
        <Main>
          <Header>
            <SelectedHeader>
              <StudentsSelected>{numberSelected}</StudentsSelected>
              <StudentsSelectedSubtitle>
                You will be adding an activity to multiple students.
              </StudentsSelectedSubtitle>
              <SelectedStudentRow>
                {selectedStudents.map((s, key) => <SelectedStudent key={key} name={s.fullName} id={s.id} />)}
              </SelectedStudentRow>
            </SelectedHeader>
          </Header>
        </Main>
      </Root>
    )
  }
}
export default MultipleStudentInfoView;

const SelectedStudentItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`

const SelectedStudentText = styled.div`
  font-size: 12px;
  font-family: 'Open Sans';
  font-weight: bold;
  color: #555555;
`

const SelectedStudentRow = styled.div`
  display: flex;
  flex-direction: row;
`

// Found these filters throught this codepen: https://codepen.io/sosuke/pen/Pjoqqp
const RemoveIcon = styled(XIcon)`
  margin-right: 4px;
  filter: invert(98%) sepia(2%) saturate(1959%) hue-rotate(188deg) brightness(116%) contrast(69%);
  cursor: pointer;
  &:hover {
    filter: invert(47%) sepia(50%) saturate(2353%) hue-rotate(338deg) brightness(99%) contrast(94%);
  }
`

const StudentsSelectedSubtitle = styled.div`
  font-size: 12px;
  margin-bottom: 13px;
`

const StudentsSelected = styled.div`
  font-size: 22px;
  font-weight: bold;
`

const SelectedHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 30px 30px 11px 30px;
  color: #4A4A4A
`

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  max-height: 75px;
  min-height: 75px;
  margin 9px 30px 9px 0;
  justify-content: space-between;

  @media ${breakpoints.small} {
    max-height: none;
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 0;
    margin-right: 0;
  }
`

const Main = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-start;
`

const Root = styled.div`
  display: flex;
  flex: 1;
  background-color: #F0F0F0
  max-width: 100vew;
`