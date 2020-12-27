import React from 'react';
import { useDispatch } from 'react-redux';
import { OnboardingActionType } from './utils';
import { actions as modalActions } from '../modals/reducer';
import { ModalId } from '../modals/types';

const OnboardingIntro = () => {
  const dispatch = useDispatch();
  return (
    <div className="sby-onboarding">
      <h1>Sbanken → YNAB</h1>
      <div className="sby-onboarding-instructions">
        Sbanken er en kjempebra nettbank, og YNAB er et kjempebra budsjetteringsverktøy. Sammen kan
        de jo ikke bli annet enn kjempebra!
        <br />
        <br />
        Denne appen gir deg et visuelt grensesnitt for å overføre transaksjoner fra Sbanken til YNAB
        og holde kontoene ajour.
        <br />
        <br />
        Data lagres kun lokalt i nettleseren din, og ingenting sendes til serveren. Den ligger for
        øvrig i Microsoft Azure sitt norske datasenter, så filene og trafikken går alltid innenfor
        Norges grenser.
        <br />
        <br />
        Appen har ingen tilhørighet til verken Sbanken eller You Need A Budget.
      </div>
      <div className="sby-button-group">
        <button onClick={() => dispatch({ type: OnboardingActionType.Seen })}>Kom i gang</button>
      </div>
      <div className="sby-button-group">
        <button
          className="link"
          onClick={() => dispatch(modalActions.openModal(ModalId.ImportSettings))}
        >
          Importer innstillinger
        </button>
      </div>
    </div>
  );
};

export default React.memo(OnboardingIntro);
