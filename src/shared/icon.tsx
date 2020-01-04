import React from 'react';

export enum IconType {
  Alert = 'alert',
  Error = 'error',
  Success = 'success',
}

interface IconProps {
  type: IconType;
  title?: string;
}

const Icon = ({ type, title }: IconProps) => (
  <svg className="sby-icon">
    {title && <title>{title}</title>}
    <use xlinkHref={`#${type}`} />
  </svg>
);

export default React.memo(Icon);
