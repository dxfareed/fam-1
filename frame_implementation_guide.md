# Technical Guide: Implementing the Generated Image Share Frame

This guide documents the implementation of the Farcaster "launch frame" created for sharing the AI-generated Warplette images. It follows the architectural pattern of separating the image generation from the frame metadata definition.

The goal of this implementation is to allow a user to share a generated image to their Farcaster feed. The shared post will display a rich frame containing the image, with a button that launches users back into this application.

---

## Part 1: The Implementation Flow

The end-to-end flow is as follows:

1.  **Trigger Share:** The user clicks the "Share" icon in the `PhotoViewer` component.
2.  **Compose Cast:** The `handleShare` function calls the Farcaster Mini-App SDK's `composeCast` action. It embeds a specially crafted URL (e.g., `https://yourapp.com/share-frame/generated?imageUrl=...`).
3.  **Crawl Frame Page:** A Farcaster client (like Warpcast) sees the URL, fetches its content, and finds the `fc:frame` meta tags. This is our "Frame Page Endpoint".
4.  **Fetch Frame Image:** The `fc:frame:image` meta tag points to our "Dynamic Image Endpoint" (e.g., `https://yourapp.com/api/frame-image/generated?imageUrl=...`). The client fetches this URL.
5.  **Render Image:** The Dynamic Image Endpoint returns the generated Warplette image, which is then displayed within the frame in the Farcaster feed.
6.  **Launch App:** The user clicks the "View in App" button on the frame, which has `action="launch"`. The client opens the mini-app at the specified `target` URL, bringing the user back to the application.

---

## Part 2: Component Breakdown

### Component A: The Dynamic Image Endpoint

This API route is responsible for serving the image that will be displayed inside the frame. It takes an `imageUrl` as a query parameter and renders it inside a standard frame dimension using `@vercel/og`.

**File Location:** `app/api/frame-image/generated/route.tsx`

```tsx
// In: app/api/frame-image/generated/route.tsx

import { ImageResponse } from 'next/og';

export const runtime = 'edge'; // Required for ImageResponse

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Get the image to display from query parameters
  const imageUrl = searchParams.get('imageUrl');

  if (!imageUrl) {
    return new Response('Missing image URL', { status: 400 });
  }

  // 2. Return the ImageResponse
  return new ImageResponse(
    (
      // Display the provided image within the frame
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#1E1E1E', // A dark background
        }}
      >
        <img
            src={imageUrl}
            alt="Generated Creature"
            width="315"
            height="315"
            style={{ borderRadius: '20px' }}
        />
      </div>
    ),
    {
      width: 600, // Standard frame aspect ratio
      height: 315,
    }
  );
}
```

### Component B: The Frame Page Endpoint

This page's sole purpose is to serve the correct Farcaster `<meta>` tags. It is the URL that is actually shared in the cast. It dynamically constructs the meta tags based on the `imageUrl` it receives in its own query parameters.

**File Location:** `app/share-frame/generated/page.tsx`

```tsx
// In: app/share-frame/generated/page.tsx

import { minikitConfig } from '@/minikit.config';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

// This function generates the metadata for the page
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // Get the image url from the search params
  const imageUrl = searchParams.imageUrl as string;

  if (!imageUrl) {
    return {
      title: 'Error: Image not found',
    };
  }

  // Construct the dynamic image URL for the frame image
  const frameImageUrl = new URL(`${minikitConfig.frame.homeUrl}/api/frame-image/generated`);
  frameImageUrl.searchParams.set('imageUrl', imageUrl);

  // The URL of your mini-app that should be launched
  const launchUrl = minikitConfig.frame.homeUrl || '/';

  return {
    title: `A new Warplet was generated!`,
    other: {
      // --- Farcaster Frame Meta Tags ---
      'fc:frame': 'vNext',
      'fc:frame:image': frameImageUrl.toString(),
      'fc:frame:button:1': 'View in App',
      'fc:frame:button:1:action': 'launch',
      'fc:frame:button:1:target': launchUrl,

      // --- Open Graph Meta Tags for fallback ---
      'og:title': `A new Warplet was generated!`,
      'og:image': frameImageUrl.toString(),
    },
  };
}

// Fallback component for direct browser navigation.
export default function Page() {
  return (
    <div>
      <h1>This is a Farcaster Frame.</h1>
      <p>View it on a Farcaster client to see it in action.</p>
    </div>
  );
}
```
**Note:** `export const dynamic = 'force-dynamic';` was added to resolve a Next.js runtime error, ensuring the page is always rendered dynamically as it depends on URL search parameters.

---

## Part 3: Triggering the Share

The process is initiated from the `PhotoViewer` component when the user decides to share their generated image.

**File Location:** `app/components/PhotoViewer.tsx`

The `handleShare` function constructs the URL for our Frame Page Endpoint (`/share-frame/generated`) and passes it to the `composeCast` function.

```tsx
// In: app/components/PhotoViewer.tsx

// ... imports

const PhotoViewer = ({ imageUrl, onBack }: PhotoViewerProps) => {
  // ... other component logic

  const handleShare = () => {
    const rootUrl = process.env.NEXT_PUBLIC_URL || 'https://your-app-url.com'; // Fallback URL
    const shareUrl = `${rootUrl}/share-frame/generated?imageUrl=${encodeURIComponent(imageUrl)}`;
    
    sdk.actions.composeCast({
      text: "Check out this cool Warplette I generated!",
      embeds: [shareUrl], // Note: embeds is an array of strings
    });
  };

  // ... component JSX
};

export default PhotoViewer;
```
This completes the loop, allowing a seamless share experience that creates a rich, interactive frame in the Farcaster feed.
