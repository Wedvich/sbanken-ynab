import React from 'react';

const NoAccounts = () => {
  return (
    <>
      <span>Du har ingen sammenkoblede kontoer ennå.</span>
      <div className="sby-button-group">
        <button>Legg til kobling</button>
      </div>
    </>
  );
};

export default React.memo(NoAccounts);
