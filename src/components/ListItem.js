import styled from 'styled-components';

export default styled.li`
  min-height: 70px;
  padding: 14px 20px 10px 40px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  ${prop => prop.active ? 'background: #F2F2F2;' : null}
  border-bottom: 1px solid #D43425;
  border-top: 1px solid white;
`;
