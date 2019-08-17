import React, { Component } from 'react';
import Button from './Button';
import DayPicker from 'react-day-picker/DayPicker';
import 'react-day-picker/lib/style.css';
import styled from 'styled-components';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { Calendar } from './Icons';
import Tooltip from './Tooltip';

@observer
class MultipleDatePicker extends Component {
  @observable show = false
  @observable current = new Date()

  @action.bound handleMonthYearChange(e) {
    const { year, month } = e.target.form
    this.current = new Date(year.value, month.value)
  }

  YearMonthForm = ({ date, localeUtils }) => {
    const { handleMonthYearChange } = this
    const currentYear = new Date().getFullYear()
    const fromMonth = new Date(currentYear - 1, 0)
    const toMonth = new Date(currentYear + 5, 11)

    const months = localeUtils.getMonths()
    const years = []
    for (let i = fromMonth.getFullYear(); i <= toMonth.getFullYear(); i += 1) {
      years.push(i)
    }

    return (
      <div className="DayPicker-Caption">
        <select name="month" onChange={handleMonthYearChange} value={date.getMonth()}>
          {months.map((month, i) => (
            <option key={month} value={i}>
              {month}
            </option>
          ))}
        </select>
        <select name="year" onChange={handleMonthYearChange} value={date.getFullYear()}>
          {years.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    )
  }

  @action.bound renderDay(day) {
    const { value } = this.props
    const date = day.getDate()
    const [first] = value
    const Date = () => 
      value.length === 1 && first.getTime() === day.getTime() ? <Tooltip text={"Select an additional occurrence or click done."}>{date}</Tooltip> : date

    return <Date />
  }

  @action.bound showCalendar(event) {
    event.preventDefault()
    this.show = true
  }

  @action.bound closeCalendar(event) {
    event.preventDefault()
    this.show = false
  }

  render() {
    const { className, value, handleDayClick } = this.props
    const {
      showCalendar,
      closeCalendar,
      show,
      YearMonthForm,
      current,
      renderDay
    } = this

    const daysSelected = value.length
    const CalendarText = () =>
      daysSelected === 0 ? <NoDateText> Add New Events to this Activity </NoDateText> : <DateSelectedText>{`${daysSelected} days selected`}</DateSelectedText>

    return (
      <Container>
        <Button onClick={showCalendar}>
          <div className={className}>
            <CalendarText />
            <CalendarIcon />
          </div>
        </Button>
        {show &&
          <CalendarItems>
            <DayPicker
              month={current}
              selectedDays={value.toJS()}
              onDayClick={handleDayClick}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              renderDay={renderDay}
              fixedWeeks
              captionElement={({ date, localeUtils }) =>
                <YearMonthForm date={date} localeUtils={localeUtils} />
              }
            />
            <DoneButton onClick={closeCalendar}> DONE </DoneButton>
          </CalendarItems>
        }
      </Container>
    )
  }
}
export default MultipleDatePicker;

const NoDateText = styled.div`
  font-style: italic;
`

const DateSelectedText = styled.div`
  font-weight: bold;
`

const modifiers = {
  weekends: {
    daysOfWeek: [0, 6]
  }
}

const modifiersStyles = {
  weekends: {
    color: 'red',
  }
}

const CalendarIcon = styled(Calendar)`
  margin-left: 24px;
`

const Container = styled.div`
  position: relative;
`

const DoneButton = styled(Button)`
  background-color: #F5633A;
  color: white;
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-family: 'Oswald';
  line-height: 24px;
`

const CalendarItems = styled.div`
  border: 1px solid #E8E8E8;
  box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.1);
  background-color: white;
  display: block;
  position: absolute;
  bottom: 0;
  left: 80%;
  transform: translateY(100%);
  z-index: 200;
`