import React from 'react';
import { Switch, match as Match, Route } from 'react-router';

import { SbankenSettings } from '../sbanken';
import { YnabSettings } from '../ynab';
import { Mappings } from './Mappings';

const Settings = ({ match }: { match: Match }) => (
  <Switch>
    <Route path={`${match.url}/sbanken`} component={SbankenSettings} />
    <Route path={`${match.url}/ynab`} component={YnabSettings} />
    <Route path={`${match.url}/mappings`} component={Mappings} />
  </Switch>
);

export default Settings;
