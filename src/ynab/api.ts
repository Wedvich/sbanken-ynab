import { Store } from 'redux';

import { Api } from '../helpers/api';

const YNAB_API_BASE_URL = 'https://api.youneedabudget.com';

export class YnabApi extends Api {
  constructor() {
    super('YNAB', YNAB_API_BASE_URL);
  }

  connect(store: Store) {
    super.connect(store);
  }
}

export const api = new YnabApi();
