-- CreateEnum
CREATE TYPE "tenant_status" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('trial', 'active', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "principal_type" AS ENUM ('user', 'service_account');

-- CreateEnum
CREATE TYPE "principal_status" AS ENUM ('active', 'inactive', 'locked');

-- CreateEnum
CREATE TYPE "credential_type" AS ENUM ('password', 'oauth', 'saml', 'oidc');

-- CreateEnum
CREATE TYPE "mfa_type" AS ENUM ('totp', 'email', 'sms');

-- CreateEnum
CREATE TYPE "effect_type" AS ENUM ('allow', 'deny');

-- CreateEnum
CREATE TYPE "feature_flag_status" AS ENUM ('enabled', 'disabled');

-- CreateEnum
CREATE TYPE "workflow_status" AS ENUM ('draft', 'active', 'inactive');

-- CreateEnum
CREATE TYPE "workflow_step_type" AS ENUM ('start', 'approval', 'task', 'notification', 'end');

-- CreateEnum
CREATE TYPE "workflow_instance_status" AS ENUM ('running', 'completed', 'cancelled', 'rejected');

-- CreateEnum
CREATE TYPE "workflow_task_status" AS ENUM ('pending', 'approved', 'rejected', 'skipped');

-- CreateEnum
CREATE TYPE "assignment_type" AS ENUM ('user', 'role', 'manager', 'department_manager', 'dynamic');

-- CreateEnum
CREATE TYPE "notification_channel" AS ENUM ('in_app', 'email', 'sms', 'push', 'webhook');

-- CreateEnum
CREATE TYPE "notification_status" AS ENUM ('pending', 'sending', 'sent', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "file_storage_provider" AS ENUM ('local', 's3', 'minio', 'azure_blob', 'gcs');

-- CreateEnum
CREATE TYPE "file_visibility" AS ENUM ('private', 'internal', 'public');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'export', 'import');

-- CreateEnum
CREATE TYPE "comment_status" AS ENUM ('active', 'edited', 'deleted');

-- CreateEnum
CREATE TYPE "custom_field_type" AS ENUM ('text', 'textarea', 'number', 'decimal', 'boolean', 'date', 'datetime', 'email', 'phone', 'url', 'select', 'multiselect', 'json');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "marital_status" AS ENUM ('single', 'married', 'divorced', 'widowed');

-- CreateEnum
CREATE TYPE "employment_status" AS ENUM ('probation', 'active', 'suspended', 'resigned', 'terminated', 'retired');

-- CreateEnum
CREATE TYPE "assignment_status" AS ENUM ('active', 'ended');

-- CreateEnum
CREATE TYPE "attendance_status" AS ENUM ('present', 'absent', 'late', 'early_leave', 'overtime', 'holiday');

-- CreateEnum
CREATE TYPE "attendance_source" AS ENUM ('manual', 'biometric', 'mobile', 'web', 'api');

-- CreateEnum
CREATE TYPE "leave_request_status" AS ENUM ('draft', 'pending', 'approved', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "salary_component_type" AS ENUM ('earning', 'allowance', 'deduction', 'employer_contribution');

-- CreateEnum
CREATE TYPE "payroll_status" AS ENUM ('draft', 'calculating', 'calculated', 'approved', 'paid', 'cancelled');

-- CreateEnum
CREATE TYPE "requisition_status" AS ENUM ('draft', 'approved', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('applied', 'screening', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "interview_status" AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "offer_status" AS ENUM ('draft', 'sent', 'accepted', 'declined', 'expired');

-- CreateEnum
CREATE TYPE "review_status" AS ENUM ('draft', 'self_review', 'manager_review', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "training_status" AS ENUM ('planned', 'ongoing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "enrollment_status" AS ENUM ('enrolled', 'attended', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "asset_status" AS ENUM ('available', 'assigned', 'maintenance', 'disposed');

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(18,2),
    "billing_cycle_month" INTEGER,
    "max_users" INTEGER,
    "max_storage_gb" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "legal_name" VARCHAR(255),
    "tax_code" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "logo_file_id" UUID,
    "timezone" VARCHAR(100),
    "locale" VARCHAR(20),
    "currency" VARCHAR(10),
    "status" "tenant_status",
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,
    "version" INTEGER,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_domains" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "is_primary" BOOLEAN,
    "verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "tenant_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "subscription_plan_id" UUID NOT NULL,
    "status" "subscription_status",
    "starts_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ,
    "auto_renew" BOOLEAN,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "tenant_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "setting_key" VARCHAR(150),
    "setting_value" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "principals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "type" "principal_type" NOT NULL,
    "status" "principal_status" NOT NULL,
    "display_name" VARCHAR(255),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,
    "version" INTEGER,

    CONSTRAINT "principals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "principal_id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "email_verified" BOOLEAN,
    "phone_verified" BOOLEAN,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "tenant_id" UUID NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credentials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "principal_id" UUID NOT NULL,
    "type" "credential_type",
    "password_hash" TEXT,
    "password_changed_at" TIMESTAMPTZ,
    "password_expires_at" TIMESTAMPTZ,
    "failed_attempts" INTEGER,
    "locked_until" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "principal_id" UUID NOT NULL,
    "refresh_token_id" UUID,
    "ip_address" VARCHAR(100),
    "user_agent" TEXT,
    "device_name" VARCHAR(255),
    "expires_at" TIMESTAMPTZ,
    "revoked_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mfa_methods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "principal_id" UUID NOT NULL,
    "type" "mfa_type",
    "secret" TEXT,
    "is_default" BOOLEAN,
    "enabled" BOOLEAN,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "mfa_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "principal_id" UUID NOT NULL,
    "name" VARCHAR(255),
    "key_hash" TEXT,
    "expires_at" TIMESTAMPTZ,
    "last_used_at" TIMESTAMPTZ,
    "revoked_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "principal_id" UUID NOT NULL,
    "token_hash" TEXT,
    "expires_at" TIMESTAMPTZ,
    "revoked_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150),

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100),

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150),

    CONSTRAINT "permission_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "permission_group_id" UUID,
    "resource_id" UUID NOT NULL,
    "action_id" UUID NOT NULL,
    "code" VARCHAR(150) NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(100),
    "name" VARCHAR(150),
    "description" TEXT,
    "is_system" BOOLEAN,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "effect" "effect_type",

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "principal_roles" (
    "principal_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "scope_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ,

    CONSTRAINT "principal_roles_pkey" PRIMARY KEY ("principal_id","role_id","scope_id")
);

-- CreateTable
CREATE TABLE "principal_permissions" (
    "principal_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "scope_id" UUID NOT NULL,
    "effect" "effect_type",

    CONSTRAINT "principal_permissions_pkey" PRIMARY KEY ("principal_id","permission_id","scope_id")
);

-- CreateTable
CREATE TABLE "role_hierarchies" (
    "parent_role_id" UUID NOT NULL,
    "child_role_id" UUID NOT NULL,

    CONSTRAINT "role_hierarchies_pkey" PRIMARY KEY ("parent_role_id","child_role_id")
);

-- CreateTable
CREATE TABLE "scopes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(100),
    "name" VARCHAR(150),

    CONSTRAINT "scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,
    "version" INTEGER,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_unit_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "organization_unit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_units" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "parent_unit_id" UUID,
    "unit_type_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "path" VARCHAR(1000),
    "level" INTEGER,
    "sort_order" INTEGER,
    "is_active" BOOLEAN,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,
    "version" INTEGER,

    CONSTRAINT "organization_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "code" VARCHAR(50),
    "name" VARCHAR(150),
    "description" TEXT,
    "level" INTEGER,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "code" VARCHAR(50),
    "name" VARCHAR(150),
    "description" TEXT,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_calendars" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(100),
    "timezone" VARCHAR(100),
    "work_days" JSONB,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "organization_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "config_key" VARCHAR(150) NOT NULL,
    "config_value" JSONB,
    "description" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150),
    "status" "feature_flag_status",
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "numbering_sequences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "code" VARCHAR(100),
    "prefix" VARCHAR(30),
    "suffix" VARCHAR(30),
    "next_number" BIGINT,
    "padding" INTEGER,
    "reset_rule" VARCHAR(30),
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "numbering_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localization_resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "locale" VARCHAR(20),
    "resource_key" VARCHAR(255),
    "resource_value" TEXT,

    CONSTRAINT "localization_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "code" VARCHAR(100),
    "subject" VARCHAR(255),
    "body" TEXT,
    "language" VARCHAR(20),
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_calendars" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "code" VARCHAR(100),
    "name" VARCHAR(255),
    "timezone" VARCHAR(100),
    "work_days" JSONB,

    CONSTRAINT "system_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "calendar_id" UUID,
    "holiday_date" DATE,
    "name" VARCHAR(255),
    "recurring" BOOLEAN,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "version" INTEGER DEFAULT 1,
    "status" "workflow_status" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflow_definition_id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "step_type" "workflow_step_type" NOT NULL,
    "sequence_no" INTEGER,
    "assignment_type" "assignment_type",
    "assignment_config" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_transitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflow_definition_id" UUID NOT NULL,
    "from_step_id" UUID NOT NULL,
    "to_step_id" UUID NOT NULL,
    "transition_name" VARCHAR(100),
    "condition_expression" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "workflow_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflow_definition_id" UUID NOT NULL,
    "target_record_id" UUID NOT NULL,
    "current_step_id" UUID,
    "status" "workflow_instance_status",
    "started_by_principal_id" UUID,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflow_instance_id" UUID NOT NULL,
    "workflow_step_id" UUID NOT NULL,
    "assignee_principal_id" UUID,
    "status" "workflow_task_status",
    "due_at" TIMESTAMPTZ,
    "remind_at" TIMESTAMPTZ,
    "priority" INTEGER,
    "assigned_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "comment" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "workflow_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_histories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflow_instance_id" UUID NOT NULL,
    "workflow_step_id" UUID,
    "actor_principal_id" UUID,
    "action" VARCHAR(100),
    "from_status" VARCHAR(50),
    "to_status" VARCHAR(50),
    "comment" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "workflow_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255),
    "channel" "notification_channel",
    "subject" VARCHAR(255),
    "body" TEXT,
    "language" VARCHAR(20),
    "is_active" BOOLEAN,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "template_id" UUID,
    "target_module" VARCHAR(100),
    "target_entity" VARCHAR(100),
    "target_record_id" UUID,
    "title" VARCHAR(255),
    "message" TEXT,
    "metadata" JSONB,
    "created_by_principal_id" UUID,
    "scheduled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_recipients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "notification_id" UUID NOT NULL,
    "principal_id" UUID NOT NULL,
    "is_read" BOOLEAN,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "notification_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_id" UUID NOT NULL,
    "channel" "notification_channel",
    "status" "notification_status",
    "provider" VARCHAR(100),
    "provider_message_id" VARCHAR(255),
    "retry_count" INTEGER,
    "sent_at" TIMESTAMPTZ,
    "delivered_at" TIMESTAMPTZ,
    "failed_at" TIMESTAMPTZ,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(100),
    "file_name" VARCHAR(255),
    "mime_type" VARCHAR(150),
    "extension" VARCHAR(20),
    "visibility" "file_visibility",
    "current_version" INTEGER,
    "size" BIGINT,
    "checksum" VARCHAR(255),
    "metadata" JSONB,
    "created_by_principal_id" UUID,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "file_id" UUID NOT NULL,
    "version" INTEGER,
    "storage_provider" "file_storage_provider",
    "storage_key" TEXT,
    "size" BIGINT,
    "checksum" VARCHAR(255),
    "uploaded_by_principal_id" UUID,
    "uploaded_at" TIMESTAMPTZ,

    CONSTRAINT "file_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "file_id" UUID NOT NULL,
    "target_module" VARCHAR(100),
    "target_entity" VARCHAR(100),
    "target_record_id" UUID,
    "attached_by_principal_id" UUID,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "file_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "target_module" VARCHAR(100),
    "target_entity" VARCHAR(100),
    "target_record_id" UUID,
    "action" "audit_action",
    "actor_principal_id" UUID,
    "ip_address" VARCHAR(100),
    "user_agent" TEXT,
    "request_id" VARCHAR(255),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_details" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "audit_log_id" UUID NOT NULL,
    "field_name" VARCHAR(150),
    "old_value" TEXT,
    "new_value" TEXT,

    CONSTRAINT "audit_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_exports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "exported_by_principal_id" UUID,
    "file_id" UUID,
    "exported_at" TIMESTAMPTZ,
    "filters" JSONB,

    CONSTRAINT "audit_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "target_module" VARCHAR(100) NOT NULL,
    "target_entity" VARCHAR(100) NOT NULL,
    "target_record_id" UUID NOT NULL,
    "parent_comment_id" UUID,
    "author_principal_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "status" "comment_status" DEFAULT 'active',
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_mentions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comment_id" UUID NOT NULL,
    "principal_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "comment_mentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_reactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comment_id" UUID NOT NULL,
    "principal_id" UUID NOT NULL,
    "reaction" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "comment_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_definitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "target_module" VARCHAR(100) NOT NULL,
    "target_entity" VARCHAR(100) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "field_type" "custom_field_type" NOT NULL,
    "is_required" BOOLEAN DEFAULT false,
    "default_value" TEXT,
    "validation_rules" JSONB,
    "display_order" INTEGER,
    "metadata" JSONB,
    "created_by_principal_id" UUID,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "custom_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_options" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "custom_field_definition_id" UUID NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER,
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "custom_field_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_values" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "custom_field_definition_id" UUID NOT NULL,
    "target_record_id" UUID NOT NULL,
    "value" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "custom_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(100),
    "name" VARCHAR(150),
    "color" VARCHAR(20),
    "description" TEXT,
    "created_by_principal_id" UUID,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tag_id" UUID NOT NULL,
    "target_module" VARCHAR(100),
    "target_entity" VARCHAR(100),
    "target_record_id" UUID,
    "assigned_by_principal_id" UUID,
    "assigned_at" TIMESTAMPTZ,

    CONSTRAINT "tag_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employee_no" VARCHAR(50) NOT NULL,
    "principal_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "preferred_name" VARCHAR(100),
    "gender" "gender",
    "date_of_birth" DATE,
    "marital_status" "marital_status",
    "nationality" VARCHAR(100),
    "national_id" VARCHAR(100),
    "passport_no" VARCHAR(100),
    "tax_number" VARCHAR(100),
    "avatar_file_id" UUID,
    "status" VARCHAR(30),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employee_id" UUID NOT NULL,
    "contact_type" VARCHAR(30),
    "value" VARCHAR(255),
    "is_primary" BOOLEAN,
    "verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "employee_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_addresses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employee_id" UUID NOT NULL,
    "address_type" VARCHAR(30),
    "country" VARCHAR(100),
    "state" VARCHAR(100),
    "city" VARCHAR(100),
    "district" VARCHAR(100),
    "ward" VARCHAR(100),
    "address_line" TEXT,
    "postal_code" VARCHAR(30),
    "is_primary" BOOLEAN,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "employee_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_emergency_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employee_id" UUID NOT NULL,
    "full_name" VARCHAR(255),
    "relationship" VARCHAR(100),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "address" TEXT,
    "priority" INTEGER,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "employee_emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employee_id" UUID NOT NULL,
    "document_type" VARCHAR(100),
    "document_number" VARCHAR(100),
    "issued_date" DATE,
    "expiry_date" DATE,
    "issued_place" VARCHAR(255),
    "file_id" UUID,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "employment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "duration_month" INTEGER,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "contract_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "employment_type_id" UUID NOT NULL,
    "employee_code" VARCHAR(50) NOT NULL,
    "hire_date" DATE NOT NULL,
    "probation_start_date" DATE,
    "probation_end_date" DATE,
    "confirmation_date" DATE,
    "termination_date" DATE,
    "status" "employment_status" NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "employments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employment_id" UUID NOT NULL,
    "contract_type_id" UUID NOT NULL,
    "contract_number" VARCHAR(100) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "signed_date" DATE,
    "file_id" UUID,
    "is_current" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "employment_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_status_histories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employment_id" UUID NOT NULL,
    "from_status" "employment_status",
    "to_status" "employment_status",
    "effective_date" DATE NOT NULL,
    "reason" TEXT,
    "changed_by_principal_id" UUID,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "employment_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_titles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "job_titles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "address" TEXT,
    "timezone" VARCHAR(100),
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "work_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employment_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "job_title_id" UUID,
    "manager_employment_id" UUID,
    "work_location_id" UUID,
    "cost_center_id" UUID,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "is_primary" BOOLEAN DEFAULT true,
    "status" "assignment_status" DEFAULT 'active',
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "organization_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "break_minutes" INTEGER DEFAULT 60,
    "is_flexible" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employment_id" UUID NOT NULL,
    "shift_id" UUID NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "is_primary" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "shift_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employment_id" UUID NOT NULL,
    "shift_assignment_id" UUID,
    "attendance_date" DATE NOT NULL,
    "check_in_at" TIMESTAMPTZ,
    "check_out_at" TIMESTAMPTZ,
    "worked_minutes" INTEGER,
    "overtime_minutes" INTEGER DEFAULT 0,
    "late_minutes" INTEGER DEFAULT 0,
    "early_leave_minutes" INTEGER DEFAULT 0,
    "status" "attendance_status",
    "source" "attendance_source",
    "device_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_adjustments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attendance_record_id" UUID NOT NULL,
    "requested_by_principal_id" UUID,
    "approved_by_principal_id" UUID,
    "reason" TEXT,
    "old_check_in" TIMESTAMPTZ,
    "new_check_in" TIMESTAMPTZ,
    "old_check_out" TIMESTAMPTZ,
    "new_check_out" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "attendance_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_devices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50),
    "name" VARCHAR(150),
    "device_type" VARCHAR(50),
    "location" VARCHAR(255),
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "attendance_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "is_paid" BOOLEAN DEFAULT true,
    "requires_attachment" BOOLEAN DEFAULT false,
    "color" VARCHAR(20),
    "description" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_policies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "employment_type_id" UUID,
    "annual_days" DECIMAL(5,2),
    "max_consecutive_days" INTEGER,
    "carry_forward_limit" DECIMAL(5,2),
    "requires_approval" BOOLEAN DEFAULT true,
    "effective_from" DATE,
    "effective_to" DATE,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "leave_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employment_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "leave_year" INTEGER NOT NULL,
    "entitled_days" DECIMAL(5,2),
    "used_days" DECIMAL(5,2),
    "pending_days" DECIMAL(5,2),
    "remaining_days" DECIMAL(5,2),
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employment_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "workflow_instance_id" UUID,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_days" DECIMAL(5,2) NOT NULL,
    "reason" TEXT,
    "status" "leave_request_status",
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "leave_balance_id" UUID NOT NULL,
    "leave_request_id" UUID,
    "transaction_type" VARCHAR(30),
    "days" DECIMAL(5,2),
    "description" TEXT,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "leave_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_structures" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "salary_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_components" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "component_type" "salary_component_type",
    "calculation_type" VARCHAR(30),
    "default_amount" DECIMAL(18,2),
    "taxable" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "salary_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salary_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employment_id" UUID NOT NULL,
    "salary_structure_id" UUID NOT NULL,
    "effective_from" DATE,
    "effective_to" DATE,
    "base_salary" DECIMAL(18,2),
    "currency" VARCHAR(10),
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "employee_salary_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_periods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50),
    "start_date" DATE,
    "end_date" DATE,
    "payment_date" DATE,
    "status" "payroll_status",
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "payroll_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "payroll_period_id" UUID NOT NULL,
    "employment_id" UUID NOT NULL,
    "gross_salary" DECIMAL(18,2),
    "total_allowance" DECIMAL(18,2),
    "total_deduction" DECIMAL(18,2),
    "net_salary" DECIMAL(18,2),
    "status" "payroll_status",
    "payslip_file_id" UUID,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payroll_id" UUID NOT NULL,
    "salary_component_id" UUID NOT NULL,
    "amount" DECIMAL(18,2),
    "remark" TEXT,

    CONSTRAINT "payroll_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_requisitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "department_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "requested_by_employment_id" UUID,
    "quantity" INTEGER DEFAULT 1,
    "status" "requisition_status",
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "job_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_postings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "requisition_id" UUID NOT NULL,
    "title" VARCHAR(200),
    "description" TEXT,
    "published_at" TIMESTAMPTZ,
    "expired_at" TIMESTAMPTZ,
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "full_name" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "source" VARCHAR(100),
    "resume_file_id" UUID,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "job_posting_id" UUID NOT NULL,
    "status" "application_status",
    "applied_at" TIMESTAMPTZ,
    "current_stage" VARCHAR(100),

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "interviewer_employment_id" UUID,
    "scheduled_at" TIMESTAMPTZ,
    "location" VARCHAR(255),
    "meeting_url" TEXT,
    "result" VARCHAR(100),
    "status" "interview_status",

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "offered_salary" DECIMAL(18,2),
    "currency" VARCHAR(10),
    "start_date" DATE,
    "status" "offer_status",
    "offer_file_id" UUID,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hiring_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "employee_id" UUID,
    "employment_id" UUID,
    "hired_at" TIMESTAMPTZ,

    CONSTRAINT "hiring_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_cycles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "performance_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_ratings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(20),
    "name" VARCHAR(100),
    "score" DECIMAL(5,2),
    "description" TEXT,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "performance_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employment_id" UUID NOT NULL,
    "performance_cycle_id" UUID NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "target_value" DECIMAL(18,2),
    "weight" DECIMAL(5,2),
    "due_date" DATE,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "performance_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_goal_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "goal_id" UUID NOT NULL,
    "progress" DECIMAL(5,2),
    "note" TEXT,
    "updated_by_principal_id" UUID,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "performance_goal_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employment_id" UUID NOT NULL,
    "reviewer_employment_id" UUID,
    "performance_cycle_id" UUID NOT NULL,
    "workflow_instance_id" UUID,
    "overall_rating_id" UUID,
    "overall_score" DECIMAL(5,2),
    "status" "review_status",
    "comment" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_review_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "performance_review_id" UUID NOT NULL,
    "goal_id" UUID,
    "criteria" VARCHAR(255),
    "rating_id" UUID,
    "score" DECIMAL(5,2),
    "comment" TEXT,

    CONSTRAINT "performance_review_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "category" VARCHAR(100),
    "duration_hours" DECIMAL(6,2),
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "training_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "instructor_employment_id" UUID,
    "start_date" DATE,
    "end_date" DATE,
    "location" VARCHAR(255),
    "capacity" INTEGER,
    "status" "training_status",
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employment_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "enrolled_at" TIMESTAMPTZ,
    "status" "enrollment_status",
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "training_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enrollment_id" UUID NOT NULL,
    "score" DECIMAL(5,2),
    "passed" BOOLEAN,
    "feedback" TEXT,
    "evaluated_by_employment_id" UUID,
    "evaluated_at" TIMESTAMPTZ,

    CONSTRAINT "training_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_certificates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "certificate_no" VARCHAR(100),
    "issued_date" DATE,
    "expiry_date" DATE,
    "file_id" UUID,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "training_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "asset_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "asset_code" VARCHAR(100) NOT NULL,
    "asset_name" VARCHAR(200),
    "serial_number" VARCHAR(200),
    "manufacturer" VARCHAR(150),
    "model" VARCHAR(150),
    "purchase_date" DATE,
    "purchase_price" DECIMAL(18,2),
    "warranty_expiry" DATE,
    "current_status" "asset_status",
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "employment_id" UUID NOT NULL,
    "assigned_by_principal_id" UUID,
    "assigned_at" TIMESTAMPTZ NOT NULL,
    "expected_return_at" TIMESTAMPTZ,
    "actual_return_at" TIMESTAMPTZ,
    "assignment_status" "assignment_status",
    "note" TEXT,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "asset_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_returns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "returned_by_principal_id" UUID,
    "returned_at" TIMESTAMPTZ,
    "condition_note" TEXT,
    "damage_cost" DECIMAL(18,2),
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "asset_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_maintenances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "maintenance_type" VARCHAR(100),
    "vendor" VARCHAR(255),
    "cost" DECIMAL(18,2),
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "note" TEXT,

    CONSTRAINT "asset_maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_disposals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "disposed_at" TIMESTAMPTZ,
    "disposal_method" VARCHAR(100),
    "disposal_value" DECIMAL(18,2),
    "reason" TEXT,

    CONSTRAINT "asset_disposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_code_key" ON "tenants"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_domains_domain_key" ON "tenant_domains"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_settings_tenant_id_setting_key_key" ON "tenant_settings"("tenant_id", "setting_key");

-- CreateIndex
CREATE INDEX "principals_tenant_id_idx" ON "principals"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_principal_id_key" ON "users"("principal_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_username_key" ON "users"("tenant_id", "username");

-- CreateIndex
CREATE UNIQUE INDEX "resources_code_key" ON "resources"("code");

-- CreateIndex
CREATE UNIQUE INDEX "actions_code_key" ON "actions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permission_groups_code_key" ON "permission_groups"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_code_key" ON "roles"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "scopes_code_key" ON "scopes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_tenant_id_code_key" ON "organizations"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "organization_unit_types_code_key" ON "organization_unit_types"("code");

-- CreateIndex
CREATE INDEX "organization_units_parent_unit_id_idx" ON "organization_units"("parent_unit_id");

-- CreateIndex
CREATE INDEX "organization_units_path_idx" ON "organization_units"("path");

-- CreateIndex
CREATE UNIQUE INDEX "organization_units_organization_id_code_key" ON "organization_units"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "positions_organization_id_code_key" ON "positions"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "configurations_tenant_id_config_key_key" ON "configurations"("tenant_id", "config_key");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_tenant_id_code_key" ON "feature_flags"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "localization_resources_locale_resource_key_key" ON "localization_resources"("locale", "resource_key");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_definitions_tenant_id_code_version_key" ON "workflow_definitions"("tenant_id", "code", "version");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_steps_workflow_definition_id_code_key" ON "workflow_steps"("workflow_definition_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_tenant_id_code_language_key" ON "notification_templates"("tenant_id", "code", "language");

-- CreateIndex
CREATE UNIQUE INDEX "notification_recipients_notification_id_principal_id_key" ON "notification_recipients"("notification_id", "principal_id");

-- CreateIndex
CREATE UNIQUE INDEX "file_versions_file_id_version_key" ON "file_versions"("file_id", "version");

-- CreateIndex
CREATE INDEX "file_attachments_target_module_target_entity_target_record__idx" ON "file_attachments"("target_module", "target_entity", "target_record_id");

-- CreateIndex
CREATE INDEX "audit_logs_target_module_target_entity_target_record_id_idx" ON "audit_logs"("target_module", "target_entity", "target_record_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_principal_id_idx" ON "audit_logs"("actor_principal_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "comments_target_module_target_entity_target_record_id_idx" ON "comments"("target_module", "target_entity", "target_record_id");

-- CreateIndex
CREATE INDEX "comments_parent_comment_id_idx" ON "comments"("parent_comment_id");

-- CreateIndex
CREATE INDEX "comments_author_principal_id_idx" ON "comments"("author_principal_id");

-- CreateIndex
CREATE UNIQUE INDEX "comment_mentions_comment_id_principal_id_key" ON "comment_mentions"("comment_id", "principal_id");

-- CreateIndex
CREATE UNIQUE INDEX "comment_reactions_comment_id_principal_id_reaction_key" ON "comment_reactions"("comment_id", "principal_id", "reaction");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_definitions_tenant_id_target_module_target_ent_key" ON "custom_field_definitions"("tenant_id", "target_module", "target_entity", "code");

-- CreateIndex
CREATE INDEX "custom_field_values_target_record_id_idx" ON "custom_field_values"("target_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_values_custom_field_definition_id_target_recor_key" ON "custom_field_values"("custom_field_definition_id", "target_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tenant_id_code_key" ON "tags"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "tag_assignments_target_module_target_entity_target_record_i_idx" ON "tag_assignments"("target_module", "target_entity", "target_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_assignments_tag_id_target_module_target_entity_target_r_key" ON "tag_assignments"("tag_id", "target_module", "target_entity", "target_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_principal_id_key" ON "employees"("principal_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenant_id_employee_no_key" ON "employees"("tenant_id", "employee_no");

-- CreateIndex
CREATE UNIQUE INDEX "employment_types_tenant_id_code_key" ON "employment_types"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "contract_types_tenant_id_code_key" ON "contract_types"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "employments_tenant_id_employee_code_key" ON "employments"("tenant_id", "employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "job_titles_tenant_id_code_key" ON "job_titles"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "work_locations_tenant_id_code_key" ON "work_locations"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "organization_assignments_employment_id_effective_from_idx" ON "organization_assignments"("employment_id", "effective_from");

-- CreateIndex
CREATE INDEX "organization_assignments_department_id_idx" ON "organization_assignments"("department_id");

-- CreateIndex
CREATE INDEX "organization_assignments_manager_employment_id_idx" ON "organization_assignments"("manager_employment_id");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_tenant_id_code_key" ON "shifts"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "attendance_records_attendance_date_idx" ON "attendance_records"("attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_employment_id_attendance_date_key" ON "attendance_records"("employment_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_tenant_id_code_key" ON "leave_types"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employment_id_leave_type_id_leave_year_key" ON "leave_balances"("employment_id", "leave_type_id", "leave_year");

-- CreateIndex
CREATE UNIQUE INDEX "salary_structures_tenant_id_code_key" ON "salary_structures"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "performance_cycles_tenant_id_code_key" ON "performance_cycles"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "training_courses_tenant_id_code_key" ON "training_courses"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "training_results_enrollment_id_key" ON "training_results"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_categories_tenant_id_code_key" ON "asset_categories"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "assets_serial_number_idx" ON "assets"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "assets_tenant_id_asset_code_key" ON "assets"("tenant_id", "asset_code");

-- CreateIndex
CREATE UNIQUE INDEX "asset_returns_assignment_id_key" ON "asset_returns"("assignment_id");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_logo_file_id_fkey" FOREIGN KEY ("logo_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_domains" ADD CONSTRAINT "tenant_domains_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "principals" ADD CONSTRAINT "principals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_refresh_token_id_fkey" FOREIGN KEY ("refresh_token_id") REFERENCES "refresh_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mfa_methods" ADD CONSTRAINT "mfa_methods_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_permission_group_id_fkey" FOREIGN KEY ("permission_group_id") REFERENCES "permission_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "principal_roles" ADD CONSTRAINT "principal_roles_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "principal_roles" ADD CONSTRAINT "principal_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "principal_roles" ADD CONSTRAINT "principal_roles_scope_id_fkey" FOREIGN KEY ("scope_id") REFERENCES "scopes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "principal_permissions" ADD CONSTRAINT "principal_permissions_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "principal_permissions" ADD CONSTRAINT "principal_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "principal_permissions" ADD CONSTRAINT "principal_permissions_scope_id_fkey" FOREIGN KEY ("scope_id") REFERENCES "scopes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_hierarchies" ADD CONSTRAINT "role_hierarchies_parent_role_id_fkey" FOREIGN KEY ("parent_role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_hierarchies" ADD CONSTRAINT "role_hierarchies_child_role_id_fkey" FOREIGN KEY ("child_role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_units" ADD CONSTRAINT "organization_units_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_units" ADD CONSTRAINT "organization_units_parent_unit_id_fkey" FOREIGN KEY ("parent_unit_id") REFERENCES "organization_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_units" ADD CONSTRAINT "organization_units_unit_type_id_fkey" FOREIGN KEY ("unit_type_id") REFERENCES "organization_unit_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_calendars" ADD CONSTRAINT "organization_calendars_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "numbering_sequences" ADD CONSTRAINT "numbering_sequences_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_calendars" ADD CONSTRAINT "system_calendars_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "system_calendars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_definition_id_fkey" FOREIGN KEY ("workflow_definition_id") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_workflow_definition_id_fkey" FOREIGN KEY ("workflow_definition_id") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_from_step_id_fkey" FOREIGN KEY ("from_step_id") REFERENCES "workflow_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_to_step_id_fkey" FOREIGN KEY ("to_step_id") REFERENCES "workflow_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_workflow_definition_id_fkey" FOREIGN KEY ("workflow_definition_id") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_current_step_id_fkey" FOREIGN KEY ("current_step_id") REFERENCES "workflow_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_started_by_principal_id_fkey" FOREIGN KEY ("started_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_workflow_instance_id_fkey" FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_workflow_step_id_fkey" FOREIGN KEY ("workflow_step_id") REFERENCES "workflow_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_assignee_principal_id_fkey" FOREIGN KEY ("assignee_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_histories" ADD CONSTRAINT "workflow_histories_workflow_instance_id_fkey" FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_histories" ADD CONSTRAINT "workflow_histories_workflow_step_id_fkey" FOREIGN KEY ("workflow_step_id") REFERENCES "workflow_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_histories" ADD CONSTRAINT "workflow_histories_actor_principal_id_fkey" FOREIGN KEY ("actor_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_created_by_principal_id_fkey" FOREIGN KEY ("created_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "notification_recipients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_created_by_principal_id_fkey" FOREIGN KEY ("created_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_uploaded_by_principal_id_fkey" FOREIGN KEY ("uploaded_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_attached_by_principal_id_fkey" FOREIGN KEY ("attached_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_principal_id_fkey" FOREIGN KEY ("actor_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_details" ADD CONSTRAINT "audit_details_audit_log_id_fkey" FOREIGN KEY ("audit_log_id") REFERENCES "audit_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_exports" ADD CONSTRAINT "audit_exports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_exports" ADD CONSTRAINT "audit_exports_exported_by_principal_id_fkey" FOREIGN KEY ("exported_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_exports" ADD CONSTRAINT "audit_exports_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_principal_id_fkey" FOREIGN KEY ("author_principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_mentions" ADD CONSTRAINT "comment_mentions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_mentions" ADD CONSTRAINT "comment_mentions_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_created_by_principal_id_fkey" FOREIGN KEY ("created_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_options" ADD CONSTRAINT "custom_field_options_custom_field_definition_id_fkey" FOREIGN KEY ("custom_field_definition_id") REFERENCES "custom_field_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_custom_field_definition_id_fkey" FOREIGN KEY ("custom_field_definition_id") REFERENCES "custom_field_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_created_by_principal_id_fkey" FOREIGN KEY ("created_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_assignments" ADD CONSTRAINT "tag_assignments_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_assignments" ADD CONSTRAINT "tag_assignments_assigned_by_principal_id_fkey" FOREIGN KEY ("assigned_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "principals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_avatar_file_id_fkey" FOREIGN KEY ("avatar_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_contacts" ADD CONSTRAINT "employee_contacts_employee_id_fkey_1" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_contacts" ADD CONSTRAINT "employee_contacts_employee_id_fkey_2" FOREIGN KEY ("employee_id") REFERENCES "employee_addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_addresses" ADD CONSTRAINT "employee_addresses_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_emergency_contacts" ADD CONSTRAINT "employee_emergency_contacts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_types" ADD CONSTRAINT "employment_types_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_types" ADD CONSTRAINT "contract_types_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employments" ADD CONSTRAINT "employments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employments" ADD CONSTRAINT "employments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employments" ADD CONSTRAINT "employments_employment_type_id_fkey" FOREIGN KEY ("employment_type_id") REFERENCES "employment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_contracts" ADD CONSTRAINT "employment_contracts_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_contracts" ADD CONSTRAINT "employment_contracts_contract_type_id_fkey" FOREIGN KEY ("contract_type_id") REFERENCES "contract_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_contracts" ADD CONSTRAINT "employment_contracts_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_status_histories" ADD CONSTRAINT "employment_status_histories_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_status_histories" ADD CONSTRAINT "employment_status_histories_changed_by_principal_id_fkey" FOREIGN KEY ("changed_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_titles" ADD CONSTRAINT "job_titles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_locations" ADD CONSTRAINT "work_locations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_assignments" ADD CONSTRAINT "organization_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_assignments" ADD CONSTRAINT "organization_assignments_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_assignments" ADD CONSTRAINT "organization_assignments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "organization_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_assignments" ADD CONSTRAINT "organization_assignments_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_assignments" ADD CONSTRAINT "organization_assignments_job_title_id_fkey" FOREIGN KEY ("job_title_id") REFERENCES "job_titles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_assignments" ADD CONSTRAINT "organization_assignments_manager_employment_id_fkey" FOREIGN KEY ("manager_employment_id") REFERENCES "employments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_assignments" ADD CONSTRAINT "organization_assignments_work_location_id_fkey" FOREIGN KEY ("work_location_id") REFERENCES "work_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_assignments" ADD CONSTRAINT "organization_assignments_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_shift_assignment_id_fkey" FOREIGN KEY ("shift_assignment_id") REFERENCES "shift_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "attendance_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_adjustments" ADD CONSTRAINT "attendance_adjustments_attendance_record_id_fkey" FOREIGN KEY ("attendance_record_id") REFERENCES "attendance_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_adjustments" ADD CONSTRAINT "attendance_adjustments_requested_by_principal_id_fkey" FOREIGN KEY ("requested_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_adjustments" ADD CONSTRAINT "attendance_adjustments_approved_by_principal_id_fkey" FOREIGN KEY ("approved_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_devices" ADD CONSTRAINT "attendance_devices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_policies" ADD CONSTRAINT "leave_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_policies" ADD CONSTRAINT "leave_policies_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_policies" ADD CONSTRAINT "leave_policies_employment_type_id_fkey" FOREIGN KEY ("employment_type_id") REFERENCES "employment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_workflow_instance_id_fkey" FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_transactions" ADD CONSTRAINT "leave_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_transactions" ADD CONSTRAINT "leave_transactions_leave_balance_id_fkey" FOREIGN KEY ("leave_balance_id") REFERENCES "leave_balances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_transactions" ADD CONSTRAINT "leave_transactions_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_structures" ADD CONSTRAINT "salary_structures_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_components" ADD CONSTRAINT "salary_components_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_assignments" ADD CONSTRAINT "employee_salary_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_assignments" ADD CONSTRAINT "employee_salary_assignments_employment_id_fkey_1" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_assignments" ADD CONSTRAINT "employee_salary_assignments_salary_structure_id_fkey" FOREIGN KEY ("salary_structure_id") REFERENCES "salary_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_assignments" ADD CONSTRAINT "employee_salary_assignments_employment_id_fkey_2" FOREIGN KEY ("employment_id") REFERENCES "employee_salary_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_periods" ADD CONSTRAINT "payroll_periods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_payroll_period_id_fkey" FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_payslip_file_id_fkey" FOREIGN KEY ("payslip_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "payrolls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_salary_component_id_fkey" FOREIGN KEY ("salary_component_id") REFERENCES "salary_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requisitions" ADD CONSTRAINT "job_requisitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requisitions" ADD CONSTRAINT "job_requisitions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "organization_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requisitions" ADD CONSTRAINT "job_requisitions_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requisitions" ADD CONSTRAINT "job_requisitions_requested_by_employment_id_fkey" FOREIGN KEY ("requested_by_employment_id") REFERENCES "employments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_requisition_id_fkey" FOREIGN KEY ("requisition_id") REFERENCES "job_requisitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_resume_file_id_fkey" FOREIGN KEY ("resume_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_interviewer_employment_id_fkey" FOREIGN KEY ("interviewer_employment_id") REFERENCES "employments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_offer_file_id_fkey" FOREIGN KEY ("offer_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hiring_records" ADD CONSTRAINT "hiring_records_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hiring_records" ADD CONSTRAINT "hiring_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hiring_records" ADD CONSTRAINT "hiring_records_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_cycles" ADD CONSTRAINT "performance_cycles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_ratings" ADD CONSTRAINT "performance_ratings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_goals" ADD CONSTRAINT "performance_goals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_goals" ADD CONSTRAINT "performance_goals_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_goals" ADD CONSTRAINT "performance_goals_performance_cycle_id_fkey" FOREIGN KEY ("performance_cycle_id") REFERENCES "performance_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_goal_progress" ADD CONSTRAINT "performance_goal_progress_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "performance_goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_goal_progress" ADD CONSTRAINT "performance_goal_progress_updated_by_principal_id_fkey" FOREIGN KEY ("updated_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewer_employment_id_fkey" FOREIGN KEY ("reviewer_employment_id") REFERENCES "employments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_performance_cycle_id_fkey" FOREIGN KEY ("performance_cycle_id") REFERENCES "performance_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_workflow_instance_id_fkey" FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_overall_rating_id_fkey" FOREIGN KEY ("overall_rating_id") REFERENCES "performance_ratings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_review_items" ADD CONSTRAINT "performance_review_items_performance_review_id_fkey" FOREIGN KEY ("performance_review_id") REFERENCES "performance_reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_review_items" ADD CONSTRAINT "performance_review_items_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "performance_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_review_items" ADD CONSTRAINT "performance_review_items_rating_id_fkey" FOREIGN KEY ("rating_id") REFERENCES "performance_ratings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_courses" ADD CONSTRAINT "training_courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "training_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_instructor_employment_id_fkey" FOREIGN KEY ("instructor_employment_id") REFERENCES "employments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_enrollments" ADD CONSTRAINT "training_enrollments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_enrollments" ADD CONSTRAINT "training_enrollments_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_enrollments" ADD CONSTRAINT "training_enrollments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_results" ADD CONSTRAINT "training_results_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "training_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_results" ADD CONSTRAINT "training_results_evaluated_by_employment_id_fkey" FOREIGN KEY ("evaluated_by_employment_id") REFERENCES "employments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_certificates" ADD CONSTRAINT "training_certificates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_certificates" ADD CONSTRAINT "training_certificates_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "training_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_certificates" ADD CONSTRAINT "training_certificates_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_categories" ADD CONSTRAINT "asset_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "asset_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_assigned_by_principal_id_fkey" FOREIGN KEY ("assigned_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_returns" ADD CONSTRAINT "asset_returns_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "asset_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_returns" ADD CONSTRAINT "asset_returns_returned_by_principal_id_fkey" FOREIGN KEY ("returned_by_principal_id") REFERENCES "principals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_maintenances" ADD CONSTRAINT "asset_maintenances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_maintenances" ADD CONSTRAINT "asset_maintenances_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_disposals" ADD CONSTRAINT "asset_disposals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_disposals" ADD CONSTRAINT "asset_disposals_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
