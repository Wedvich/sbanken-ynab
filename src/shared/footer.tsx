import React from 'react';
import cx from 'classnames';
import ExternalLink from './external-link';

import './footer.scss';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => (
  <footer className={cx('sby-footer', className)}>
    Ikoner av
    <ExternalLink href="https://www.flaticon.com/authors/smashicons" noIcon>Smashicons</ExternalLink>
    fra
    <ExternalLink href="https://www.flaticon.com" noIcon>www.flaticon.com</ExternalLink>
  </footer>
);

export default React.memo(Footer);
