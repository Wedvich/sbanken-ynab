import { h, JSX } from 'preact';
import classNames from 'classnames';

type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement>;

export default function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      className={classNames(
        'inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
