// lib/nft.ts

import { User } from '@/lib/neynar';

const NFT_CONTRACT_ADDRESS = '0x699727f9e01a822efdcf7333073f0461e5914b4e';
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY; // Add your Alchemy API key to .env.local

interface Nft {
  contract: {
    address: string;
  };
  media: {
    gateway: string;
  }[];
}

interface AlchemyResponse {
  ownedNfts: Nft[];
}

async function checkAlchemyForNft(address: string): Promise<string | null> {
  if (!ALCHEMY_API_KEY) {
    console.error('Alchemy API key is not set. Please add NEXT_PUBLIC_ALCHEMY_API_KEY to your .env.local file.');
    return null;
  }

  const url = `https://base-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/getNFTs?owner=${address}&contractAddresses[]=${NFT_CONTRACT_ADDRESS}`;

  try {
    const res = await fetch(url);
    const data: AlchemyResponse = await res.json();

    if (data.ownedNfts.length > 0) {
      return data.ownedNfts[0].media[0].gateway;
    }
  } catch (error) {
    console.error('Error fetching NFT data from Alchemy:', error);
  }

  return null;
}

export async function checkNftOwnership(user: User): Promise<{ user: User; holdingNft: boolean; nftImage: string | null }> {
  const addresses = user.verified_addresses.eth_addresses;

  for (const address of addresses) {
    const nftImage = await checkAlchemyForNft(address);
    if (nftImage) {
      console.log(`${user.username} is holding the NFT. Image: ${nftImage}`);
      return { user, holdingNft: true, nftImage };
    }
  }

  console.log(`${user.username} is not holding the NFT.`);
  return { user, holdingNft: false, nftImage: null };
}
