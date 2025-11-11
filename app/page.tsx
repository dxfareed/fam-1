"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { sdk } from '@farcaster/miniapp-sdk';
import Loader from "./components/Loader";
import { withRetry } from "../lib/retry";

export default function Home() {
  const { isConnected, address, isConnecting } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [nftImageUrl, setNftImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isCheckingNft, setIsCheckingNft] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReligion, setSelectedReligion] = useState('Muslim');

  const religions = ['Muslim', 'Christian', 'Buddhist', 'Jewish', 'Hindu', 'Satanic'];

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  useEffect(() => {
    if (isConnected) {
      checkNftOwnership();
    }
  }, [isConnected]);

  const checkNftOwnership = async () => {
    setIsCheckingNft(true);
    setError(null);
    try {
      const { token } = await sdk.quickAuth.getToken();
      const res = await withRetry(async () => {
        const response = await fetch('/api/nft/check', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }
        return response;
      });
      
      const data = await res.json();
      if (res.ok && data.holdingNft) {
        setNftImageUrl(data.nftImage);
      } else {
        setError("You don't seem to own the required NFT.");
      }
    } catch (err) {
      setError("Failed to check NFT ownership.");
      console.error(err);
    } finally {
      setIsCheckingNft(false);
    }
  };

  const handleGenerateSmile = async () => {
    if (!nftImageUrl) return;
    setIsGenerating(true);
    setError(null);
    try {
      const { token } = await sdk.quickAuth.getToken();
      const res = await withRetry(async () => {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ imageUrl: nftImageUrl, religion: selectedReligion }),
        });
        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }
        return response;
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedImageUrl(data.newImageUrl);
      } else {
        setError(data.error || "Failed to generate image.");
      }
    } catch (err) {
      setError("Failed to generate image.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        {isConnected ? (
          <div className={styles.modernAddress}>{shortenAddress(address as string)}</div>
        ) : (
          <button 
            className={styles.modernButton} 
            onClick={openConnectModal} 
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </header>

      <div className={styles.content}>
        {isCheckingNft && <Loader />}
        {error && <p className={styles.errorText}>{error}</p>}
        
        {!isCheckingNft && !error && nftImageUrl && (
          <div className={styles.generator}>
            <div className={styles.imageContainer}>
              <Image src={generatedImageUrl || nftImageUrl} alt="Creature" width={256} height={256} />
            </div>
            <select 
              className={styles.modernSelect}
              value={selectedReligion}
              onChange={(e) => setSelectedReligion(e.target.value)}
            >
              {religions.map(religion => (
                <option key={religion} value={religion}>{religion}</option>
              ))}
            </select>
            <button 
              className={styles.modernButton} 
              onClick={handleGenerateSmile}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader /> : "Make it Religious!"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
