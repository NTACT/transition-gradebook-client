import styled from 'styled-components';

const Section = styled.div`
  width: 100%;
  padding: ${props => props.fullWidth ? '0' : '0 40px 0 40px'};
`;

Section.Content = styled.div`
  width: 100%;
  margin: 0 auto;
`;

export default Section;