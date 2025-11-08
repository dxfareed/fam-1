CREATE TABLE "FamilyCache" (
    "fid" BIGINT NOT NULL,
    "pfpUrl" TEXT,
    "family" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FamilyCache_pkey" PRIMARY KEY ("fid")
);

CREATE TABLE "UserCache" (
    "fid" BIGINT NOT NULL,
    "userProfile" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserCache_pkey" PRIMARY KEY ("fid")
);
