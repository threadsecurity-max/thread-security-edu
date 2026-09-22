-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "externalPdfUrl" TEXT;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "OtpVerification" (
    "id" TEXT NOT NULL,
    "emailOrTsId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpVerification_emailOrTsId_idx" ON "OtpVerification"("emailOrTsId");
