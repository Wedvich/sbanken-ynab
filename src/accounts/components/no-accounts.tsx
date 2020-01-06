import React from 'react';
import { useHistory } from 'react-router-dom';

const NoAccounts = () => {
  const history = useHistory();
  return (
    <>
      <span>Du har ingen sammenkoblede kontoer ennå.</span>
      <div className="sby-button-group">
        <button onClick={() => { history.push('/accounts/add'); }}>Legg til kobling</button>
      </div>
    </>
  );
};

export default React.memo(NoAccounts);
