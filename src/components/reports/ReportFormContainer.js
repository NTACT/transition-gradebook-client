import React, { Component } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { ScaleLoader } from 'react-spinners';
import Title from '../Title';
import Subtitle from '../Subtitle';
import ActionButton from '../ActionButton';
import XButton from '../XButton';
import { Link } from 'react-router-dom';
import { Rejected } from '../Task';
import FormError from '../FormError';

@observer
export default class ReportFormContainer extends Component {
  render () {
    const {
      title,
      subtitle,
      onSubmit,
      closePath,
      canRun,
      submitTask,
    } = this.props;
    const running = submitTask && submitTask.state === 'pending';

    return (
      <Root>
        <Top>
          <div>
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
          </div>
          <XButton component={Link} to={closePath || '/Reports'}/>
        </Top>
        <Rejected task={submitTask}>
          {error => <SubmitError error={error}/>}
        </Rejected>
        {this.props.children}
        <ButtonContainer>
          <RunReportButton onClick={onSubmit} disabled={running || !canRun}>
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

const Root = styled.div`
  padding: 33px 36px 33px 36px;
  width: 100%;
  max-width: 100vw;
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
