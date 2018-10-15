import React from 'react';
import styled from 'styled-components';
import Screen from '../components/Screen';

export default function About() {
  return (
    <Root>
      <Main>
        <h2>NTACT</h2>
        <p>The Transition Gradebook was developed by the National Technical Assistance Center on Transition (NTACT).  NTACT is a Technical Assistance and Dissemination project, funded by the U.S. Department of Education’s Office of Special Education Programs (OSEP) and the Rehabilitation Services Administration (RSA), Cooperative Agreement Number H326E140004. NTACT is funded from January 1, 2015 until December 31, 2019. Dr. Selete Avoke serves as the project officer from OSEP.  Ms. Kristen Rhinehart-Fernandez serves as the project officer from RSA.</p>
        
        <h2>NTACT purpose</h2>
        <p>NTACT’s purpose is to assist State Education Agencies, Local Education Agencies, State VR agencies, and VR service providers in implementing evidence-based and promising practices ensuring students with disabilities, including those with significant disabilities, graduate prepared for success in postsecondary education and employment.</p>
        <p>Visit NTACT website: <a href="https://www.transitionta.org/" target="_blank" rel="noopener noreferrer">www.transitionta.org</a></p>

        <h2>Transition Gradebook</h2>
        <p>The Transition Gradebook came about because of a state’s request for a tool that would let them track, organize and report the transition-related activities their schools were providing for students in special education. Development of the current version of the Transition Gradebook ensued when earlier spreadsheet-based versions of the tool became too complex to use and maintain while remaining in a pleasant humor. </p>

        <h3>Questions about Transition Gradebook?</h3>
        <p>Email us: <a href="mailto:admin@transitiongradebook.com">admin@transitiongradebook.com</a></p>
        <div style={{flex: 1}}>{/* Keeps the footer at the bottom */}</div>
        <Footer>
          <NTACTLogo/>
        </Footer>
      </Main>
    </Root>
  );
}

const Root = styled(Screen)`
  display: flex;
  flex-direction: column;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  width: 100%;
  background-color: #5B5B5B;
  color: white;
  flex: 1;

  > h2,
  > h3,
  > p {
    width: 460px;
    max-width: calc(100% - 30px);
    margin-left: 15px;
    margin-right: 15px;
  }

  h2 {
    color: #F5633A;
    font-size: 16px;
    font-weight: bold;
    line-height: 22px;
  }

  h3 {
    font-size: 16px;
    font-weight: bold;
    line-height: 22px;
  }

  p {
    font-size: 14px;
    line-height: 20px;
  }

  * + h2 {
    margin-top: 35px;
  }
`;

const Footer = styled.div`
  margin-top: 15px;
  width: 100%;
  background-color: white;
  padding: 15px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  min-height: 102px;
  max-height: 102px;
  flex: 1;
  overflow: hidden;
`;

const NTACTLogo = styled.img.attrs({src: require('../assets/ntact_logo.png')})`
  width: 294px;
  height: 63px;
`;
