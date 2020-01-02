import React, { ReactNode } from 'react';

interface ModalProps {
  children: ReactNode;
}

const Modal = ({ children }: ModalProps) => {
  return (
    <div className="sby-modal">
      {children}
    </div>
  );
};

export default Modal;
