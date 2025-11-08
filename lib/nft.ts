// lib/nft.ts

import { User } from '@/lib/neynar';
import { ethers } from 'ethers';

const NFT_CONTRACT_ADDRESS = '0x699727f9e01a822efdcf7333073f0461e5914b4e';
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const BASE_RPC_URL = process.env.NEXT_PUBLIC_HTTPS_IN_URL;

const erc721Abi = [
  "function balanceOf(address owner) view returns (uint256)",
];

const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, erc721Abi, provider);

async function checkBalanceWithEthers(address: string): Promise<boolean> {
  try {
    const balance = await contract.balanceOf(address);
    return balance > 0;
  } catch (error) {
    console.error(`Error checking balance for ${address}:`, error);
    return false;
  }
}

async function getNftImageFromAlchemy(address: string): Promise<string | null> {
  if (!ALCHEMY_API_KEY) {
    console.error('Alchemy API key is not set. Please add NEXT_PUBLIC_ALCHEMY_API_KEY to your .env.local file.');
    return null;
  }

  const url = `https://base-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/getNFTs?owner=${address}&contractAddresses[]=${NFT_CONTRACT_ADDRESS}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

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
    const isHolder = await checkBalanceWithEthers(address);
    if (isHolder) {
      const nftImage = await getNftImageFromAlchemy(address);
      return { user, holdingNft: true, nftImage };
    }
  }

  return { user, holdingNft: false, nftImage: null };
}
