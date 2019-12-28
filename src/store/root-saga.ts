import { fork } from 'redux-saga/effects';
import sbankenSaga from '../sbanken/saga';

export default function* rootSaga() {
  yield fork(sbankenSaga);
}
