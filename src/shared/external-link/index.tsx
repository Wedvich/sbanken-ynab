import React, { ReactNode } from 'react';
import Icon, { IconStyle, IconType } from '../icon';

import './external-link.scss';

export interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  noIcon?: boolean;
}

const ExternalLink = ({ href, children, noIcon }: ExternalLinkProps) => (
  <a className="sby-external-link" href={href} target="_blank" rel="noopener noreferrer">
    {children}
    {!noIcon && (
      <>
        <Icon className="not-hover" type={IconType.ExternalLink} />
        <Icon className="hover" type={IconType.ExternalLink} style={IconStyle.Solid} />
      </>
    )}
  </a>
);

export default React.memo(ExternalLink);
