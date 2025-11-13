import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { minikitConfig } from '@/minikit.config';

//export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function generateMetadata({ searchParams }: any): Promise<Metadata> {
  const appUrl = process.env.NEXT_PUBLIC_URL || '';
  const fid = searchParams.fid;
  const imageUrl = searchParams.imageUrl;

  const imageParams = new URLSearchParams();
  if (fid) {
    imageParams.set('fid', Array.isArray(fid) ? fid[0] : fid);
  }
  if (imageUrl) {
    imageParams.set('imageUrl', Array.isArray(imageUrl) ? imageUrl[0] : imageUrl);
  }

  const frameImageUrl = `${appUrl}/api/share/frame?${imageParams.toString()}`;
 // const postUrl = `${appUrl}/`;

  const fcFrameContent = JSON.stringify({
    version: minikitConfig.frame.version,
    imageUrl: frameImageUrl,
    button: {
      title: `Generate Religious Warplet`,
      action: {
        name: `Launch ${minikitConfig.frame.name}`,
        type: "launch_frame",
      },
    },
  });

  return {
    title: minikitConfig.frame.name,
    description: minikitConfig.frame.description,
    other: {
      "fc:frame": fcFrameContent,
    },
  };
}

export default function ShareFramePage() {
  redirect('/');
}
