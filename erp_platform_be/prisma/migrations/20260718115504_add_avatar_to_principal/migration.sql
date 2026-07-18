-- AlterTable
ALTER TABLE "principals" ADD COLUMN     "avatar_file_id" UUID;

-- AddForeignKey
ALTER TABLE "principals" ADD CONSTRAINT "principals_avatar_file_id_fkey" FOREIGN KEY ("avatar_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
