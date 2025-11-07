import { User } from "./neynar";
import { sdk } from "@farcaster/miniapp-sdk";

export async function fetchUsers(fids: number[], viewerFid: number): Promise<User[]> {
  const fidsString = fids.join(',');
  const response = await sdk.quickAuth.fetch(`/api/user?fids=${fidsString}&viewerFid=${viewerFid}`);
  if (!response.ok) {
    console.log('Response not ok:', response);
    throw new Error('Failed to fetch users');
  }
  const { users } = await response.json();
  return users;
}
