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
      <textarea ref={textarea} className={classNames(className as string)} {...rest} />
    </div>
  );
};
