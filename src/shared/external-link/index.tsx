import React, { ReactNode } from 'react';
import Icon, { IconStyle, IconType } from '../icon';
import './external-link.scss';

export interface ExternalLinkProps {
  href: string;
  children: ReactNode;
}

const ExternalLink = ({ href, children }: ExternalLinkProps) => (
  <a
    className="sby-external-link"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
    <Icon className="not-hover" type={IconType.ExternalLink} />
    <Icon className="hover" type={IconType.ExternalLink} style={IconStyle.Solid} />
  </a>
);

export default React.memo(ExternalLink);
