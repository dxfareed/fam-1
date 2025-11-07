import React from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const iconSrc = type === 'success' ? '/win98logo/trust.png' : '/win98logo/wrong.png';

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <img src={iconSrc} alt={type} className={styles.icon} />
      <p className={styles.message}>{message}</p>
      <button className={styles.closeButton} onClick={onClose}>X</button>
    </div>
  );
};

export default Toast;
