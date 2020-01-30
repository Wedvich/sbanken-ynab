import { onboardingStatusStorageKey, OnboardingStatus, getStoredOnboardingStatus, storeOnboardingStatus } from './utils';

beforeEach(() => {
  localStorage.clear();
});

describe('getStoredOnboardingStatus', () => {
  it('gets the stored status', () => {
    localStorage.setItem(onboardingStatusStorageKey, OnboardingStatus.Started);

    const status = getStoredOnboardingStatus();
    expect(status).toBe(OnboardingStatus.Started);
  });

  it('returns the default status when nothing is stored', () => {
    const status = getStoredOnboardingStatus();
    expect(status).toBe(OnboardingStatus.NotStarted);
  });

  it('returns the default status when the stored value is invalid', () => {
    localStorage.setItem(onboardingStatusStorageKey, 'garbage');

    const status = getStoredOnboardingStatus();
    expect(status).toBe(OnboardingStatus.NotStarted);
  });
});

describe('storeOnboardingStatus', () => {
  it('stores the status', () => {
    storeOnboardingStatus(OnboardingStatus.Completed);

    const status = localStorage.getItem(onboardingStatusStorageKey) as OnboardingStatus;
    expect(status).toBe(OnboardingStatus.Completed);
  });
});
