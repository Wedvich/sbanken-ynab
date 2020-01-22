import { eventChannel, buffers } from 'redux-saga';
import { call, fork, takeEvery, cancel, put, spawn } from 'redux-saga/effects';
import { ServiceWorkerMessageType } from '../service-worker/constants';
import { actions } from './reducer';

/**
 * Handles messages to and from the service worker.
 */
function* serviceWorkerMessageHandler() {
  let messageChannel: MessageChannel;

  // Listen for messages from the service worker.
  const serviceWorkerChannel = yield call(eventChannel, (emit) => {
    messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (message) => emit(message.data);
    return () => messageChannel.port1.onmessage = undefined;
  }, buffers.expanding());

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

  const { active: serviceWorker }: ServiceWorkerRegistration = yield call(() => navigator.serviceWorker.ready);
  yield call([serviceWorker, serviceWorker.postMessage] as any, {
    type: ServiceWorkerMessageType.CheckForUpdates,
  }, [messageChannel.port2]);
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

export default function* appSaga() {
  if ('serviceWorker' in navigator) {
    yield spawn(serviceWorkerSaga);
  }

  yield fork(offlineMonitorSaga);
}
