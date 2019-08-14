import React, { Component } from 'react';
import Button from './Button';
import DayPicker, { DateUtils } from 'react-day-picker/DayPicker';
import 'react-day-picker/lib/style.css';
import styled from 'styled-components';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

@observer
class MultipleDatePicker extends Component {
  @observable show = false

  constructor(props) {
    super(props)
    // TODO: definitely not the best way to do this, how to trigger render with mobx?
    this.state = {
      selectedDays: this.props.value
    }
  }
  
  @action.bound showCalendar = (event) => {
    event.preventDefault()
    this.show = true
  }
  
  @action.bound closeCalendar = (event) => {
    event.preventDefault()
    this.show = false
  }
 
  @action.bound handleDayClick = (day, { selected }) => {
    const { selectedDays } = this.state
    if (selected) {
      const selectedIndex = selectedDays.findIndex(selectedDay => DateUtils.isSameDay(selectedDay, day));
      selectedDays.splice(selectedIndex, 1);
    } else {
      selectedDays.push(day);
    }
    this.setState({selectedDays})
  }

  render() {
    const { className } = this.props
    const { selectedDays } = this.state
    const { showCalendar, closeCalendar, show, handleDayClick } = this

    return (
      <Container>
        <Button className={className} onClick={showCalendar}>
          Add Events to this Activity
        </Button>
        {show &&
          <CalendarItems>
            <DayPicker 
              selectedDays={selectedDays.toJS()} 
              onDayClick={handleDayClick} 
            />
            <DoneButton onClick={closeCalendar}> Done </DoneButton>
          </CalendarItems>
        }
      </Container>
    )
  }
}
export default MultipleDatePicker;

const DoneButton = styled(Button)`
  background-color: #F5633A;
  width: 100%;
  height: 50px;
`

const Container = styled.div`
  position: relative;
`

const CalendarItems = styled.div`
  background-color: white;
  display: block;
  position: absolute;
  bottom: 0;
  left: 80%;
  transform: translateY(100%);
  z-index: 200;
`