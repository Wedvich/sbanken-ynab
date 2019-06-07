import { Api } from '../helpers/api';

const YNAB_API_BASE_URL = 'https://api.youneedabudget.com';

export class YnabApi extends Api {
  constructor() {
    super(YNAB_API_BASE_URL);
  }
}

export const api = new YnabApi();
