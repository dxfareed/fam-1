'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/app/context/UserContext';
import { getFamily } from '@/lib/family';
import { fetchUsers } from '@/lib/user';
import { User } from '@/lib/neynar';
import Modal from './Modal';
import Toast from './Toast';
import Loader from './Loader';
import styles from './FamilyTree.module.css';

export function FamilyTree() {
  const { fid, username } = useUser();
  const [familyProfiles, setFamilyProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (fid) {
      getFamily(fid)
        .then(async (bestFriends) => {
          if (bestFriends.length > 0) {
            const familyFids = bestFriends.map((friend) => friend.fid);
            const users = await fetchUsers(familyFids, fid);
            setFamilyProfiles(users);
            setToast({ message: 'Family data loaded successfully!', type: 'success' });
          }
        })
        .catch(error => {
          console.error(error);
          setToast({ message: 'Failed to load family data.', type: 'error' });
        })
        .finally(() => setLoading(false));
    }
  }, [fid]);

  const closeModal = () => setIsModalOpen(false);
  const closeToast = () => setToast(null);

  const modalTitle = username ? `${username}'s Family` : 'Farcaster Family';

  return (
    <>
      {isModalOpen && (
        <Modal title={modalTitle} onClose={closeModal}>
          {loading ? (
            <Loader />
          ) : (
            <div className={styles.familyGrid}>
              <div className={styles.row}>
                {familyProfiles.slice(0, 2).map((member, index) => (
                  <div key={member.fid} className={styles.member}>
                    <img src={member.pfp_url} alt={member.username} width={32} height={32} />
                    <span>{member.display_name} (@{member.username})</span>
                  </div>
                ))}
              </div>
              <div className={styles.row}>
                {familyProfiles.slice(2, 5).map((member, index) => (
                  <div key={member.fid} className={styles.member}>
                    <img src={member.pfp_url} alt={member.username} width={32} height={32} />
                    <span>{member.display_name} (@{member.username})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </>
  );
}
