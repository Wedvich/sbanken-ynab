import React from 'react';
import cx from 'classnames';
import './icon.scss';

export enum IconType {
  Alert = 'alert',
  Error = 'error',
  Plus = 'plus',
  Refresh = 'refresh',
  Success = 'success',
}

export enum IconSize {
  Small,
  Normal,
  Big
}

interface IconProps {
  type: IconType;
  title?: string;
  size?: IconSize;
}

const Icon = ({ type, title, size = IconSize.Normal }: IconProps) => (
  <svg className={cx('sby-icon', {
    'small': size === IconSize.Small,
    'big': size === IconSize.Big,
  })}>
    {title && <title>{title}</title>}
    <use xlinkHref={`#${type}`} />
  </svg>
);

export default React.memo(Icon);
