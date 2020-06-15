import React from 'react';
import { DateTime } from 'luxon';
import { HttpError, HttpErrorSource } from '../../shared/utils';
import ExternalLink from '../../shared/external-link';
import { sbankenDevPortalUrl } from '../../sbanken/utils';

const YnabRateLimitReached = () => {
  const now = DateTime.local();
  const nextWholeHour = now.plus({ minutes: 60 - now.minute });
  return (
    <>
      <p>YNAB har en grense for hvor mange spørringer man kan gjøre mot API&apos;et deres, som nullstilles hver hele time. Appen kan derfor ikke hente mer data fra YNAB før denne grensen er nullstilt.</p>
      <p>Du kan prøve igjen klokken <b>{nextWholeHour.toFormat('HH:mm')}</b>.</p>
    </>
  );
};

const SbankenPasswordExpired = () => (
  <>
    <p>Sbanken godtok ikke applikasjonsnøkkelen eller passordet. Mest sannsynlig betyr det at passordet er utløpt - de har som regel bare 3 måneders varighet.</p>
    <p>Gå til <ExternalLink href={sbankenDevPortalUrl}>Utviklerportalen</ExternalLink></p>
  </>
);

interface ErrorModelDetailsProps {
  error: HttpError;
}

const ErrorModalDetails = ({ error }: ErrorModelDetailsProps) => {
  if (error.source === HttpErrorSource.YnabApi) {
    if (error.statusCode === 429) {
      return <YnabRateLimitReached />;
    }
  }

  return null;
};

export default ErrorModalDetails;
