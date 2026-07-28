-- CreateTable
CREATE TABLE "archive_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "source_module" VARCHAR(100) NOT NULL,
    "source_entity" VARCHAR(100) NOT NULL,
    "source_record_id" UUID NOT NULL,
    "display_label" VARCHAR(500) NOT NULL,
    "snapshot_data" JSONB,
    "archived_by" UUID NOT NULL,
    "archived_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "archive_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "archive_records_tenant_id_source_module_source_entity_idx" ON "archive_records"("tenant_id", "source_module", "source_entity");

-- CreateIndex
CREATE INDEX "archive_records_archived_at_idx" ON "archive_records"("archived_at");

-- CreateIndex
CREATE UNIQUE INDEX "archive_records_tenant_id_source_module_source_entity_sourc_key" ON "archive_records"("tenant_id", "source_module", "source_entity", "source_record_id");

-- AddForeignKey
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_records" ADD CONSTRAINT "archive_records_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
