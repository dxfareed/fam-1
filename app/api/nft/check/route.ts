// app/api/nft/check/route.ts
import { NextResponse } from 'next/server';
import { checkNftOwnershipOnServer } from '@/lib/nft';
import { User } from '@/lib/neynar';

export async function POST(req: Request) {
  try {
    const user = (await req.json()) as User;
    if (!user || !user.fid) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    const result = await checkNftOwnershipOnServer(user);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
