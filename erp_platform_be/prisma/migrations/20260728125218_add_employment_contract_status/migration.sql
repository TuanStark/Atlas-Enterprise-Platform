-- CreateEnum
CREATE TYPE "contract_status" AS ENUM ('draft', 'pending_signature', 'active', 'expired', 'terminated');

-- AlterTable
ALTER TABLE "employment_contracts" ADD COLUMN     "base_salary" DECIMAL(15,2),
ADD COLUMN     "contract_template_id" UUID,
ADD COLUMN     "status" "contract_status" NOT NULL DEFAULT 'draft',
ADD COLUMN     "working_hours" VARCHAR(255);

-- CreateTable
CREATE TABLE "contract_annexes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employment_contract_id" UUID NOT NULL,
    "annex_number" VARCHAR(100) NOT NULL,
    "content" TEXT,
    "signed_date" DATE,
    "effective_date" DATE NOT NULL,
    "file_id" UUID,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "contract_annexes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "contract_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "employment_contracts" ADD CONSTRAINT "employment_contracts_contract_template_id_fkey" FOREIGN KEY ("contract_template_id") REFERENCES "contract_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_annexes" ADD CONSTRAINT "contract_annexes_employment_contract_id_fkey" FOREIGN KEY ("employment_contract_id") REFERENCES "employment_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_annexes" ADD CONSTRAINT "contract_annexes_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
