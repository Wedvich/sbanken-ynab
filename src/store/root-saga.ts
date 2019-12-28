import { fork } from 'redux-saga/effects';
import { History } from 'history';
import onboardingSaga from '../onboarding/saga';
import sbankenSaga from '../sbanken/saga';

export default function* rootSaga(history: History) {
  yield fork(onboardingSaga, history);
  yield fork(sbankenSaga);
}
