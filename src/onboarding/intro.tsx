import React from 'react';
import { useDispatch } from 'react-redux';
import { OnboardingActionType } from './utils';

const Intro = () => {
  const dispatch = useDispatch();
  return (
    <div className="sby-onboarding">
      <h1>Sbanken → YNAB</h1>
      <div className="sby-onboarding-instructions">
        Sbanken er en kjempebra nettbank, og YNAB er et kjempebra budsjetteringsverktøy. Sammen kan de jo ikke bli annet enn kjempebra!
        <br />
        <br />
        Denne appen gir deg et visuelt grensesnitt for å overføre transaksjoner fra Sbanken til YNAB og holde kontoene ajour. Alle innstillinger lagres kun lokalt i nettleseren din, og appen logger ingen informasjon. Du kan når som helst slette innstilingene.
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

export default React.memo(Intro);
