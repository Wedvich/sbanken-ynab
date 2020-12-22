import React from 'react';
import cx from 'classnames';
import './loader.scss';

interface LoaderProps {
  inverted?: boolean;
}

const Loader = ({ inverted }: LoaderProps) => (
  <div className={cx('sk-flow', { inverted: inverted })}>
    <div className="sk-flow-dot"></div>
    <div className="sk-flow-dot"></div>
    <div className="sk-flow-dot"></div>
  </div>
);

export default Loader;
