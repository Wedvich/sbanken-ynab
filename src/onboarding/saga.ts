import { call, put, takeEvery } from 'redux-saga/effects';
import { OnboardingActionTypes, StoreOnboardingSettingsAction } from './actions';
import { actions as sbankenActions, wrapClientCredentials, unwrapClientCredentials } from '../sbanken';
import { actions as ynabActions } from '../ynab';

const CACHED_SETTINGS_KEY = 'onboarding/cached-settings';

interface CachedSettings {
  sbankenCredentials: string;
  sbankenCustomerId: string;
  ynabAccessToken: string;
  ynabBudgetId: string;
}

function* storeSettingsSaga({
  sbankenClientId,
  sbankenClientSecret,
  sbankenCustomerId,
  ynabAccessToken,
  ynabBudgetId,
}: StoreOnboardingSettingsAction) {
  yield put(sbankenActions.updateSbankenCredentials(sbankenClientId, sbankenClientSecret, sbankenCustomerId));
  yield put(ynabActions.updateYnabAccessToken(ynabAccessToken, ynabBudgetId));

  const cachedSettings: CachedSettings = {
    sbankenCredentials: wrapClientCredentials(sbankenClientId, sbankenClientSecret),
    sbankenCustomerId,
    ynabAccessToken,
    ynabBudgetId,
  };

  yield call([localStorage, localStorage.setItem], CACHED_SETTINGS_KEY, JSON.stringify(cachedSettings));
}

function* loadCachedSettingsSaga() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Loading cached settings...');
  }
  try {
    const cachedSettings = yield call([localStorage, localStorage.getItem], CACHED_SETTINGS_KEY);
    if (!cachedSettings) return;
    const settings = JSON.parse(cachedSettings) as CachedSettings;
    const { clientId: sbankenClientId, clientSecret: sbankenClientSecret } = unwrapClientCredentials(
      settings.sbankenCredentials
    );
    yield put(
      sbankenActions.updateSbankenCredentials(sbankenClientId, sbankenClientSecret, settings.sbankenCustomerId)
    );
    yield put(ynabActions.updateYnabAccessToken(settings.ynabAccessToken, settings.ynabBudgetId));
  } catch (e) {
    console.error(e);
    yield call([localStorage, localStorage.removeItem], CACHED_SETTINGS_KEY);
  }
}

export default function* onboardingSaga() {
  yield takeEvery(OnboardingActionTypes.StoreSettings, storeSettingsSaga);
  yield loadCachedSettingsSaga();
}
