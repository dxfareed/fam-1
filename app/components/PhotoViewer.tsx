"use client";
import Image from 'next/image';
import styles from './PhotoViewer.module.css';
import { ArrowLeft, Share2Icon } from 'lucide-react';

interface PhotoViewerProps {
  imageUrl: string;
  onBack: () => void;
}

const PhotoViewer = ({ imageUrl, onBack }: PhotoViewerProps) => {
  const handleShare = () => {
    console.log("Share functionality to be implemented.");
  };

  return (
    <div className={styles.viewerOverlay}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.iconButton}>
          <ArrowLeft size={24} />
        </button>
      </div>
      <div className={styles.imageContainer}>
        <Image src={imageUrl} alt="NFT" layout="fill" objectFit="contain" />
      </div>
      <div className={styles.footer}>
        <button onClick={handleShare} className={styles.iconButton}>
          <Share2Icon size={24} />
        </button>
      </div>
    </div>
  );
};

export default PhotoViewer;
