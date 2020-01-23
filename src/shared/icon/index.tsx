import React from 'react';
import cx from 'classnames';
import './icon.scss';

export enum IconType {
  Edit,
  Error,
  Export,
  ExternalLink,
  Network,
  ThumbsUp,
  Trash,
}

export enum IconSize {
  Small,
  Normal,
  Big,
}

export enum IconStyle {
  Outline,
  Solid,
}

const iconSymbolMap = {
  [IconType.Edit]: {
    [IconStyle.Outline]: 'edit',
    [IconStyle.Solid]: 'edit-1',
  },
  [IconType.Export]: {
    [IconStyle.Outline]: 'send',
    [IconStyle.Solid]: 'send-1',
  },
  [IconType.ExternalLink]: {
    [IconStyle.Outline]: 'exit',
    [IconStyle.Solid]: 'exit-1',
  },
  [IconType.Error]: {
    [IconStyle.Outline]: 'close',
    [IconStyle.Solid]: 'error',
  },
  [IconType.Network]: {
    [IconStyle.Outline]: 'wifi',
    [IconStyle.Solid]: 'wireless',
  },
  [IconType.ThumbsUp]: {
    [IconStyle.Outline]: 'like-1',
    [IconStyle.Solid]: 'like',
  },
  [IconType.Trash]: {
    [IconStyle.Outline]: 'trash',
    [IconStyle.Solid]: 'trash-1',
  },
} as Record<IconType, Record<IconStyle, string>>;

interface IconProps {
  className?: string;
  type: IconType;
  title?: string;
  size?: IconSize;
  style?: IconStyle;
}

const Icon = ({ type, title, size = IconSize.Normal, style = IconStyle.Outline, className }: IconProps) => (
  <svg className={cx('sby-icon', {
    'small': size === IconSize.Small,
    'big': size === IconSize.Big,
  }, className)}>
    {title && <title>{title}</title>}
    <use xlinkHref={`#${iconSymbolMap[type][style]}`} />
  </svg>
);

export default React.memo(Icon);
