'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/app/context/UserContext';
import { getFamily } from '@/lib/family';
import { fetchUsers } from '@/lib/user';
import { User } from '@/lib/neynar';
import styles from './FamilyTree.module.css';

export function FamilyTree() {
  const { fid } = useUser();
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
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [fid]);

  return (
    <div className={styles.window}>
      <div className={styles.titleBar}>
        <div className={styles.title}>Farcaster Family</div>
        <div className={styles.buttons}>
          <div className={styles.button}>_</div>
          <div className={styles.button}>[]</div>
          <div className={styles.button}>X</div>
        </div>
      </div>
      <div className={styles.content}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {familyProfiles.map((member) => (
              <li key={member.fid} className={styles.member}>
                <img src={member.pfp_url} alt={member.username} width={32} height={32} />
                <span>{member.display_name} (@{member.username})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
