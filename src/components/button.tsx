import { h, JSX } from 'preact';
import classNames from 'classnames';

interface ButtonProps extends Omit<JSX.HTMLAttributes<HTMLButtonElement>, 'className' | 'size'> {
  className?: string;
  importance?: 'primary' | 'secondary' | 'tertiary';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function Button({
  children,
  className,
  importance = 'tertiary',
  size = 'md',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={classNames(
        'inline-flex justify-center items-center border font-medium focus:outline-none shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-pink-500',
        className,
        {
          'border-transparent bg-pink-600 text-white hover:bg-pink-700': importance === 'primary',
          'border-transparent bg-pink-100 text-pink-700 hover:bg-pink-200':
            importance === 'secondary',
          'border-gray-300 bg-white  text-gray-700 hover:bg-gray-50': importance === 'tertiary',
          'rounded px-2.5 py-1.5 text-xs': size === 'xs',
          'rounded-md px-3 py-2 text-sm': size === 'sm',
          'rounded-md px-4 py-2 text-sm': size === 'md',
          'rounded-md px-4 py-2 text-base': size === 'lg',
          'rounded-md px-6 py-3 text-base': size === 'xl',
        }
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
