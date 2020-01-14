import React from 'react';
import { useDispatch } from 'react-redux';
import { OnboardingActionType } from './utils';

const OnboardingIntro = () => {
  const dispatch = useDispatch();
  return (
    <div className="sby-onboarding">
      <h1>Sbanken → YNAB</h1>
      <div className="sby-onboarding-instructions">
        Sbanken er en kjempebra nettbank, og YNAB er et kjempebra budsjetteringsverktøy. Sammen kan de jo ikke bli annet enn kjempebra!
        <br />
        <br />
        Denne appen gir deg et visuelt grensesnitt for å overføre transaksjoner fra Sbanken til YNAB og holde kontoene ajour.
        <br />
        <br />
        Appen har ingen tilhørighet til verken Sbanken eller You Need A Budget.
      </div>
      <div className="sby-button-group">
        <button onClick={() => dispatch({ type: OnboardingActionType.Seen })}>
          Kom i gang
        </button>
      </div>
    </div>
  );
};

export default React.memo(OnboardingIntro);
