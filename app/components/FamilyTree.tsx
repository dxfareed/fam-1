'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/app/context/UserContext';
import { getFamily } from '@/lib/family';
import { fetchUsers } from '@/lib/user';
import { User } from '@/lib/neynar';
import styles from './FamilyTree.module.css';
import { checkNftOwnership } from '@/lib/nft';
import { withRetry } from '@/lib/retry';

const ModernLoader = () => <div className={styles.loader}></div>;

export function FamilyTree() {
  const { fid, username } = useUser();
  const [nftHolders, setNftHolders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [nftOwnership, setNftOwnership] = useState<Record<number, { holdingNft: boolean; nftImage: string | null }>>({});

  useEffect(() => {
    if (fid) {
      withRetry(() => getFamily(fid))
        .then(async (bestFriends) => {
          if (bestFriends.length > 0) {
            const familyFids = bestFriends.map((friend) => friend.fid);
            const users = await fetchUsers(familyFids, fid);

            const ownershipResults = [];
            for (const user of users) {
              const result = await checkNftOwnership(user);
              ownershipResults.push(result);
            }

            const ownershipMap = ownershipResults.reduce((acc, result) => {
              acc[result.user.fid] = {
                holdingNft: result.holdingNft,
                nftImage: result.nftImage,
              };
              return acc;
            }, {} as Record<number, { holdingNft: boolean; nftImage: string | null }>);

            setNftOwnership(ownershipMap);

            const holders = users.filter(user => ownershipMap[user.fid]?.holdingNft);

            const sortedHolders = [...holders].sort((a, b) => {
              const scoreA = bestFriends.find(friend => friend.fid === a.fid)?.mutual_affinity_score || 0;
              const scoreB = bestFriends.find(friend => friend.fid === b.fid)?.mutual_affinity_score || 0;
              return scoreB - scoreA;
            });

            setNftHolders(sortedHolders.slice(0, 6));
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [fid]);

  const cardTitle = username ? `${username}'s Family` : 'Farcaster Family';

  if (loading) {
    return (
      <div className={styles.card}>
        <h2 className={styles.title}>{cardTitle}</h2>
        <ModernLoader />
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{cardTitle}</h2>
      <div className={styles.tree}>
        <div className={styles.row}>
          {nftHolders.slice(0, 1).map((member) => (
            <div key={member.fid} className={styles.member}>
              <div className={styles.pfpContainer}>
                <img src={member.pfp_url} alt={member.username} />
                {nftOwnership[member.fid]?.holdingNft && (
                  <img
                    src={nftOwnership[member.fid]?.nftImage || ''}
                    alt="NFT"
                    className={styles.nftImage}
                  />
                )}
              </div>
              <span>{member.display_name}</span>
            </div>
          ))}
        </div>
        <div className={styles.row}>
          {nftHolders.slice(1, 3).map((member) => (
            <div key={member.fid} className={styles.member}>
              <div className={styles.pfpContainer}>
                <img src={member.pfp_url} alt={member.username} />
                {nftOwnership[member.fid]?.holdingNft && (
                  <img
                    src={nftOwnership[member.fid]?.nftImage || ''}
                    alt="NFT"
                    className={styles.nftImage}
                  />
                )}
              </div>
              <span>{member.display_name}</span>
            </div>
          ))}
        </div>
        <div className={styles.row}>
          {nftHolders.slice(3, 6).map((member) => (
            <div key={member.fid} className={styles.member}>
              <div className={styles.pfpContainer}>
                <img src={member.pfp_url} alt={member.username} />
                {nftOwnership[member.fid]?.holdingNft && (
                  <img
                    src={nftOwnership[member.fid]?.nftImage || ''}
                    alt="NFT"
                    className={styles.nftImage}
                  />
                )}
              </div>
              <span>{member.display_name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
