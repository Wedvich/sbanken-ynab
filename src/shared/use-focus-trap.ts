import { useLayoutEffect, useState, MutableRefObject } from 'react';

export default (containerRef: MutableRefObject<HTMLElement>) => {
  const [firstFocusableNode, setFirstFocusableNode] = useState();
  const [lastFocusableNode, setLastFocusableNode] = useState();

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>('input, button');
    setFirstFocusableNode(focusableElements[0]);
    setLastFocusableNode(focusableElements[focusableElements.length - 1]);

    const focusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' && e.keyCode !== 9) return;
      if (e.shiftKey && e.target === firstFocusableNode) {
        e.preventDefault();
        lastFocusableNode.focus();
      } else if (!e.shiftKey && e.target === lastFocusableNode) {
        e.preventDefault();
        firstFocusableNode.focus();
      }
    };

    document.addEventListener('keydown', focusTrap);

    // if (!containerRef.current.contains(document.activeElement)) {
    //   firstFocusableNode?.focus();
    // }

    return () => {
      document.removeEventListener('keydown', focusTrap);
    };
  }, [firstFocusableNode, lastFocusableNode, containerRef.current]);
};
