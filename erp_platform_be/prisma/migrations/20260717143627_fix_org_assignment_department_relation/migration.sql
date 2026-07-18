-- DropForeignKey
ALTER TABLE "organization_assignments" DROP CONSTRAINT "organization_assignments_department_id_fkey";

-- AddForeignKey
ALTER TABLE "organization_assignments" ADD CONSTRAINT "organization_assignments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "organization_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
