"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useAccount, useConnect } from 'wagmi'
import { FamilyTree } from "./components/FamilyTree";
import FloatingPet from "./components/FloatingPet";
//import { useEffect } from "react";

export default function Home() {
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()

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
          <button className={styles.modernButton} onClick={() => connect({ connector: connectors[0] })}>Connect</button>
        )}
      </header>

      {/* <FloatingPet /> */}

      <div className={styles.content}>
        <FamilyTree />
      </div>
    </div>
  );
}
