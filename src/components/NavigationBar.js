import React, { Component } from 'react';
import styled from 'styled-components';
import { observable, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Link, withRouter } from 'react-router-dom';
import DropdownMenu from './DropdownMenu';
import Section from './Section';
import Button from './Button';
import MobileMenu from './MobileMenu';
import * as Icons from './Icons';
import * as breakpoints from '../breakpoints';

@withRouter
@inject('store')
@observer
class NavigationBar extends Component {
  static desktopHeight = 100;
  static mobileHeight = 150;
  @observable mobileMenuOpen = false;

  handleLogoutClick = () => this.props.store.logout();

  @action.bound toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  render() {
    const { store, match } = this.props;
    const { user } = store;
    const { admin } = user;
    const { path } = match;
    const { mobileMenuOpen } = this;

    return (
      <React.Fragment>
        <MobileMenu open={mobileMenuOpen} onClose={this.toggleMobileMenu}>
          {admin && <Link to="/SchoolSettings">School Settings</Link>}
          {admin && <Link to="/AddYear">Add a Year</Link>}
          {admin && <Link to="/Users">Manage Users</Link>}
          <Link to="/EditProfile">Edit Profile</Link>
          <Link to="/About">About</Link>
          <Button onClick={this.handleLogoutClick}>Logout</Button>
        </MobileMenu>
        <Root>
          <Content>
            <MobileMenuButton onClick={this.toggleMobileMenu}>
              <MobileMenuIcon/>
            </MobileMenuButton>

            <HomeLink>
              <Logo/>
            </HomeLink>

            <PageList>
              <PageListItem>
                <PageLink to="/Students" className={path === '/:schoolYearId/students' ? 'active' : ''}>
                  <PageLinkText>Students</PageLinkText>
                  <StudentsIcon/>
                </PageLink>
              </PageListItem>
              <PageListItem>
                <PageLink to="/Reports/Individual" className={path === '/Reports' ? 'active' : ''}>
                  <PageLinkText>Reports</PageLinkText>
                  <ReportsIcon/>
                </PageLink>
              </PageListItem>
            </PageList>

            <DesktopMenu header={
              <MenuHeader>
                Welcome {user && user.firstName} <DesktopMenuIcon/>
              </MenuHeader>
            }>
              {admin && <MenuLinkItem to="/SchoolSettings">School Settings</MenuLinkItem>}
              {admin && <MenuLinkItem to="/AddYear">Add a Year</MenuLinkItem>}
              {admin && <MenuLinkItem to="/Users">Manage Users</MenuLinkItem>}
              <MenuLinkItem to="/EditProfile">Edit Profile</MenuLinkItem>
              <MenuLinkItem to="/About">About</MenuLinkItem>
              <LogoutMenuItem onClick={this.handleLogoutClick}>Logout</LogoutMenuItem>
            </DesktopMenu>
          </Content>
        </Root>
      </React.Fragment>
    );
  }
}

export default NavigationBar;

const Root = styled(Section)`
  position: fixed;
  left: 0;
  top: 0;
  height: ${NavigationBar.desktopHeight}px;
  background-color: white;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.12);
  z-index: 100;

  @media ${breakpoints.small} {
    height: ${NavigationBar.mobileHeight}px;
    padding: 0;
  }
`;

const Content = styled(Section.Content)`
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  
  @media ${breakpoints.small} {
    flex-direction: column;
    justify-content: space-between;
  }
`;

const Logo = styled.img.attrs({
  src: require('../assets/logo.png')
})`
  width: 225px;
  max-width: 100%;
`;

const HomeLink = styled(Link).attrs({
  to: '/'
})`
  margin-right: 100px;

  @media ${breakpoints.small} {
    margin-right: 0;
    margin-top: 10px;
  }
`;

const PageList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  padding: 0;
  margin: 0;
  flex: 1;

  @media ${breakpoints.small} {
    width: 100%;
    justify-content: center;
  }
`;

const PageListItem = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  & + & {
    margin-left: 28px;
  }
  @media ${breakpoints.small} {
    flex: 1 1 100%;

    &:first-child > a {
      align-items: flex-end; 
    }

    &:first-child img {
      margin-right: 30px;
    }

    &:last-child > a {
      align-items: flex-start;
    }

    &:last-child  img {
      margin-left: 30px;
    }
  }
`;

const PageLink = styled(Link)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  height: 100%;
  border-bottom: 5px solid transparent;

  &.active {
    border-bottom: 5px solid #F5633A;
    > span {	
      color: black;	
    }
  }

  @media ${breakpoints.small} {
    border-bottom: 2px solid transparent;
    &.active {
      border-bottom: 2px solid #F5633A;
    }
  }
`;

const PageLinkText = styled.span`
	height: 19px;
	width: 58px;
	color: #4A4A4A;
	font-family: "Open Sans";
	font-size: 14px;
  line-height: 19px;
  margin-bottom: 15px;
  width: 100%;
  text-align: center;

  @media ${breakpoints.small} {
    display: none;
  }
`;

const StudentsIcon = styled.img.attrs({
  src: require('../assets/students_icon.png')
})`
  width: 41px;
  height: 28px;
`;

const ReportsIcon = styled.img.attrs({
  src: require('../assets/reports_icon.png')
})`
  width: 41px;
  height: 28px;
`;

const DesktopMenuIcon = styled(Icons.Gear)`
  position: relative;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  margin-left: 32px;
`;

const MenuHeader = styled.div`
  cursor: pointer;
  font-style: italic;
  color: #A20B0E;
`;

const MenuLinkItem = DropdownMenu.Item.withComponent(Link);

const LogoutMenuItem = DropdownMenu.Item;

const DesktopMenu = styled(DropdownMenu)`
  @media ${breakpoints.small} {
    display: none;
  }
`;

const MobileMenuIcon = styled(Icons.Gear)`
  width: 16px;
  height: 16px;
`;

const MobileMenuButton = styled(Button)`
  display: none;
  position: absolute;
  top: 20px;
  right: 20px;

  @media ${breakpoints.small} {
    display: block;
  }
`;
