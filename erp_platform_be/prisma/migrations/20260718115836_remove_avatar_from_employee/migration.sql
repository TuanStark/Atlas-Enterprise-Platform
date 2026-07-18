/*
  Warnings:

  - You are about to drop the column `avatar_file_id` on the `employees` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_avatar_file_id_fkey";

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "avatar_file_id";
