export enum OnboardingActionType {
  Seen = 'onboarding/hide',
  NotSeen = 'onboarding/reset'
}

export const hasSeenIntroStorageKey = 'onboarding/has-seen-intro';

export const getStoredHasSeenIntro = () =>
  !!localStorage.getItem(hasSeenIntroStorageKey);

export const storeHasSeenIntro = () =>
  localStorage.setItem(hasSeenIntroStorageKey, 'true');
