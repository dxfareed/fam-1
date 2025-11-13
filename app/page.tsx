"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { useAccount } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { sdk } from '@farcaster/miniapp-sdk';
import Loader from "./components/Loader";
import Gallery from "./components/Gallery";
import Navigation from "./components/Navigation";
import { withRetry } from "../lib/retry";
import { religiousWarpletAbi } from "../lib/abi";
import { parseEther } from "viem";
import { useUser } from "./context/UserContext";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function Home() {
  const { isConnected, address, isConnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { data: hash, writeContract, isPending: isMinting, error: mintError, reset } = useWriteContract();
  const { fid } = useUser();

  const [nftImageUrl, setNftImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isCheckingNft, setIsCheckingNft] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTimeout, setErrorTimeout] = useState<NodeJS.Timeout | null>(null);
  const [userRejectedError, setUserRejectedError] = useState(false);
  const [selectedReligion, setSelectedReligion] = useState('Muslim');
  const [activeView, setActiveView] = useState<'home' | 'gallery'>('home');

  const handleSetError = (errorMessage: string) => {
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    setError(errorMessage);
    const timeout = setTimeout(() => {
      setError(null);
    }, 5000);
    setErrorTimeout(timeout);
  };

  const religions = ['Warplette','Christian' ,'Muslim', 'Buddhist', 'Jewish', 'Hindu', 'Satanic'];

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  useEffect(() => {
    if (isConnected) {
      checkNftOwnership();
    }
  }, [isConnected]);

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

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
        handleSetError("You don't seem to own the required NFT.");
      }
    } catch (err) {
      handleSetError("Failed to check NFT ownership.");
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
        handleSetError("rate limited. please try again");
      }
    } catch (err) {
      handleSetError("rate limited. please try again");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (mintError) {
      console.error("A minting error occurred:", mintError);
      if (mintError.message.includes('User rejected the request')) {
        setUserRejectedError(true);
        setTimeout(() => setUserRejectedError(false), 5000);
      } else {
        handleSetError(`Minting failed: ${mintError.message}`);
      }
    }
  }, [mintError]);

  useEffect(() => {
    if (isConfirmed && hash && generatedImageUrl) {
      const saveMintToDb = async () => {
        try {
          const { token } = await sdk.quickAuth.getToken();
          await fetch('/api/nft/mint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              imageData: generatedImageUrl,
              txHash: hash 
            }),
          });
        } catch (error) {
          console.error("Failed to save mint to DB:", error);
          handleSetError("Minted, but failed to save to gallery.");
        }
      };
      saveMintToDb();
    }
  }, [isConfirmed, hash, generatedImageUrl]);

  const handleMint = async () => {
    if (!generatedImageUrl || !address) return;

    const placeholderTokenUri = "ipfs://bafkreie3c7t6g3k43r5n7t3g6j6z6z6z6z6z6z6z6z6z6z6z6z6z6z";

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: religiousWarpletAbi,
      functionName: 'safeMint',
      args: [address, placeholderTokenUri],
      value: parseEther("0.0003"),
    });
  };

  const handleShare = () => {
    if (!fid || !generatedImageUrl) {
      console.error("FID or generated image URL is not available for sharing.");
      handleSetError("Cannot share. Missing user data or image.");
      return;
    }

    try {
      const appUrl = process.env.NEXT_PUBLIC_URL || '';
      const shareUrl = new URL('/share/frame', appUrl);
      shareUrl.searchParams.set('fid', fid.toString());
      shareUrl.searchParams.set('imageUrl', generatedImageUrl);

      const castText = "Check out my Warplet Religion";

      sdk.actions.composeCast({
        text: castText,
        embeds: [shareUrl.toString()],
      });
    } catch (error) {
      console.error('Failed to compose cast:', error);
      handleSetError("Could not create share cast.");
    }
  };

  const handleGenerateNew = () => {
    setGeneratedImageUrl(null);
    reset();
  };

  return (
    <div className={styles.container}>
      {userRejectedError && (
        <div className={styles.rejectedOverlay}>
          <Image src="/win98logo/wrong.png" alt="Error" width={48} height={48} />
          <p>User Rejected</p>
        </div>
      )}
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

      <main className={`${styles.content} ${activeView === 'gallery' ? styles.alignTop : ''}`}>
        {activeView === 'home' ? (
          <>
            {isCheckingNft && <Loader />}
            {error && <p className={styles.errorText}>{error}</p>}
            
            {!isCheckingNft && !error && nftImageUrl && (
              <div className={styles.generator}>
                <div className={styles.imageContainer}>
                  <Image
                    key={generatedImageUrl || nftImageUrl}
                    src={generatedImageUrl || nftImageUrl}
                    alt="Creature"
                    width={256}
                    height={256}
                    className={styles.imageFadeIn}
                  />
                </div>
                <select 
                  className={styles.modernSelect}
                  value={selectedReligion}
                  onChange={(e) => setSelectedReligion(e.target.value)}
                  disabled={!!generatedImageUrl}
                >
                  {religions.map(religion => (
                    <option key={religion} value={religion}>{religion}</option>
                  ))}
                </select>

                {isConfirmed ? (
                  <div className={styles.buttonGroup}>
                    <button className={styles.modernButton} onClick={handleShare}>
                      Share
                    </button>
                    <button className={styles.modernButton} onClick={handleGenerateNew}>
                      Generate New
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.modernButton}
                    onClick={
                      generatedImageUrl
                        ? handleMint
                        : handleGenerateSmile
                    }
                    disabled={isGenerating || isPreparing || isMinting}
                  >
                    {isGenerating ? (
                      <Loader />
                    ) : isPreparing ? (
                      "Preparing..."
                    ) : isMinting ? (
                      "Minting..."
                    ) : generatedImageUrl ? (
                      "Mint NFT"
                    ) : (
                      "Generate"
                    )}
                  </button>
                )}

                {isConfirming && <p>Waiting for confirmation...</p>}
                {isConfirmed && (
                  <div>
                    <p>Minted Successfully!</p>
                    <a 
                      href={`https://sepolia.basescan.org/tx/${hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      View on Basescan
                    </a>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <Gallery setActiveView={setActiveView} activeView={activeView} />
        )}
      </main>
      
      <Navigation activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}
