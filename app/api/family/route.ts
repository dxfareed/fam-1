import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
if (!NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY is not set");
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

  try {
    const url = `https://api.neynar.com/v2/farcaster/user/best_friends?limit=5&fid=${fid}`;
    const options = {
      method: 'GET',
      headers: { 'x-api-key': NEYNAR_API_KEY },
    };
    const response = await fetch(url, options);
    const data = await response.json();

    return NextResponse.json({ family: data.users });
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return NextResponse.json({ message: e.message, name: e.name, stack: e.stack }, { status: 500 });
    }

    throw e;
  }
}
