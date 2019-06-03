import { spawn } from 'redux-saga/effects';

import { saga as sbankenSaga } from '../sbanken';

export default function* rootSaga() {
  yield spawn(sbankenSaga);
}
