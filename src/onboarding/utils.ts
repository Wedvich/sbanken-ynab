export enum OnboardingActionType {
  Seen = 'onboarding/hide',
  NotSeen = 'onboarding/reset',
}

export enum OnboardingStatus {
  NotStarted = 'not-started',
  Started = 'started',
  Completed = 'completed',
}

export const onboardingStatusStorageKey = 'onboarding/status';

export const getStoredOnboardingStatus = () => {
  const status = localStorage.getItem(onboardingStatusStorageKey) as OnboardingStatus;
  return Object.values(OnboardingStatus).includes(status) ? status : OnboardingStatus.NotStarted;
};

export const storeOnboardingStatus = (status: OnboardingStatus) =>
  localStorage.setItem(onboardingStatusStorageKey, status);
