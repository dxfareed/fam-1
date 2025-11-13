import React from 'react';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const w95faFontPromise = fetch(
  new URL('/fonts/W95FA/W95FA.otf', process.env.NEXT_PUBLIC_URL as string)
).then((res) => res.arrayBuffer());

export async function GET(request: NextRequest) {
  try {
    console.log('Generating frame image...');
    const w95faFont = await w95faFontPromise;
    console.log('Font loaded.');

    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    const imageUrl = searchParams.get('imageUrl');
    console.log(`Received params: fid=${fid}, imageUrl=${imageUrl}`);

    if (!fid || !imageUrl) {
      console.error('Missing fid or imageUrl parameter');
      return new Response('Missing fid or imageUrl parameter', { status: 400 });
    }

    console.log(`Fetching image from: ${imageUrl}`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`Failed to fetch image. Status: ${imageResponse.status}`);
      return new Response('Failed to fetch image', { status: 500 });
    }
    console.log('Image fetched successfully.');

    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageContentType = imageResponse.headers.get('content-type') || 'image/png';
    const imageBase64 = Buffer.from(imageArrayBuffer).toString('base64');
    const imageDataUrl = `data:${imageContentType};base64,${imageBase64}`;
    console.log(`Generated data URL with length: ${imageDataUrl.length}`);

    console.log('Generating ImageResponse...');
    const response = new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            color: '#FFFFFF',
            fontFamily: 'W95FA',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            alt="warplet"
            src={imageDataUrl}
            style={{
              width: '400px',
              height: '400px',
            }}
          />
          <div style={{ fontSize: '32px', color: '#FFFFFF', marginTop: '20px' }}>
            A Religious Warplet
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 800,
        fonts: [{ name: 'W95FA', data: w95faFont, style: 'normal' }],
        headers: {
          'Cache-Control': 'public, immutable, no-transform, max-age=86400',
        },
      },
    );
    console.log('ImageResponse generated successfully.');
    return response;
  } catch (e: any) {
    console.error(`Failed to generate frame image: ${e.message}`);
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}