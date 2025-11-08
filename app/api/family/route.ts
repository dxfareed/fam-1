import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { User } from "@/lib/neynar";

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
if (!NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY is not set");
}

// Cache is considered stale after 1 hour
const CACHE_DURATION_MS = 1 * 60 * 60 * 1000; 

async function fetchUserPfp(fid: string): Promise<string | null> {
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
  const options = {
    method: 'GET',
    headers: { 'x-api-key': NEYNAR_API_KEY! },
  };
  const response = await fetch(url, options);
  const data = await response.json();
  return data.users[0]?.pfp_url || null;
}

export async function GET(request: NextRequest) {
  const res = await isAuthenticated(request);
  if (res instanceof NextResponse) {
    return res;
  }

  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  if (!fid) {
    return NextResponse.json({ message: "Missing fid" }, { status: 400 });
  }

  const fidBigInt = BigInt(fid);

  try {
    const cachedData = await prisma.familyCache.findUnique({
      where: { fid: fidBigInt },
    });

    if (cachedData && (new Date().getTime() - cachedData.updatedAt.getTime() < CACHE_DURATION_MS)) {
      return NextResponse.json({ family: cachedData.family });
    }

    // If cache is stale or doesn't exist, fetch from API
    const familyUrl = `https://api.neynar.com/v2/farcaster/user/best_friends?limit=30&fid=${fid}`;
    const options = {
      method: 'GET',
      headers: { 'x-api-key': NEYNAR_API_KEY },
    };

    //@ts-ignore
    const familyResponse = await fetch(familyUrl, options);
    const familyData = await familyResponse.json();
    const family = familyData.users as User[];

    // Fetch the user's PFP for the cache
    const pfpUrl = await fetchUserPfp(fid);

    // Save to cache
    await prisma.familyCache.upsert({
      where: { fid: fidBigInt },
      update: { family: family as any, pfpUrl, updatedAt: new Date() },
      create: { fid: fidBigInt, family: family as any, pfpUrl },
    });

    return NextResponse.json({ family });
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return NextResponse.json({ message: e.message, name: e.name, stack: e.stack }, { status: 500 });
    }

    throw e;
  }
}
