import React from 'react';
import { NavLink } from 'react-router-dom';

import './style.scss';

const Header = () => (
  <header className="header" role="navigation" >
    <NavLink to="/settings/sbanken" activeClassName="active">
      <span>Sbanken</span>
    </NavLink>
    <NavLink to="/settings/ynab" activeClassName="active">
      <span>YNAB</span>
    </NavLink>
    <NavLink to="/settings/mappings" activeClassName="active">
      <span>Mappings</span>
    </NavLink>
  </header>
);

export default Header;
