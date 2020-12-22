import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import { RootState } from '../../store/root-reducer';
import Icon, { IconType, IconStyle } from '../icon';

import './offline-banner.scss';

const OfflineBanner = () => {
  const isOffline = useSelector<RootState, boolean>((state) => state.app.offline);
  const [closedManually, setClosedManually] = useState(false);

  useEffect(() => {
    if (isOffline && closedManually) {
      setClosedManually(false);
    }
  }, [isOffline]);

  return (
    <CSSTransition in={isOffline && !closedManually} timeout={300} unmountOnExit>
      <div className="sby-offline-banner">
        <Icon type={IconType.Network} style={IconStyle.Outline} className="sby-network-status" />
        <span>Mangler nettverkstilkobling</span>
        <div className="sby-button-group">
          <button className="link" onClick={() => setClosedManually(true)}>
            Lukk
          </button>
        </div>
      </div>
    </CSSTransition>
  );
};

export default React.memo(OfflineBanner);
