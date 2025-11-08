// lib/nft.ts
import { User } from '@/lib/neynar';
import { ethers } from 'ethers';
import prisma from '@/lib/prisma';

const NFT_CONTRACT_ADDRESS = '0x699727f9e01a822efdcf7333073f0461e5914b4e';
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const BASE_RPC_URL = process.env.NEXT_PUBLIC_HTTPS_IN_URL;

const erc721Abi = ["function balanceOf(address owner) view returns (uint256)"];
const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, erc721Abi, provider);

// Cache is considered stale after 6 hours
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;

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
    console.error('Alchemy API key is not set.');
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

export async function checkNftOwnershipOnServer(user: User): Promise<{ user: User; holdingNft: boolean; nftImage: string | null }> {
  const fid = BigInt(user.fid);

  const cachedData = await prisma.nftCache.findUnique({ where: { fid } });
  const now = new Date().getTime();

  if (cachedData && (now - cachedData.updatedAt.getTime()) < CACHE_DURATION_MS) {
    //console.log(`[CACHE HIT] FID: ${fid}, holdingNft: ${cachedData.holdingNft}`);
    return { user, holdingNft: cachedData.holdingNft, nftImage: cachedData.nftImage };
  }

  console.log(`[CACHE MISS] No fresh cache for FID: ${fid}. Fetching live data...`);
  const addresses = user.verified_addresses.eth_addresses;
  let holdingNft = false;
  let nftImage: string | null = null;

  for (const address of addresses) {
    const isHolder = await checkBalanceWithEthers(address);
    if (isHolder) {
      holdingNft = true;
      nftImage = await getNftImageFromAlchemy(address);
      break; // Found an NFT, no need to check other addresses
    }
  }

  // 3. Update cache
  await prisma.nftCache.upsert({
    where: { fid },
    update: { holdingNft, nftImage, updatedAt: new Date() },
    create: { fid, holdingNft, nftImage, updatedAt: new Date() },
  });

  return { user, holdingNft, nftImage };
}

