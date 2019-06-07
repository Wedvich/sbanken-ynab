import React, { FunctionComponent, HTMLAttributes } from 'react';
import classNames from 'classnames';

import './style.scss';

export type ButtonProps = {
  
} & HTMLAttributes<HTMLButtonElement>

export const Button: FunctionComponent<ButtonProps> = ({
  children,
  ...rest
}) => (
  <button
    {...rest}
    className={classNames('button')}
  >
    <span className="button__content">
      {children}
    </span>
  </button>
);
