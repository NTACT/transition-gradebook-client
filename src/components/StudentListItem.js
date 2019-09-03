import React, { Component } from 'react';
import { action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

const riskColors = {
  'No Data': '#AAA',
  low: '#7AC732',
  medium: '#F8D551',
  high: '#F3A536',
  ultra: '#D43425',
};

const activeStyle = {
  backgroundColor: '#F2F2F2'
};

@withRouter
@inject('store')
@observer
class StudentListItem extends Component {
  @action.bound handleClick(event) {
    const { student, onClick } = this.props;
    if(onClick) onClick(student, event);
  }

  render() {
    const { location, component, student, children, left, hideRisk } = this.props;
    const active = student.locationMatches(location);
    const RootComponent = component ? Root.withComponent(component) : Root;
    const riskLevel = student.risk;
    const riskColor = riskLevel && riskColors[riskLevel];

    return (
      <RootComponent {...this.props} component={null} onClick={null} style={active ? activeStyle : null}>
        {!hideRisk && riskColor && <RiskIcon color={riskColor}/>}
        <Left>
          {left}
        </Left>
        <StudentText onClick={this.handleClick}>
          <StudentName>{student.fullName}</StudentName>
          <StudentInfo>{student.description}</StudentInfo>
        </StudentText>
        {children}
      </RootComponent>
    );
  }
}

export default StudentListItem;

const Root = styled.li`
  position: relative;
  min-height: 70px;
  padding: 0 20px 0 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  text-decoration: none;
  background-color: white;

  &:not(:first-child) {
    border-top: 1px solid #D43425;
  }

  &:last-child {
    border-bottom: 1px solid #D43425;
  }

  &:first-child {
    border-top: 0px solid white;
  }
`;

const StudentText = styled.div`
  margin-top: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: stretch;
  text-decoration: none;
  cursor: pointer;
`;

const StudentName = styled.div`
  font-weight: bold;
  color: #4A4A4A;
  font-size: 16px;
`;

const StudentInfo = styled.div`
	color: #9B9B9B;
  font-size: 12px;
  margin-top: 5px;
`;

const Left = styled.div`
  min-width: 60px;
`;

const RiskIcon = styled.div`
  position: absolute;
  top: 0;
  left: 60px;
  width: 0; 
  height: 0; 
  border-left: 12.5px solid transparent;
  border-right: 12.5px solid transparent;
  border-top: 12.5px solid #f00;
  border-top-color: ${props => props.color};
  transform: scale(1, 0.8);
  transform-origin: top;
`;
