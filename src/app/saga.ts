import { eventChannel, buffers } from 'redux-saga';
import { call, fork, takeEvery, cancel, put, spawn, takeLatest, all } from 'redux-saga/effects';
import { History } from 'history';
import { ServiceWorkerMessageType } from '../service-worker/constants';
import { actions, AppActionType } from './reducer';
import { ExportedSettings } from './utils';
import { actions as sbankenActions, SbankenActionType } from '../sbanken/reducer';
import { actions as ynabActions, YnabActionType } from '../ynab/reducer';
import { actions as modalActions } from '../modals/reducer';
import { actions as accountActions } from '../accounts/reducer';
import { decodeCredentials } from '../sbanken/utils';
import { ModalId } from '../modals/types';
import { OnboardingActionType, OnboardingStatus, storeOnboardingStatus } from '../onboarding/utils';
import { HttpError } from '../shared/utils';
import { Action } from 'redux';

/**
 * Handles messages to and from the service worker.
 */
function* serviceWorkerMessageHandler() {
  let messageChannel: MessageChannel;

  // Listen for messages from the service worker.
  const serviceWorkerChannel = yield call(
    eventChannel,
    (emit) => {
      messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (message) => emit(message.data);
      return () => (messageChannel.port1.onmessage = undefined);
    },
    buffers.expanding()
  );

  // Pipe messages from the message channel through to the Redux store.
  yield takeEvery(serviceWorkerChannel, function* (message: any) {
    switch (message.type) {
      case ServiceWorkerMessageType.HasUpdates:
        if (message.updated) {
          yield put(actions.hasUpdates());
        }
        break;
    }
  });

  const { active: serviceWorker }: ServiceWorkerRegistration = yield call(
    () => navigator.serviceWorker.ready
  );
  yield call(
    [serviceWorker, serviceWorker.postMessage] as any,
    {
      type: ServiceWorkerMessageType.CheckForUpdates,
    },
    [messageChannel.port2]
  );
}

/**
 * Sets up two-way communication with the service worker and listens for app updates.
 */
function* serviceWorkerSaga() {
  yield call([navigator.serviceWorker, navigator.serviceWorker.register], '/sw.js');

  const controllerChangeChannel = yield call(eventChannel, (emit) => {
    navigator.serviceWorker.addEventListener('controllerchange', emit);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', emit);
  });

  let messageChannelProcess = yield fork(serviceWorkerMessageHandler);
  yield takeEvery(controllerChangeChannel, function* () {
    yield cancel(messageChannelProcess);
    messageChannelProcess = yield fork(serviceWorkerMessageHandler);
  });
}

function* offlineMonitorSaga() {
  const channel = yield call(eventChannel, (emit) => {
    const handler = () => emit(!navigator.onLine);

    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);

    return () => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    };
  });

  yield takeEvery(channel, function* (isOffline: boolean) {
    yield put(actions.updateOfflineStatus(isOffline));
  });
}

function* importSettingsSaga({ settings }: { settings: ExportedSettings }) {
  const { clientId, clientSecret } = decodeCredentials(settings.sbankenCredentials);
  yield all([
    put(sbankenActions.setCredentials(clientId, clientSecret, settings.sbankenCustomerId)),
    put(ynabActions.setToken(settings.ynabPersonalAccessToken)),
    put(ynabActions.setBudget(settings.ynabBudgetId)),
    ...settings.accounts.map((account) => put(accountActions.add(account))),
    put(modalActions.closeModal(ModalId.ImportSettings)),
    put({ type: OnboardingActionType.Seen }),
  ]);
}

export default function* appSaga(history: History) {
  if ('serviceWorker' in navigator) {
    yield spawn(serviceWorkerSaga);
  }

  yield fork(offlineMonitorSaga);
  yield takeLatest(AppActionType.ImportSettings as any, importSettingsSaga);

  yield takeLatest(
    [YnabActionType.GetAccountsResponse, SbankenActionType.GetTokenResponse] as any,
    function* httpErrorSaga({ error, type }: Action & { error?: HttpError }) {
      if (!error) return;
      yield put(actions.setLastError(error));
      yield put(modalActions.openModal(ModalId.Error));

      if (type === SbankenActionType.GetTokenResponse) {
        yield call(storeOnboardingStatus, OnboardingStatus.Started);
        history.push('/onboarding');
      }
    }
  );
}
