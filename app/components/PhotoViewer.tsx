"use client";
import Image from 'next/image';
import styles from './PhotoViewer.module.css';
import { ArrowLeft, Share2Icon } from 'lucide-react';
import { useUser } from '@/app/context/UserContext';
import { sdk } from '@farcaster/miniapp-sdk';

interface PhotoViewerProps {
  imageUrl: string;
  onBack: () => void;
}

const PhotoViewer = ({ imageUrl, onBack }: PhotoViewerProps) => {
  const { fid } = useUser();

  const handleShare = () => {
    if (!fid || !imageUrl) {
      console.error("FID or image URL is not available for sharing.");
      // Optionally, show an error to the user.
      return;
    }

    try {
      const appUrl = process.env.NEXT_PUBLIC_URL || '';
      const shareUrl = new URL('/share/frame', appUrl);
      console.log('Preparing to share with URL:', shareUrl.toString());
      shareUrl.searchParams.set('fid', fid.toString());
      shareUrl.searchParams.set('imageUrl', imageUrl);

      const castText = "Check out this Religious Warplet!";
      console.log(castText, shareUrl.toString());
      sdk.actions.composeCast({
        text: castText,
        embeds: [shareUrl.toString()],
      });
    } catch (error) {
      console.error('Failed to compose cast:', error);
    }
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
