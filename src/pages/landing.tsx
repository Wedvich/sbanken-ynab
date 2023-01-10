import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import { FocusTrap } from '@headlessui/react';
import Button from '../components/button';
import { useNavigate } from 'react-router-dom';

export function LandingPage(props: { onNavigate: () => void }) {
  const navigate = useNavigate();

  const handleNext = useCallback(
    (e: Event) => {
      e.preventDefault();
      navigate('/innstillinger', { replace: true });
      props.onNavigate();
    },
    [navigate, props]
  );

  return (
    <FocusTrap className="h-full bg-white flex items-center">
      <form className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" onSubmit={handleNext}>
        <div className="max-w-2xl mx-auto">
          <h1 className="block text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Sbanken → YNAB
          </h1>
          <p className="mt-8 text-lg text-gray-600 leading-8">
            Sbanken er en kjempebra nettbank, og YNAB er et kjempebra budsjetteringsverktøy. Sammen
            kan de jo ikke bli annet enn kjempebra!
          </p>
          <p className="mt-8 text-lg text-gray-600 leading-8">
            Denne appen gir deg et visuelt grensesnitt for å overføre transaksjoner fra Sbanken til
            YNAB og holde kontoene à jour.
          </p>
          <p className="mt-8 text-lg text-gray-600 leading-8">
            Data lagres kun lokalt i nettleseren din, og ingenting sendes til serveren, som for
            øvrig ligger i Microsoft Azure sitt norske datasenter.
          </p>
          <p className="mt-8 text-lg text-gray-600 leading-8">
            Appen har ingen tilhørighet til verken Sbanken eller You Need A Budget.
          </p>
          <p className="mt-8 flex justify-center gap-2">
            <Button
              type="submit"
              className="border-transparent text-white bg-pink-600 hover:bg-pink-700 focus:ring-pink-500"
              onClick={handleNext}
              importance="primary"
            >
              Kom i gang
            </Button>
          </p>
        </div>
      </form>
    </FocusTrap>
  );
}
