import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import ReactList from 'react-list';
import { withRouter } from 'react-router-dom';

@withRouter
@observer
class StudentList extends Component {
  constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
  }

  renderItem(index) {
    const { renderItem, students } = this.props;
    if(renderItem) return renderItem(students[index], index);
  }

  render() {
    const { innerRef, itemSizeGetter, listType='uniform' } = this.props;
    return (
      <Root>
        <ReactList
          ref={innerRef}
          itemRenderer={this.renderItem}
          itemSizeGetter={itemSizeGetter}
          length={this.props.students.length}
          type={listType}
        />
      </Root>
    );
  }
};
export default StudentList;

const Root = styled.div`
  flex: 1;
  overflow: auto;
  background-color: white;
`;
