import React, { Component } from 'react';
import styled from 'styled-components';
import { identity } from 'lodash';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import List from './List';
import Button from './Button';
import * as Icons from './Icons';
import filterChildren from '../utils/filterChildren';
import * as breakpoints from '../breakpoints';

@observer
class ExpandableListItem extends Component {
  @observable expanded = false;

  @action.bound handleToggleExpanded() {
    this.expanded = !this.expanded;
  }

  render() {
    const { expanded } = this;
    const { children, header, childHeight=60 } = this.props;
    const childCount = filterChildren(children, identity).length;
    const disabled = !childCount || this.props.disabled;

    return (
      <Root {...this.props}>
        <Header>
          <ExpandButton disabled={disabled} onClick={disabled ? undefined : this.handleToggleExpanded}>
            <ExpandIcon expanded={!disabled && expanded}/>
          </ExpandButton>
          <HeaderChildren>
            {header}
          </HeaderChildren>
        </Header>
        <ExpandContent childCount={childCount} childHeight={childHeight} expanded={expanded}>
          {children}
        </ExpandContent>
      </Root>
    );
  }
}

export default ExpandableListItem;

ExpandableListItem.Item = styled.li`
  padding: 0 40px 0 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-top: 1px solid #A20B0E;

  @media ${breakpoints.small} {
    padding: 0 20px 0 20px;
  }
`;

const Root = styled.li`
  color: white;
  margin: 0;
  display: flex;
  flex-direction: column;

  &:not(:first-child) {
    border-top: 1px solid #A20B0E;
  }

  &:last-child {
    border-bottom: 1px solid #A20B0E;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #D43425;
  padding: 0 40px 0 40px;
  height: 60px;

  @media ${breakpoints.small} {
    padding: 0 20px 0 20px;
  }
`;

const HeaderChildren = styled.div`
  flex: 1;
  justify-content: space-between;
  display: flex;
  flex-direction: row;
`;

const ExpandContent = styled(List)`
  max-height: ${props => props.expanded ? props.childCount * props.childHeight : 0}px;
  transition: max-height ${props => props.childCount * 0.025}s linear;
  overflow: hidden;
  background-color: white;
  color: black;

  > li {
    height: ${props => props.childHeight}px;
  }
`;

const ExpandButton = styled(Button)`
  margin-right: 34px;
  opacity: ${props => props.disabled ? 0.3 : 1};
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
`;

const ExpandIcon = styled(Icons.CircleArrow)`
  width: 22px;
  height: 22px;
  opacity: 0.3;
  transform: rotate(${props => props.expanded ? 180 : 0}deg);
  transition: transform 0.1s;
`;