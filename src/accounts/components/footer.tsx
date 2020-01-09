import React from 'react';
import ExternalLink from '../../shared/external-link';

import './footer.scss';

const Footer = () => (
  <footer className="sby-footer">
    Ikoner av
    <ExternalLink href="https://www.flaticon.com/authors/freepik" noIcon>Freepik</ExternalLink>
    fra
    <ExternalLink href="https://www.flaticon.com" noIcon>www.flaticon.com</ExternalLink>
  </footer>
);

export default React.memo(Footer);
