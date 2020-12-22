import { Reducer } from 'redux';
import { ExportedSettings } from './utils';
import { HttpError } from '../shared/utils';

export enum AppActionType {
  HasUpdates = 'app/has-updates',
  UpdateOfflineStatus = 'app/update-offline-status',
  ImportSettings = 'app/import-settings',
  SetLastError = 'app/set-last-error',
}

const hasUpdates = () => ({
  type: AppActionType.HasUpdates as AppActionType.HasUpdates,
});

const updateOfflineStatus = (offline: boolean) => ({
  type: AppActionType.UpdateOfflineStatus as AppActionType.UpdateOfflineStatus,
  offline,
});

const importSettings = (settings: ExportedSettings) => ({
  type: AppActionType.ImportSettings as AppActionType.ImportSettings,
  settings,
});

const setLastError = (error: HttpError) => ({
  type: AppActionType.SetLastError as AppActionType.SetLastError,
  error,
});

export const actions = {
  hasUpdates,
  updateOfflineStatus,
  importSettings,
  setLastError,
};

export type AppAction = ReturnType<typeof actions[keyof typeof actions]>;

export const appStateKey = 'app';

const initialState = {
  lastError: null as HttpError | null,
  offline: !navigator.onLine,
};

export type AppState = typeof initialState;

const reducer: Reducer<AppState, AppAction> = (state = initialState, action) => {
  switch (action.type) {
    case AppActionType.UpdateOfflineStatus:
      return {
        ...state,
        offline: action.offline,
      };

    case AppActionType.SetLastError:
      return {
        ...state,
        lastError: action.error,
      };

    default:
      return state;
  }
};

export default reducer;
