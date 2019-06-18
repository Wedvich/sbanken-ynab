import React from 'react';
import { Switch, match as Match, Route } from 'react-router';

import { SbankenSettings } from '../sbanken';
import { YnabSettings } from '../ynab';

const Settings = ({ match }: { match: Match }) => (
  <Switch>
    <Route path={`${match.url}/sbanken`} component={SbankenSettings} />
    <Route path={`${match.url}/ynab`} component={YnabSettings} />
  </Switch>
);

export default Settings;
