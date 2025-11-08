-- CreateTable
CREATE TABLE "NftCache" (
    "fid" BIGINT NOT NULL,
    "holdingNft" BOOLEAN NOT NULL,
    "nftImage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NftCache_pkey" PRIMARY KEY ("fid")
);