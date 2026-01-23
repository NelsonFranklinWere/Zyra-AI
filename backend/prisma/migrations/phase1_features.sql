-- Phase 1 Missing Features Migration
-- Business Profile, Social Media, WhatsApp Groups

-- Business Profile table
CREATE TABLE IF NOT EXISTS "BusinessProfile" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "description" TEXT,
    "tone" TEXT DEFAULT 'friendly',
    "workingHours" JSONB DEFAULT '{}',
    "deliveryZones" TEXT[],
    "policies" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- Social Media Accounts table
CREATE TABLE IF NOT EXISTS "SocialAccount" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "leadCapture" BOOLEAN NOT NULL DEFAULT false,
    "autoReply" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- Social Media Leads table
CREATE TABLE IF NOT EXISTS "SocialLead" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "intent" TEXT,
    "score" INTEGER DEFAULT 0,
    "status" TEXT DEFAULT 'new',
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLead_pkey" PRIMARY KEY ("id")
);

-- WhatsApp Groups table
CREATE TABLE IF NOT EXISTS "WhatsAppGroup" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "scanning" BOOLEAN NOT NULL DEFAULT false,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "insights" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppGroup_pkey" PRIMARY KEY ("id")
);

-- Add unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessProfile_orgId_key" ON "BusinessProfile"("orgId");
CREATE UNIQUE INDEX IF NOT EXISTS "SocialAccount_orgId_platform_username_key" ON "SocialAccount"("orgId", "platform", "username");
CREATE UNIQUE INDEX IF NOT EXISTS "WhatsAppGroup_orgId_groupId_key" ON "WhatsAppGroup"("orgId", "groupId");

-- Add foreign key constraints if organizations table exists
-- ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "SocialLead" ADD CONSTRAINT "SocialLead_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "WhatsAppGroup" ADD CONSTRAINT "WhatsAppGroup_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;