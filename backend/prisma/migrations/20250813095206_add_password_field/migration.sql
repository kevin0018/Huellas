/*
  Warnings:

  - You are about to drop the column `recommended_age_months` on the `ProcedureSchedule` table. All the data in the column will be lost.
  - Made the column `reason` on table `Appointment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `recommended_vaccines_age` to the `ProcedureSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Appointment` MODIFY `reason` ENUM('VACCINATION', 'GENERAL_CHECKUP', 'ANTI_PARASITIC_PRESCRIPTION', 'OPERATION', 'OTHERS') NOT NULL;

-- AlterTable
ALTER TABLE `ProcedureSchedule` DROP COLUMN `recommended_age_months`,
    ADD COLUMN `recommended_vaccines_age` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `password` VARCHAR(191) NOT NULL;
