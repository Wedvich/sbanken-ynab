import { h, JSX } from 'preact';
import classNames from 'classnames';

interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
}

export default function Button({ children, className, primary, ...rest }: ButtonProps) {
  return (
    <button
      className={classNames(
        'inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
