import React, { ChangeEvent } from 'react';

interface SbankenSettingsProps {
  clientId: string;
  clientSecret: string;
  customerId: string;
  isDisabled?: boolean;

  setClientId: (value: string) => void;
  setClientSecret: (value: string) => void;
  setCustomerId: (value: string) => void;
}

const SbankenSettings: React.FC<SbankenSettingsProps> = ({ clientId, clientSecret, customerId, isDisabled, setClientId, setClientSecret, setCustomerId }) => (
  <div className="sby-input-group-collection">
    <div className="sby-input-group">
      <label htmlFor="sbankenClientId">Applikasjonsnøkkel</label>
      <input
        type="text"
        id="sbankenClientId"
        className="sby-text-input"
        value={clientId}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setClientId(e.target.value)}
        disabled={isDisabled}
        size={32}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
    <div className="sby-input-group">
      <label htmlFor="sbankenClientSecret">Passord</label>
      <input
        type="text"
        id="sbankenClientSecret"
        className="sby-text-input"
        value={clientSecret}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setClientSecret(e.target.value)}
        disabled={isDisabled}
        size={32}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
    <div className="sby-input-group">
      <label htmlFor="sbankenCustomerId">Fødselsnummer</label>
      <input
        type="text"
        id="sbankenCustomerId"
        className="sby-text-input"
        value={customerId}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerId(e.target.value.replace(/\D/g, ''))}
        disabled={isDisabled}
        size={32}
        maxLength={11}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  </div>
);

export default SbankenSettings;
