"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useAccount, useConnect } from 'wagmi'
import { FamilyTree } from "./components/FamilyTree";
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
          <div className={styles.win98Address}>{shortenAddress(address as string)}</div>
        ) : (
          <button className={styles.win98Button} onClick={() => connect({ connector: connectors[0] })}>Connect</button>
        )}
      </header>

      <div className={styles.content}>
        <FamilyTree />
      </div>
    </div>
  );
}
