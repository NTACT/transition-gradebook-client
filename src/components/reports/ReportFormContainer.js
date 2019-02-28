import React, { Component, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { observable, action  } from 'mobx';
import { ScaleLoader } from 'react-spinners';
import Title from '../Title';
import Subtitle from '../Subtitle';
import ActionButton from '../ActionButton';
import XButton from '../XButton';
import { Link } from 'react-router-dom';
import { Rejected } from '../Task';
import FormError from '../FormError';
import OpenFiltersButton from '../OpenFiltersButton';
import StudentFilterForm from '../StudentFilterForm';
import * as breakpoints from '../../breakpoints';

function FilterFormContainer(props) {
  const { filtersEnabled, onFiltersSelected } = props;  
  const [shown, setShown] = useState(false);
  return (
    <React.Fragment>
    <FilterButtonContainer filtersEnabled={filtersEnabled}>
      <OpenFiltersButton onClick={() => setShown(true)} /><span>filter</span>
    </FilterButtonContainer>
    {shown && <StyledStudentFilterForm onClose={() => setShown(false)} onSubmit={onSubmit} />}
    </React.Fragment>
  );

  function onSubmit(filters) {
    onFiltersSelected(filters);
    setShown(false);
  }
}

@observer
class ReportFormContainer extends Component {
  @observable filters = {};
  onFiltersSelected = filters => {
    this.filters= filters;
  }

  @action.bound handleSubmit = e => {
    const { onSubmit } = this.props;
    onSubmit(this.filters);
  }
  render () {
    const {
      title,
      subtitle,
      onSubmit,
      closePath,
      canRun,
      submitTask,
      includeFilters = false,
    } = this.props;
    const running = submitTask && submitTask.state === 'pending';

    return (
      <Root>
        <Top>
          <FilterFormContainer filtersEnabled={includeFilters} onFiltersSelected={this.onFiltersSelected} />
          <XButton component={Link} to={closePath || '/Reports'}/>
        </Top>
        <Top>
          <div>
              <Title>{title}</Title>
              <Subtitle>{subtitle}</Subtitle>
          </div>
        </Top>
        <Rejected task={submitTask}>
          {error => <SubmitError error={error}/>}
        </Rejected>
        {this.props.children}
        <ButtonContainer>
          <RunReportButton onClick={this.handleSubmit} disabled={running || !canRun}>
            <LoadingSpinner visible={running}/>
            <RunButtonText running={running}>
              {running
                ? 'Running'
                : 'Run Report'
              }
            </RunButtonText>
          </RunReportButton>
        </ButtonContainer>
      </Root>
    )
  }
}

export default ReportFormContainer;

const Root = styled.div`
  padding: 33px 36px 33px 36px;
  width: 100%;
  max-width: 100vw;
  position: relative;
  height: 100%;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
`;

const RunReportButton = styled(ActionButton)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background-color 0.2s;
  position: relative;

  &:disabled {
    background-color: #d37067;
  }
`;

const RunButtonText = styled.div`
  transform: ${props => props.running ? 'translate(0, -10px) scale(0.8)' : 'translate(0,0) scale(1)'};
  transition: transform 0.2s;
  width: 100%;
  text-align: center;
`;

const LoadingSpinner = styled(({visible, ...rest}) => 
  <div {...rest}><ScaleLoader height={10} color="white"/></div>
)`
  opacity: ${props => props.visible ? 1 : 0};
  position: absolute;
  left: 50%;
  bottom: 3px;
  transform: translate(-50%, 0);
  transition: opacity 0.2s;
`;

const SubmitError = styled(FormError)`
  margin-bottom: 20px;
`;

const FilterButtonContainer = styled.div`
  display: flex;
  visibility: ${props => props.filtersEnabled ? 'visible': 'hidden'};
  color: #D43425;
  font-size: 10px;
  align-items: center;
`

const StyledStudentFilterForm = styled(StudentFilterForm)`
  /* 
    The SaveFilters button is fixed position, so it needs to be targeted
    so its on the right side of the page
  */
  >:nth-last-child(2) {
    @media ${breakpoints.mediumOrSmall} {
      max-width: 100%;
      width: 100%;
    }
    max-width: 100%;
    width: calc(100vw - 457px);
    @media ${breakpoints.large} {
      /* Width of the left navigator + with of the divider*/
      left: 457px;
    }
  }
`;