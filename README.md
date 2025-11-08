# Warplet Family Tree

A web application that visualizes your Farcaster social graph in a unique and engaging family tree format. This application identifies the top members of your Farcaster family who hold a specific "Warplet" NFT and displays them in a hierarchical layout, ranked by their affinity score.

## Features

*   **Farcaster Authentication:** Securely log in with your Farcaster account.
*   **Family Tree Visualization:** View your Farcaster family in a 1-2-3 hierarchical layout.
*   **NFT Holder Identification:** Automatically identifies which members of your family hold a specific NFT.
*   **Affinity-Based Ranking:** Ranks NFT holders based on their mutual affinity score to determine their position in the family tree.
*   **Modern UI/UX:** A clean and modern interface with a dark theme and engaging animations.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Authentication:** [Farcaster Quick Auth SDK](https://github.com/farcasterxyz/quick-auth-sdk)
*   **Farcaster Data:** [Neynar API](https://neynar.com/)
*   **NFT Data:** [Alchemy API](https://www.alchemy.com/) & [Ethers.js](https://ethers.io/)
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