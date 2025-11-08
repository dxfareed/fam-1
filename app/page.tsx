"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { FamilyTree } from "./components/FamilyTree";
import FloatingPet from "./components/FloatingPet";
//import { useEffect } from "react";

export default function Home() {
  const { isConnected, address, isConnecting } = useAccount()
  const { openConnectModal } = useConnectModal();

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
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

      {/* <FloatingPet /> */}

      <div className={styles.content}>
        <FamilyTree isConnected={isConnected} />
      </div>
    </div>
  );
}
