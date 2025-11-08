'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/app/context/UserContext';
import { getFamily } from '@/lib/family';
import { fetchUsers } from '@/lib/user';
import { User } from '@/lib/neynar';
import styles from './FamilyTree.module.css';
import { checkNftOwnership } from '@/lib/nft';

const ModernLoader = () => <div className={styles.loader}></div>;

export function FamilyTree() {
  const { fid, username } = useUser();
  const [familyProfiles, setFamilyProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fid) {
      getFamily(fid)
        .then(async (bestFriends) => {
          if (bestFriends.length > 0) {
            const familyFids = bestFriends.map((friend) => friend.fid);
            const users = await fetchUsers(familyFids, fid);
            setFamilyProfiles(users);

            // Check for NFT ownership
            users.forEach(checkNftOwnership);
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
          {familyProfiles.slice(0, 1).map((member) => (
            <div key={member.fid} className={styles.member}>
              <img src={member.pfp_url} alt={member.username} />
              <span>{member.display_name}</span>
            </div>
          ))}
        </div>
        <div className={styles.row}>
          {familyProfiles.slice(1, 3).map((member) => (
            <div key={member.fid} className={styles.member}>
              <img src={member.pfp_url} alt={member.username} />
              <span>{member.display_name}</span>
            </div>
          ))}
        </div>
        <div className={styles.row}>
          {familyProfiles.slice(3, 5).map((member) => (
            <div key={member.fid} className={styles.member}>
              <img src={member.pfp_url} alt={member.username} />
              <span>{member.display_name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
