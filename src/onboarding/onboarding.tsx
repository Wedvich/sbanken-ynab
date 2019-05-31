import React, { FunctionComponent, useState } from 'react';

const Onboarding: FunctionComponent = () => {
  const [clientId, setClientId] = useState();
  const [clientSecret, setClientSecret] = useState();
  const [customerId, setCustomerId] = useState();

  const nextClicked = () => {
    console.log(
      'clientId: %s, clientSecret: %s, customerId: %s',
      clientId,
      clientSecret,
      customerId
    );
  };

  return (
    <div className="onboarding">
      <div>
        <label htmlFor="credentials__clientId">Client ID</label>
        <input
          id="credentials__clientId"
          type="text"
          onInput={e => setClientId((e.target as HTMLInputElement).value)}
        />
      </div>
      <div>
        <label htmlFor="credentials__clientSecret">Client Secret</label>
        <input
          id="credentials__clientSecret"
          type="text"
          onInput={e => setClientSecret((e.target as HTMLInputElement).value)}
        />
      </div>
      <div>
        <label htmlFor="credentials__customerId">Customer ID</label>
        <input
          id="credentials__customerId"
          type="text"
          onInput={e => setCustomerId((e.target as HTMLInputElement).value)}
        />
      </div>
      <div>
        <button onClick={nextClicked}>Next</button>
      </div>
    </div>
  );
};

export default Onboarding;
