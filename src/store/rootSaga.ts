import { spawn } from 'redux-saga/effects';

import { saga as onboardingSaga } from '../onboarding';
import { saga as sbankenSaga } from '../sbanken';

export default function* rootSaga() {
  yield spawn(onboardingSaga);
  yield spawn(sbankenSaga);
}
