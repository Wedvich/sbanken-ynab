export interface Alert {
  id: string;
  title: string;
  message: string;
  source: 'sbanken' | 'ynab';
}

export const alerts = {
  ynab401: {
    id: 'ynab401',
    title: 'Kunne ikke hente data fra YNAB',
    message:
      'Tokenet er ugyldig. Du kan forsøke å lage et nytt token i YNAB sine utviklerinnstillinger.',
    source: 'ynab',
  },
  ynab500: {
    id: 'ynab500',
    title: 'Kunne ikke hente data fra YNAB',
    message:
      'Det oppsto en feil under henting av data, og serveren ga ingen spesifisert feilkode. Du kan forsøke å lage et nytt token i YNAB sine utviklerinnstillinger.',
    source: 'ynab',
  },
  sbankenToken400: {
    id: 'sbankenToken400',
    title: 'Kunne ikke hente token fra Sbanken',
    message:
      'Det kan være fordi passordet er utløpt, da de kun er gyldige i 3 måneder. Du må opprette et nytt passord i utviklerportalen til Sbanken.',
    source: 'sbanken',
  },
} satisfies Record<string, Alert>;
