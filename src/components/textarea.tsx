import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import classNames from 'classnames';

export const Textarea = ({ className, ...rest }: h.JSX.HTMLAttributes<HTMLTextAreaElement>) => {
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textarea.current;
    if (!element) return;

    element.setSelectionRange(0, -1, 'forward');
  }, []);

  return (
    <div className="grid">
      <textarea
        ref={textarea}
        className={classNames(
          'resize-none py-2 px-2.5 selection:bg-pink-300 rounded h-32 border-gray-300 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500',
          className as string
        )}
        {...rest}
      />
    </div>
  );
};
