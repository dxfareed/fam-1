# Religious Warplet

A generative AI application for the Warplet NFT community. This tool allows users who have minted a Warplet NFT to generate a new, unique version of their NFT image, featuring attire based on various religions, and then mint it as a new NFT on the Base network.

## How It Works

The application uses a multi-step generative AI process to create unique artwork:

1.  **NFT Ownership Verification:** The app first checks the user's verified Farcaster wallets to confirm they have minted an original Warplet NFT.
2.  **Image Analysis:** It analyzes the user's Warplet NFT image to determine the creature's apparent gender and other visual features.
3.  **AI-Powered Generation:** Based on the user's selection from a list of religions (e.g., Christian, Muslim, Jewish, Hindu, etc.), the application uses the image analysis data to generate a highly specific prompt for the AI.
4.  **Unique Artwork Creation:** The AI model creates a new image of the Warplet, complete with unique, fitting attire that corresponds to the chosen religion.
5.  **Minting:** The user can then mint their newly generated religious Warplet as a new ERC-721 NFT on the Base blockchain.

## Features

*   **Farcaster Authentication:** Securely log in with your Farcaster account.
*   **NFT Ownership Check:** Verifies that the user has minted the required NFT.
*   **Context-Aware AI Generation:** Creates unique, high-quality images based on the original NFT's features and a selected religion.
*   **NFT Minting:** Allows users to mint their generated artwork as a new NFT on the Base network.
*   **Gallery:** View all the Religious Warplets that have been created and minted by the community.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Authentication:** [Farcaster Quick Auth SDK](https://github.com/farcasterxyz/quick-auth-sdk)
*   **Generative AI:** [Google Gemini API](https://ai.google.dev/)
*   **Farcaster Data:** [Neynar API](https://neynar.com/)
*   **Blockchain Interaction:** [Wagmi](https://wagmi.sh/) & [Reown AppKit](https://docs.reown.com/appkit/overview)
*   **IPFS Pinning:** [Pinata](https://www.pinata.cloud/)
*   **Styling:** [CSS Modules](https://github.com/css-modules/css-modules)
*   **Database:** [Prisma](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later)
*   npm, yarn, or pnpm
*   A PostgreSQL database

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username_/your_project_name.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your environment variables. Create a `.env.local` file in the root of your project and add the following variables:
    ```
    NEYNAR_API_KEY=your_neynar_api_key
    NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
    DATABASE_URL="postgresql://user:password@host:port/database"
    ```
4.  Run the database migrations:
    ```sh
    npx prisma migrate dev
    ```

### Running the Application

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License.