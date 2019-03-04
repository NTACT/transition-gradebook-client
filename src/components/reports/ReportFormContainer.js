import React, { Component, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { observable, action, computed  } from 'mobx';
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
import Row from '../Row';

@observer
class ReportFormContainer extends Component {
  @observable filters = null;
  onFiltersSelected = filters => {
    this.filters = filters ;
  }

  @action.bound handleSubmit = e => {
    const { onSubmit } = this.props;
    onSubmit(this.filters);
  }

  @computed get activeFilterList() {
    return this.props.includeFilters  && this.filters ? Object.keys(this.filters) : [];
  }

  renderActiveFiltersList() {
    const { activeFilterList, filters } = this;
    if (activeFilterList.length <= 0) {
      return null;
    }
    return (
      <Filters>
        ( {/* opening paren, keep */}
        <ActiveFilterLabel>filters:</ActiveFilterLabel>{activeFilterList
          .filter(filter => filters[filter].length > 0)
          .map(filter => {
            //Change labels as needed
            const filterLowercase = filter.toLowerCase();
            if (filterLowercase === 'risklevels') {
              return 'risk level';
            } else if (filterLowercase === 'supportneeded') {
              return 'intervention';
            } else if (filterLowercase === 'disabilities') {
              return 'category';
            } else {
              return filterLowercase
            }
          })
          .join(', ')}
        ) {/* closing paren, keep */}
      </Filters>
    );
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
      titleActiveFilter = title
    } = this.props;
    const running = submitTask && submitTask.state === 'pending';
    const { activeFilterList, filters } = this;

    return (
      <Root>
        <Top>
          <FilterFormContainer filtersEnabled={includeFilters} onFiltersSelected={this.onFiltersSelected} filters={filters} />
          <XButton component={Link} to={closePath || '/Reports'}/>
        </Top>
        <Top>
          <div>
              <TitleRow>
                <Title>
                  {activeFilterList.length > 0 ? titleActiveFilter : title}
                </Title>
                {this.renderActiveFiltersList()}
              </TitleRow>
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

const TitleRow = styled(Row)`
  align-items: center;
`;

const Filters = styled(Subtitle)`
  display: flex;
  padding-left: 10px;
`;

const ActiveFilterLabel = styled(Filters)`
  font-weight: bold;
  padding-right: 2px;
  padding-left: 0;
`;

function FilterFormContainer(props) {
  const { filtersEnabled, onFiltersSelected, filters } = props;
  const [shown, setShown] = useState(false);
  return (
    <React.Fragment>
      <FilterButtonContainer filtersEnabled={filtersEnabled}>
        <OpenFiltersButton onClick={() => setShown(true)} /><span>filter</span>
      </FilterButtonContainer>
      {shown && <StyledStudentFilterForm onClose={() => setShown(false)} onSubmit={onSubmit} filter={filters} />}
    </React.Fragment>
  );

  function onSubmit(filters) {
    onFiltersSelected(filters);
    setShown(false);
  }
}