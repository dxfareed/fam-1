"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { useAccount } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { sdk } from '@farcaster/miniapp-sdk';
import Loader from "./components/Loader";
import { withRetry } from "../lib/retry";
import { religiousWarpletAbi } from "../lib/abi";
import { parseEther } from "viem";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function Home() {
  const { isConnected, address, isConnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { data: hash, writeContract, isPending: isMinting, error: mintError } = useWriteContract();

  const [nftImageUrl, setNftImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isCheckingNft, setIsCheckingNft] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTimeout, setErrorTimeout] = useState<NodeJS.Timeout | null>(null);
  const [userRejectedError, setUserRejectedError] = useState(false);
  const [selectedReligion, setSelectedReligion] = useState('Muslim');

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
        handleSetError(data.error || "Failed to generate image.");
      }
    } catch (err) {
      handleSetError("Failed to generate image.");
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

  const handleMint = async () => {
    console.log("DEBUG: handleMint triggered.");
    if (!generatedImageUrl || !address) {
      console.error("DEBUG: Mint aborted. Missing generated image URL or wallet address.");
      return;
    }
    setIsPreparing(true);
    setError(null);
    try {
      // 1. Get the tokenURI from our backend
      console.log("DEBUG: Calling backend API '/api/nft/mint'...");
      const { token } = await sdk.quickAuth.getToken();
      const res = await fetch('/api/nft/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ imageData: generatedImageUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to prepare NFT.");
      }
      const { tokenUri } = data;
      console.log("DEBUG: Received tokenURI from backend:", tokenUri);

      // 2. Call the smart contract to mint
      const mintArgs = {
        address: CONTRACT_ADDRESS,
        abi: religiousWarpletAbi,
        functionName: 'safeMint',
        args: [address, tokenUri],
        value: parseEther("0.0003"),
      };
      console.log("DEBUG: Calling writeContract with args:", mintArgs);
      writeContract(mintArgs);
      console.log("DEBUG: writeContract call has been made.");

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("DEBUG: Error in handleMint catch block:", errorMessage);
      handleSetError(`Failed to prepare mint: ${errorMessage}`);
    } finally {
      setIsPreparing(false);
      console.log("DEBUG: handleMint finished.");
    }
  };

  const handleShare = () => {
    console.log("DEBUG: Share functionality to be implemented.");
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
              disabled={!!generatedImageUrl}
            >
              {religions.map(religion => (
                <option key={religion} value={religion}>{religion}</option>
              ))}
            </select>

            <button
              className={styles.modernButton}
              onClick={
                isConfirmed
                  ? handleShare
                  : generatedImageUrl
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
              ) : isConfirmed ? (
                "Share"
              ) : generatedImageUrl ? (
                "Mint NFT"
              ) : (
                "Make it Religious!"
              )}
            </button>

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
      </div>
    </div>
  );
}
