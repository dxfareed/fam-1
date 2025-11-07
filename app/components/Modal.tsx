import React from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.window}>
        <div className={styles.titleBar}>
          <div className={styles.title}>{title}</div>
          <div className={styles.buttons}>
            <div className={styles.button} onClick={onClose}>X</div>
          </div>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
