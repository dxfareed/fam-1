# Technical Guide: Creating Farcaster Launch Frames with Next.js

This guide provides a comprehensive walkthrough for creating Farcaster "launch frames" using Next.js. A launch frame acts as a rich, dynamic preview in the Farcaster feed that, when clicked, launches a mini-app directly within the user's Farcaster client (like Warpcast).

This guide is based on the implementation in this project, which uses two key components:
1.  **Dynamic Image Endpoints:** API routes that generate images on-the-fly using Next.js's `@vercel/og` library.
2.  **Frame Page Endpoints:** Pages that serve the necessary Farcaster `<meta>` tags to define the frame's appearance and behavior.

---

## Part 1: The Anatomy of a Launch Frame

The end-to-end flow is as follows:

1.  **Share:** A developer shares a URL (e.g., `https://yourapp.com/share/user/123`) on Farcaster.
2.  **Crawl:** A Farcaster client sees the URL, fetches its content, and looks for special `fc:frame` meta tags.
3.  **Render Image:** The `fc:frame:image` meta tag points to an API route (e.g., `https://yourapp.com/api/frame-image/user?fid=123`). The client fetches this URL, which returns a dynamically generated image (`ImageResponse`). This image is displayed in the feed.
4.  **Render Buttons:** The `fc:frame:button:*` tags define the buttons overlaid on the image.
5.  **Launch:** The user clicks a button with `action="launch"`. The client then opens the mini-app URL specified in the `target` property of that button.

Unlike interactive frames that use `post_url` to cycle through different frames, this pattern uses the frame as a direct entry point to a richer application experience.

---

## Part 2: Step-by-Step Implementation

Here’s how to build a launch frame from scratch, following the patterns in this repository.

### Component A: The Dynamic Image Endpoint

This is an API route that returns an image. It uses JSX to define the image content, making it feel like writing a React component.

**1. Create the API Route File**

Create a file at `app/api/frame-image/template/route.tsx`.

**2. Build the Image Generator**

Add the following template code. This example generates a simple user stat card, taking a `username` and `score` from the URL query parameters.

```tsx
// In: app/api/frame-image/template/route.tsx

import { ImageResponse } from 'next/og';

export const runtime = 'edge'; // Required for ImageResponse

// Example: Fetch a custom font
const spaceMonoBold = fetch(
  new URL('/SpaceMono-Bold.ttf', process.env.NEXT_PUBLIC_URL!)
).then((res) => res.arrayBuffer());

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Get data from query parameters
  const username = searchParams.get('username') || 'Anonymous';
  const score = searchParams.get('score') || '0';
  const pfpUrl = searchParams.get('pfpUrl') || `${process.env.NEXT_PUBLIC_URL}/icon.png`;

  // 2. Wait for the font to load
  const fontData = await spaceMonoBold;

  // 3. Return the ImageResponse
  return new ImageResponse(
    (
      // Use familiar JSX and CSS-in-JS (Tailwind-like properties)
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#f0f2f5',
          fontFamily: '"Space Mono"',
          padding: '30px',
        }}
      >
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '25px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '2px solid #e5e7eb',
        }}>
            <img
                src={pfpUrl}
                alt="PFP"
                width="90"
                height="90"
                style={{ borderRadius: '50%', marginBottom: '15px' }}
            />
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>
                {username}
            </h1>
            <p style={{ fontSize: 28, margin: '10px 0 0 0', color: '#3b82f6' }}>
                Score: {score}
            </p>
        </div>
      </div>
    ),
    {
      width: 600, // Standard frame aspect ratio
      height: 315,
      fonts: [
        {
          name: 'Space Mono',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  );
}
```

### Component B: The Frame Page Endpoint

This is the page that gets shared on Farcaster. It doesn't render any visible HTML in a browser; its only job is to provide the `<meta>` tags for Farcaster clients.

**1. Create the Page File**

Create a file at `app/share-frame/template/[id]/page.tsx`. Using a dynamic segment like `[id]` allows you to create unique frames for different users, items, etc.

**2. Add the Metadata**

Add the following template code. This page uses Next.js's `generateMetadata` to dynamically create the meta tags.

```tsx
// In: app/share-frame/template/[id]/page.tsx

import { Metadata } from 'next';

type Props = {
  params: { id: string };
};

// This function generates the metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const appUrl = process.env.NEXT_PUBLIC_URL;

  // In a real app, you would fetch data based on the `id`
  // For this example, we'll use mock data.
  const mockUserData = {
    fid: id,
    username: 'testuser',
    score: '12,345',
    pfpUrl: `${appUrl}/icon.png`, // Use a default or fetched image
  };

  // Construct the dynamic image URL
  const imageUrl = new URL(`${appUrl}/api/frame-image/template`);
  imageUrl.searchParams.set('username', mockUserData.username);
  imageUrl.searchParams.set('score', mockUserData.score);
  imageUrl.searchParams.set('pfpUrl', mockUserData.pfpUrl);

  // The URL of your mini-app that should be launched
  const launchUrl = `${appUrl}/dashboard/game?fid=${id}`;

  return {
    title: `My Awesome Frame for ${mockUserData.username}`,
    other: {
      // --- Farcaster Frame Meta Tags ---
      'fc:frame': 'vNext',
      'fc:frame:image': imageUrl.toString(),
      'fc:frame:button:1': 'Play Now!',
      'fc:frame:button:1:action': 'launch',
      'fc:frame:button:1:target': launchUrl,

      // --- Open Graph Meta Tags for fallback ---
      'og:title': `My Awesome Frame for ${mockUserData.username}`,
      'og:image': imageUrl.toString(),
    },
  };
}

// This page component is not rendered in a browser when a frame is viewed.
// It's good practice to have a fallback for direct navigation.
export default function Page({ params }: Props) {
  return (
    <div>
      <h1>This is a Farcaster Frame.</h1>
      <p>View it on a Farcaster client to see it in action.</p>
      <p>ID: {params.id}</p>
    </div>
  );
}
```

---

## Part 3: How to Use and Test

1.  **Start your Next.js server.**
2.  **Get the URL:** Construct the URL for your frame page, e.g., `http://localhost:3000/share-frame/template/456`.
3.  **Test:** Use a frame validator tool or share the URL on a Farcaster client that supports launch frames (like Warpcast) to see your frame in action. When you click the "Play Now!" button, it should launch your mini-app at the specified `target` URL.

By following this pattern, you can create compelling entry points into your application, driving engagement directly from the Farcaster feed.
