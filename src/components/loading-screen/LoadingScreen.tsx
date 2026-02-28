import React from 'react';
import styles from './LoadingScreen.module.css';

export const LoadingScreen: React.FC = () => {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContent}>
        <div className={styles.loader}>
          <div className={styles.loaderDot} />
          <div className={styles.loaderDot} />
          <div className={styles.loaderDot} />
        </div>
        <p className={styles.loadingText}>Loading workspace...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;