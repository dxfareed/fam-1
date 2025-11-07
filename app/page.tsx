"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useAccount, useConnect } from 'wagmi'
import { FamilyTree } from "./components/FamilyTree";
//import { useEffect } from "react";

export default function Home() {
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        {isConnected ? (
          <div>{address}</div>
        ) : (
          <button onClick={() => connect({ connector: connectors[0] })}>Connect</button>
        )}
      </header>

      <div className={styles.content}>
        <FamilyTree />
      </div>
    </div>
  );
}
