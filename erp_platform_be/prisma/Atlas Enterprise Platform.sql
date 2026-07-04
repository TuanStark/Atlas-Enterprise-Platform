CREATE TYPE "tenant_status" AS ENUM (
  'active',
  'inactive',
  'suspended'
);

CREATE TYPE "subscription_status" AS ENUM (
  'trial',
  'active',
  'expired',
  'cancelled'
);

CREATE TYPE "principal_type" AS ENUM (
  'user',
  'service_account'
);

CREATE TYPE "principal_status" AS ENUM (
  'active',
  'inactive',
  'locked'
);

CREATE TYPE "credential_type" AS ENUM (
  'password',
  'oauth',
  'saml',
  'oidc'
);

CREATE TYPE "mfa_type" AS ENUM (
  'totp',
  'email',
  'sms'
);

CREATE TYPE "effect_type" AS ENUM (
  'allow',
  'deny'
);

CREATE TYPE "feature_flag_status" AS ENUM (
  'enabled',
  'disabled'
);

CREATE TYPE "workflow_status" AS ENUM (
  'draft',
  'active',
  'inactive'
);

CREATE TYPE "workflow_step_type" AS ENUM (
  'start',
  'approval',
  'task',
  'notification',
  'end'
);

CREATE TYPE "workflow_instance_status" AS ENUM (
  'running',
  'completed',
  'cancelled',
  'rejected'
);

CREATE TYPE "workflow_task_status" AS ENUM (
  'pending',
  'approved',
  'rejected',
  'skipped'
);

CREATE TYPE "assignment_type" AS ENUM (
  'user',
  'role',
  'manager',
  'department_manager',
  'dynamic'
);

CREATE TYPE "notification_channel" AS ENUM (
  'in_app',
  'email',
  'sms',
  'push',
  'webhook'
);

CREATE TYPE "notification_status" AS ENUM (
  'pending',
  'sending',
  'sent',
  'failed',
  'cancelled'
);

CREATE TYPE "file_storage_provider" AS ENUM (
  'local',
  's3',
  'minio',
  'azure_blob',
  'gcs'
);

CREATE TYPE "file_visibility" AS ENUM (
  'private',
  'internal',
  'public'
);

CREATE TYPE "audit_action" AS ENUM (
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'approve',
  'reject',
  'export',
  'import'
);

CREATE TYPE "comment_status" AS ENUM (
  'active',
  'edited',
  'deleted'
);

CREATE TYPE "custom_field_type" AS ENUM (
  'text',
  'textarea',
  'number',
  'decimal',
  'boolean',
  'date',
  'datetime',
  'email',
  'phone',
  'url',
  'select',
  'multiselect',
  'json'
);

CREATE TYPE "gender" AS ENUM (
  'male',
  'female',
  'other'
);

CREATE TYPE "marital_status" AS ENUM (
  'single',
  'married',
  'divorced',
  'widowed'
);

CREATE TYPE "employment_status" AS ENUM (
  'probation',
  'active',
  'suspended',
  'resigned',
  'terminated',
  'retired'
);

CREATE TYPE "assignment_status" AS ENUM (
  'active',
  'ended'
);

CREATE TYPE "attendance_status" AS ENUM (
  'present',
  'absent',
  'late',
  'early_leave',
  'overtime',
  'holiday'
);

CREATE TYPE "attendance_source" AS ENUM (
  'manual',
  'biometric',
  'mobile',
  'web',
  'api'
);

CREATE TYPE "leave_request_status" AS ENUM (
  'draft',
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

CREATE TYPE "salary_component_type" AS ENUM (
  'earning',
  'allowance',
  'deduction',
  'employer_contribution'
);

CREATE TYPE "payroll_status" AS ENUM (
  'draft',
  'calculating',
  'calculated',
  'approved',
  'paid',
  'cancelled'
);

CREATE TYPE "requisition_status" AS ENUM (
  'draft',
  'approved',
  'closed',
  'cancelled'
);

CREATE TYPE "application_status" AS ENUM (
  'applied',
  'screening',
  'interviewing',
  'offered',
  'hired',
  'rejected',
  'withdrawn'
);

CREATE TYPE "interview_status" AS ENUM (
  'scheduled',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE "offer_status" AS ENUM (
  'draft',
  'sent',
  'accepted',
  'declined',
  'expired'
);

CREATE TYPE "review_status" AS ENUM (
  'draft',
  'self_review',
  'manager_review',
  'completed',
  'cancelled'
);

CREATE TYPE "training_status" AS ENUM (
  'planned',
  'ongoing',
  'completed',
  'cancelled'
);

CREATE TYPE "enrollment_status" AS ENUM (
  'enrolled',
  'attended',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE "asset_status" AS ENUM (
  'available',
  'assigned',
  'maintenance',
  'disposed'
);

CREATE TABLE "subscription_plans" (
  "id" uuid PRIMARY KEY,
  "code" varchar(50) UNIQUE NOT NULL,
  "name" varchar(150) NOT NULL,
  "description" text,
  "price" numeric(18,2),
  "billing_cycle_month" int,
  "max_users" int,
  "max_storage_gb" int,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "tenants" (
  "id" uuid PRIMARY KEY,
  "code" varchar(50) UNIQUE NOT NULL,
  "name" varchar(255) NOT NULL,
  "legal_name" varchar(255),
  "tax_code" varchar(100),
  "email" varchar(255),
  "phone" varchar(50),
  "logo_file_id" uuid,
  "timezone" varchar(100),
  "locale" varchar(20),
  "currency" varchar(10),
  "status" tenant_status,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "deleted_at" timestamptz,
  "version" int
);

CREATE TABLE "tenant_domains" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "domain" varchar(255) NOT NULL,
  "is_primary" boolean,
  "verified_at" timestamptz,
  "created_at" timestamptz
);

CREATE TABLE "tenant_subscriptions" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "subscription_plan_id" uuid NOT NULL,
  "status" subscription_status,
  "starts_at" timestamptz,
  "expires_at" timestamptz,
  "auto_renew" boolean,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "tenant_settings" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "setting_key" varchar(150),
  "setting_value" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "principals" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "type" principal_type NOT NULL,
  "status" principal_status NOT NULL,
  "display_name" varchar(255),
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "deleted_at" timestamptz,
  "version" int
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "principal_id" uuid UNIQUE NOT NULL,
  "username" varchar(100) NOT NULL,
  "email" varchar(255) NOT NULL,
  "phone" varchar(30),
  "email_verified" boolean,
  "phone_verified" boolean,
  "last_login_at" timestamptz,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "tenant_id" uuid NOT NULL
);

CREATE TABLE "credentials" (
  "id" uuid PRIMARY KEY,
  "principal_id" uuid NOT NULL,
  "type" credential_type,
  "password_hash" text,
  "password_changed_at" timestamptz,
  "password_expires_at" timestamptz,
  "failed_attempts" int,
  "locked_until" timestamptz,
  "created_at" timestamptz
);

CREATE TABLE "sessions" (
  "id" uuid PRIMARY KEY,
  "principal_id" uuid NOT NULL,
  "refresh_token_id" uuid,
  "ip_address" varchar(100),
  "user_agent" text,
  "device_name" varchar(255),
  "expires_at" timestamptz,
  "revoked_at" timestamptz,
  "created_at" timestamptz
);

CREATE TABLE "mfa_methods" (
  "id" uuid PRIMARY KEY,
  "principal_id" uuid NOT NULL,
  "type" mfa_type,
  "secret" text,
  "is_default" boolean,
  "enabled" boolean,
  "created_at" timestamptz
);

CREATE TABLE "api_keys" (
  "id" uuid PRIMARY KEY,
  "principal_id" uuid NOT NULL,
  "name" varchar(255),
  "key_hash" text,
  "expires_at" timestamptz,
  "last_used_at" timestamptz,
  "revoked_at" timestamptz,
  "created_at" timestamptz
);

CREATE TABLE "refresh_tokens" (
  "id" uuid PRIMARY KEY,
  "principal_id" uuid NOT NULL,
  "token_hash" text,
  "expires_at" timestamptz,
  "revoked_at" timestamptz,
  "created_at" timestamptz
);

CREATE TABLE "resources" (
  "id" uuid PRIMARY KEY,
  "code" varchar(100) UNIQUE NOT NULL,
  "name" varchar(150)
);

CREATE TABLE "actions" (
  "id" uuid PRIMARY KEY,
  "code" varchar(50) UNIQUE NOT NULL,
  "name" varchar(100)
);

CREATE TABLE "permission_groups" (
  "id" uuid PRIMARY KEY,
  "code" varchar(100) UNIQUE NOT NULL,
  "name" varchar(150)
);

CREATE TABLE "permissions" (
  "id" uuid PRIMARY KEY,
  "permission_group_id" uuid,
  "resource_id" uuid NOT NULL,
  "action_id" uuid NOT NULL,
  "code" varchar(150) UNIQUE NOT NULL,
  "description" text
);

CREATE TABLE "roles" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(100),
  "name" varchar(150),
  "description" text,
  "is_system" boolean,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "role_permissions" (
  "role_id" uuid,
  "permission_id" uuid,
  "effect" effect_type,
  PRIMARY KEY ("role_id", "permission_id")
);

CREATE TABLE "principal_roles" (
  "principal_id" uuid,
  "role_id" uuid,
  "scope_id" uuid,
  "assigned_at" timestamptz,
  PRIMARY KEY ("principal_id", "role_id", "scope_id")
);

CREATE TABLE "principal_permissions" (
  "principal_id" uuid,
  "permission_id" uuid,
  "scope_id" uuid,
  "effect" effect_type,
  PRIMARY KEY ("principal_id", "permission_id", "scope_id")
);

CREATE TABLE "role_hierarchies" (
  "parent_role_id" uuid,
  "child_role_id" uuid,
  PRIMARY KEY ("parent_role_id", "child_role_id")
);

CREATE TABLE "scopes" (
  "id" uuid PRIMARY KEY,
  "code" varchar(100) UNIQUE,
  "name" varchar(150)
);

CREATE TABLE "organizations" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "deleted_at" timestamptz,
  "version" int
);

CREATE TABLE "organization_unit_types" (
  "id" uuid PRIMARY KEY,
  "code" varchar(50) UNIQUE NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text
);

CREATE TABLE "organization_units" (
  "id" uuid PRIMARY KEY,
  "organization_id" uuid NOT NULL,
  "parent_unit_id" uuid,
  "unit_type_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(255) NOT NULL,
  "path" varchar(1000),
  "level" int,
  "sort_order" int,
  "is_active" boolean,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "deleted_at" timestamptz,
  "version" int
);

CREATE TABLE "positions" (
  "id" uuid PRIMARY KEY,
  "organization_id" uuid NOT NULL,
  "code" varchar(50),
  "name" varchar(150),
  "description" text,
  "level" int,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "cost_centers" (
  "id" uuid PRIMARY KEY,
  "organization_id" uuid NOT NULL,
  "code" varchar(50),
  "name" varchar(150),
  "description" text,
  "created_at" timestamptz
);

CREATE TABLE "organization_calendars" (
  "id" uuid PRIMARY KEY,
  "organization_id" uuid NOT NULL,
  "name" varchar(100),
  "timezone" varchar(100),
  "work_days" jsonb,
  "created_at" timestamptz
);

CREATE TABLE "configurations" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid,
  "config_key" varchar(150) NOT NULL,
  "config_value" jsonb,
  "description" text,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "feature_flags" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid,
  "code" varchar(100) NOT NULL,
  "name" varchar(150),
  "status" feature_flag_status,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "numbering_sequences" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid,
  "code" varchar(100),
  "prefix" varchar(30),
  "suffix" varchar(30),
  "next_number" bigint,
  "padding" int,
  "reset_rule" varchar(30),
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "localization_resources" (
  "id" uuid PRIMARY KEY,
  "locale" varchar(20),
  "resource_key" varchar(255),
  "resource_value" text
);

CREATE TABLE "email_templates" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid,
  "code" varchar(100),
  "subject" varchar(255),
  "body" text,
  "language" varchar(20),
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "system_calendars" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid,
  "code" varchar(100),
  "name" varchar(255),
  "timezone" varchar(100),
  "work_days" jsonb
);

CREATE TABLE "holidays" (
  "id" uuid PRIMARY KEY,
  "calendar_id" uuid,
  "holiday_date" date,
  "name" varchar(255),
  "recurring" boolean
);

CREATE TABLE "workflow_definitions" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "version" int DEFAULT 1,
  "status" workflow_status NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "deleted_at" timestamptz
);

CREATE TABLE "workflow_steps" (
  "id" uuid PRIMARY KEY,
  "workflow_definition_id" uuid NOT NULL,
  "code" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "step_type" workflow_step_type NOT NULL,
  "sequence_no" int,
  "assignment_type" assignment_type,
  "assignment_config" jsonb,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "workflow_transitions" (
  "id" uuid PRIMARY KEY,
  "workflow_definition_id" uuid NOT NULL,
  "from_step_id" uuid NOT NULL,
  "to_step_id" uuid NOT NULL,
  "transition_name" varchar(100),
  "condition_expression" jsonb,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "workflow_instances" (
  "id" uuid PRIMARY KEY,
  "workflow_definition_id" uuid NOT NULL,
  "target_record_id" uuid NOT NULL,
  "current_step_id" uuid,
  "status" workflow_instance_status,
  "started_by_principal_id" uuid,
  "started_at" timestamptz,
  "completed_at" timestamptz,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "workflow_tasks" (
  "id" uuid PRIMARY KEY,
  "workflow_instance_id" uuid NOT NULL,
  "workflow_step_id" uuid NOT NULL,
  "assignee_principal_id" uuid,
  "status" workflow_task_status,
  "due_at" timestamptz,
  "remind_at" timestamptz,
  "priority" int,
  "assigned_at" timestamptz,
  "completed_at" timestamptz,
  "comment" text,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "workflow_histories" (
  "id" uuid PRIMARY KEY,
  "workflow_instance_id" uuid NOT NULL,
  "workflow_step_id" uuid,
  "actor_principal_id" uuid,
  "action" varchar(100),
  "from_status" varchar(50),
  "to_status" varchar(50),
  "comment" text,
  "metadata" jsonb,
  "created_at" timestamptz
);

CREATE TABLE "notification_templates" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid,
  "code" varchar(100) NOT NULL,
  "name" varchar(255),
  "channel" notification_channel,
  "subject" varchar(255),
  "body" text,
  "language" varchar(20),
  "is_active" boolean,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "template_id" uuid,
  "target_module" varchar(100),
  "target_entity" varchar(100),
  "target_record_id" uuid,
  "title" varchar(255),
  "message" text,
  "metadata" jsonb,
  "created_by_principal_id" uuid,
  "scheduled_at" timestamptz,
  "created_at" timestamptz
);

CREATE TABLE "notification_recipients" (
  "id" uuid PRIMARY KEY,
  "notification_id" uuid NOT NULL,
  "principal_id" uuid NOT NULL,
  "is_read" boolean,
  "read_at" timestamptz,
  "created_at" timestamptz
);

CREATE TABLE "notification_deliveries" (
  "id" uuid PRIMARY KEY,
  "recipient_id" uuid NOT NULL,
  "channel" notification_channel,
  "status" notification_status,
  "provider" varchar(100),
  "provider_message_id" varchar(255),
  "retry_count" int,
  "sent_at" timestamptz,
  "delivered_at" timestamptz,
  "failed_at" timestamptz,
  "error_message" text,
  "created_at" timestamptz
);

CREATE TABLE "files" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(100),
  "file_name" varchar(255),
  "mime_type" varchar(150),
  "extension" varchar(20),
  "visibility" file_visibility,
  "current_version" int,
  "size" bigint,
  "checksum" varchar(255),
  "metadata" jsonb,
  "created_by_principal_id" uuid,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "file_versions" (
  "id" uuid PRIMARY KEY,
  "file_id" uuid NOT NULL,
  "version" int,
  "storage_provider" file_storage_provider,
  "storage_key" text,
  "size" bigint,
  "checksum" varchar(255),
  "uploaded_by_principal_id" uuid,
  "uploaded_at" timestamptz
);

CREATE TABLE "file_attachments" (
  "id" uuid PRIMARY KEY,
  "file_id" uuid NOT NULL,
  "target_module" varchar(100),
  "target_entity" varchar(100),
  "target_record_id" uuid,
  "attached_by_principal_id" uuid,
  "created_at" timestamptz
);

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "target_module" varchar(100),
  "target_entity" varchar(100),
  "target_record_id" uuid,
  "action" audit_action,
  "actor_principal_id" uuid,
  "ip_address" varchar(100),
  "user_agent" text,
  "request_id" varchar(255),
  "metadata" jsonb,
  "created_at" timestamptz
);

CREATE TABLE "audit_details" (
  "id" uuid PRIMARY KEY,
  "audit_log_id" uuid NOT NULL,
  "field_name" varchar(150),
  "old_value" text,
  "new_value" text
);

CREATE TABLE "audit_exports" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid,
  "exported_by_principal_id" uuid,
  "file_id" uuid,
  "exported_at" timestamptz,
  "filters" jsonb
);

CREATE TABLE "comments" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "target_module" varchar(100) NOT NULL,
  "target_entity" varchar(100) NOT NULL,
  "target_record_id" uuid NOT NULL,
  "parent_comment_id" uuid,
  "author_principal_id" uuid NOT NULL,
  "content" text NOT NULL,
  "status" comment_status DEFAULT 'active',
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "deleted_at" timestamptz
);

CREATE TABLE "comment_mentions" (
  "id" uuid PRIMARY KEY,
  "comment_id" uuid NOT NULL,
  "principal_id" uuid NOT NULL,
  "created_at" timestamptz
);

CREATE TABLE "comment_reactions" (
  "id" uuid PRIMARY KEY,
  "comment_id" uuid NOT NULL,
  "principal_id" uuid NOT NULL,
  "reaction" varchar(30) NOT NULL,
  "created_at" timestamptz
);

CREATE TABLE "custom_field_definitions" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "target_module" varchar(100) NOT NULL,
  "target_entity" varchar(100) NOT NULL,
  "code" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "field_type" custom_field_type NOT NULL,
  "is_required" boolean DEFAULT false,
  "default_value" text,
  "validation_rules" jsonb,
  "display_order" int,
  "metadata" jsonb,
  "created_by_principal_id" uuid,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "custom_field_options" (
  "id" uuid PRIMARY KEY,
  "custom_field_definition_id" uuid NOT NULL,
  "value" varchar(255) NOT NULL,
  "label" varchar(255) NOT NULL,
  "sort_order" int,
  "is_active" boolean DEFAULT true
);

CREATE TABLE "custom_field_values" (
  "id" uuid PRIMARY KEY,
  "custom_field_definition_id" uuid NOT NULL,
  "target_record_id" uuid NOT NULL,
  "value" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "tags" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(100),
  "name" varchar(150),
  "color" varchar(20),
  "description" text,
  "created_by_principal_id" uuid,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "tag_assignments" (
  "id" uuid PRIMARY KEY,
  "tag_id" uuid NOT NULL,
  "target_module" varchar(100),
  "target_entity" varchar(100),
  "target_record_id" uuid,
  "assigned_by_principal_id" uuid,
  "assigned_at" timestamptz
);

CREATE TABLE "employees" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "employee_no" varchar(50) NOT NULL,
  "principal_id" uuid UNIQUE NOT NULL,
  "first_name" varchar(100) NOT NULL,
  "last_name" varchar(100) NOT NULL,
  "preferred_name" varchar(100),
  "gender" gender,
  "date_of_birth" date,
  "marital_status" marital_status,
  "nationality" varchar(100),
  "national_id" varchar(100),
  "passport_no" varchar(100),
  "tax_number" varchar(100),
  "avatar_file_id" uuid,
  "status" varchar(30),
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "deleted_at" timestamptz
);

CREATE TABLE "employee_contacts" (
  "id" uuid PRIMARY KEY,
  "employee_id" uuid NOT NULL,
  "contact_type" varchar(30),
  "value" varchar(255),
  "is_primary" boolean,
  "verified_at" timestamptz,
  "created_at" timestamptz
);

CREATE TABLE "employee_addresses" (
  "id" uuid PRIMARY KEY,
  "employee_id" uuid NOT NULL,
  "address_type" varchar(30),
  "country" varchar(100),
  "state" varchar(100),
  "city" varchar(100),
  "district" varchar(100),
  "ward" varchar(100),
  "address_line" text,
  "postal_code" varchar(30),
  "is_primary" boolean,
  "created_at" timestamptz
);

CREATE TABLE "employee_emergency_contacts" (
  "id" uuid PRIMARY KEY,
  "employee_id" uuid NOT NULL,
  "full_name" varchar(255),
  "relationship" varchar(100),
  "phone" varchar(50),
  "email" varchar(255),
  "address" text,
  "priority" int,
  "created_at" timestamptz
);

CREATE TABLE "employee_documents" (
  "id" uuid PRIMARY KEY,
  "employee_id" uuid NOT NULL,
  "document_type" varchar(100),
  "document_number" varchar(100),
  "issued_date" date,
  "expiry_date" date,
  "issued_place" varchar(255),
  "file_id" uuid,
  "created_at" timestamptz
);

CREATE TABLE "employment_types" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "contract_types" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(100) NOT NULL,
  "duration_month" int,
  "description" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "employments" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "employee_id" uuid NOT NULL,
  "employment_type_id" uuid NOT NULL,
  "employee_code" varchar(50) NOT NULL,
  "hire_date" date NOT NULL,
  "probation_start_date" date,
  "probation_end_date" date,
  "confirmation_date" date,
  "termination_date" date,
  "status" employment_status NOT NULL,
  "reason" text,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "deleted_at" timestamptz
);

CREATE TABLE "employment_contracts" (
  "id" uuid PRIMARY KEY,
  "employment_id" uuid NOT NULL,
  "contract_type_id" uuid NOT NULL,
  "contract_number" varchar(100) NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date,
  "signed_date" date,
  "file_id" uuid,
  "is_current" boolean DEFAULT true,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "employment_status_histories" (
  "id" uuid PRIMARY KEY,
  "employment_id" uuid NOT NULL,
  "from_status" employment_status,
  "to_status" employment_status,
  "effective_date" date NOT NULL,
  "reason" text,
  "changed_by_principal_id" uuid,
  "created_at" timestamptz
);

CREATE TABLE "job_titles" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(150) NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "work_locations" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(150) NOT NULL,
  "address" text,
  "timezone" varchar(100),
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "organization_assignments" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "employment_id" uuid NOT NULL,
  "department_id" uuid NOT NULL,
  "position_id" uuid NOT NULL,
  "job_title_id" uuid,
  "manager_employment_id" uuid,
  "work_location_id" uuid,
  "cost_center_id" uuid,
  "effective_from" date NOT NULL,
  "effective_to" date,
  "is_primary" boolean DEFAULT true,
  "status" assignment_status DEFAULT 'active',
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "shifts" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(100) NOT NULL,
  "start_time" time NOT NULL,
  "end_time" time NOT NULL,
  "break_minutes" int DEFAULT 60,
  "is_flexible" boolean DEFAULT false,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "shift_assignments" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "employment_id" uuid NOT NULL,
  "shift_id" uuid NOT NULL,
  "effective_from" date NOT NULL,
  "effective_to" date,
  "is_primary" boolean DEFAULT true,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "attendance_records" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "employment_id" uuid NOT NULL,
  "shift_assignment_id" uuid,
  "attendance_date" date NOT NULL,
  "check_in_at" timestamptz,
  "check_out_at" timestamptz,
  "worked_minutes" int,
  "overtime_minutes" int DEFAULT 0,
  "late_minutes" int DEFAULT 0,
  "early_leave_minutes" int DEFAULT 0,
  "status" attendance_status,
  "source" attendance_source,
  "device_id" uuid,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "attendance_adjustments" (
  "id" uuid PRIMARY KEY,
  "attendance_record_id" uuid NOT NULL,
  "requested_by_principal_id" uuid,
  "approved_by_principal_id" uuid,
  "reason" text,
  "old_check_in" timestamptz,
  "new_check_in" timestamptz,
  "old_check_out" timestamptz,
  "new_check_out" timestamptz,
  "created_at" timestamptz
);

CREATE TABLE "attendance_devices" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50),
  "name" varchar(150),
  "device_type" varchar(50),
  "location" varchar(255),
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "leave_types" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(150) NOT NULL,
  "is_paid" boolean DEFAULT true,
  "requires_attachment" boolean DEFAULT false,
  "color" varchar(20),
  "description" text,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "leave_policies" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "leave_type_id" uuid NOT NULL,
  "employment_type_id" uuid,
  "annual_days" decimal(5,2),
  "max_consecutive_days" int,
  "carry_forward_limit" decimal(5,2),
  "requires_approval" boolean DEFAULT true,
  "effective_from" date,
  "effective_to" date,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "leave_balances" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "employment_id" uuid NOT NULL,
  "leave_type_id" uuid NOT NULL,
  "leave_year" int NOT NULL,
  "entitled_days" decimal(5,2),
  "used_days" decimal(5,2),
  "pending_days" decimal(5,2),
  "remaining_days" decimal(5,2),
  "updated_at" timestamptz
);

CREATE TABLE "leave_requests" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "employment_id" uuid NOT NULL,
  "leave_type_id" uuid NOT NULL,
  "workflow_instance_id" uuid,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "total_days" decimal(5,2) NOT NULL,
  "reason" text,
  "status" leave_request_status,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "leave_transactions" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "leave_balance_id" uuid NOT NULL,
  "leave_request_id" uuid,
  "transaction_type" varchar(30),
  "days" decimal(5,2),
  "description" text,
  "created_at" timestamptz
);

CREATE TABLE "salary_structures" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(150) NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "salary_components" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(150) NOT NULL,
  "component_type" salary_component_type,
  "calculation_type" varchar(30),
  "default_amount" decimal(18,2),
  "taxable" boolean DEFAULT true,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "employee_salary_assignments" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "employment_id" uuid NOT NULL,
  "salary_structure_id" uuid NOT NULL,
  "effective_from" date,
  "effective_to" date,
  "base_salary" decimal(18,2),
  "currency" varchar(10),
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "payroll_periods" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50),
  "start_date" date,
  "end_date" date,
  "payment_date" date,
  "status" payroll_status,
  "created_at" timestamptz
);

CREATE TABLE "payrolls" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "payroll_period_id" uuid NOT NULL,
  "employment_id" uuid NOT NULL,
  "gross_salary" decimal(18,2),
  "total_allowance" decimal(18,2),
  "total_deduction" decimal(18,2),
  "net_salary" decimal(18,2),
  "status" payroll_status,
  "payslip_file_id" uuid,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "payroll_items" (
  "id" uuid PRIMARY KEY,
  "payroll_id" uuid NOT NULL,
  "salary_component_id" uuid NOT NULL,
  "amount" decimal(18,2),
  "remark" text
);

CREATE TABLE "job_requisitions" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "title" varchar(200) NOT NULL,
  "department_id" uuid NOT NULL,
  "position_id" uuid NOT NULL,
  "requested_by_employment_id" uuid,
  "quantity" int DEFAULT 1,
  "status" requisition_status,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "job_postings" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "requisition_id" uuid NOT NULL,
  "title" varchar(200),
  "description" text,
  "published_at" timestamptz,
  "expired_at" timestamptz,
  "is_active" boolean DEFAULT true
);

CREATE TABLE "candidates" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "full_name" varchar(255),
  "email" varchar(255),
  "phone" varchar(50),
  "source" varchar(100),
  "resume_file_id" uuid,
  "created_at" timestamptz
);

CREATE TABLE "job_applications" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "candidate_id" uuid NOT NULL,
  "job_posting_id" uuid NOT NULL,
  "status" application_status,
  "applied_at" timestamptz,
  "current_stage" varchar(100)
);

CREATE TABLE "interviews" (
  "id" uuid PRIMARY KEY,
  "application_id" uuid NOT NULL,
  "interviewer_employment_id" uuid,
  "scheduled_at" timestamptz,
  "location" varchar(255),
  "meeting_url" text,
  "result" varchar(100),
  "status" interview_status
);

CREATE TABLE "job_offers" (
  "id" uuid PRIMARY KEY,
  "application_id" uuid NOT NULL,
  "offered_salary" decimal(18,2),
  "currency" varchar(10),
  "start_date" date,
  "status" offer_status,
  "offer_file_id" uuid,
  "created_at" timestamptz
);

CREATE TABLE "hiring_records" (
  "id" uuid PRIMARY KEY,
  "application_id" uuid NOT NULL,
  "employee_id" uuid,
  "employment_id" uuid,
  "hired_at" timestamptz
);

CREATE TABLE "performance_cycles" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(150) NOT NULL,
  "start_date" date,
  "end_date" date,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "performance_ratings" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(20),
  "name" varchar(100),
  "score" decimal(5,2),
  "description" text,
  "created_at" timestamptz
);

CREATE TABLE "performance_goals" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "employment_id" uuid NOT NULL,
  "performance_cycle_id" uuid NOT NULL,
  "title" varchar(255),
  "description" text,
  "target_value" decimal(18,2),
  "weight" decimal(5,2),
  "due_date" date,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "performance_goal_progress" (
  "id" uuid PRIMARY KEY,
  "goal_id" uuid NOT NULL,
  "progress" decimal(5,2),
  "note" text,
  "updated_by_principal_id" uuid,
  "updated_at" timestamptz
);

CREATE TABLE "performance_reviews" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "employment_id" uuid NOT NULL,
  "reviewer_employment_id" uuid,
  "performance_cycle_id" uuid NOT NULL,
  "workflow_instance_id" uuid,
  "overall_rating_id" uuid,
  "overall_score" decimal(5,2),
  "status" review_status,
  "comment" text,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "performance_review_items" (
  "id" uuid PRIMARY KEY,
  "performance_review_id" uuid NOT NULL,
  "goal_id" uuid,
  "criteria" varchar(255),
  "rating_id" uuid,
  "score" decimal(5,2),
  "comment" text
);

CREATE TABLE "training_courses" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(200) NOT NULL,
  "category" varchar(100),
  "duration_hours" decimal(6,2),
  "description" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "training_sessions" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "course_id" uuid NOT NULL,
  "instructor_employment_id" uuid,
  "start_date" date,
  "end_date" date,
  "location" varchar(255),
  "capacity" int,
  "status" training_status,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "training_enrollments" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "employment_id" uuid NOT NULL,
  "session_id" uuid NOT NULL,
  "enrolled_at" timestamptz,
  "status" enrollment_status,
  "created_at" timestamptz
);

CREATE TABLE "training_results" (
  "id" uuid PRIMARY KEY,
  "enrollment_id" uuid UNIQUE NOT NULL,
  "score" decimal(5,2),
  "passed" boolean,
  "feedback" text,
  "evaluated_by_employment_id" uuid,
  "evaluated_at" timestamptz
);

CREATE TABLE "training_certificates" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "enrollment_id" uuid NOT NULL,
  "certificate_no" varchar(100),
  "issued_date" date,
  "expiry_date" date,
  "file_id" uuid,
  "created_at" timestamptz
);

CREATE TABLE "asset_categories" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "code" varchar(50) NOT NULL,
  "name" varchar(150) NOT NULL,
  "description" text,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "assets" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "category_id" uuid NOT NULL,
  "asset_code" varchar(100) NOT NULL,
  "asset_name" varchar(200),
  "serial_number" varchar(200),
  "manufacturer" varchar(150),
  "model" varchar(150),
  "purchase_date" date,
  "purchase_price" decimal(18,2),
  "warranty_expiry" date,
  "current_status" asset_status,
  "metadata" jsonb,
  "created_at" timestamptz,
  "updated_at" timestamptz
);

CREATE TABLE "asset_assignments" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "asset_id" uuid NOT NULL,
  "employment_id" uuid NOT NULL,
  "assigned_by_principal_id" uuid,
  "assigned_at" timestamptz NOT NULL,
  "expected_return_at" timestamptz,
  "actual_return_at" timestamptz,
  "assignment_status" assignment_status,
  "note" text,
  "created_at" timestamptz
);

CREATE TABLE "asset_returns" (
  "id" uuid PRIMARY KEY,
  "assignment_id" uuid UNIQUE NOT NULL,
  "returned_by_principal_id" uuid,
  "returned_at" timestamptz,
  "condition_note" text,
  "damage_cost" decimal(18,2),
  "created_at" timestamptz
);

CREATE TABLE "asset_maintenances" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "asset_id" uuid NOT NULL,
  "maintenance_type" varchar(100),
  "vendor" varchar(255),
  "cost" decimal(18,2),
  "started_at" timestamptz,
  "completed_at" timestamptz,
  "note" text
);

CREATE TABLE "asset_disposals" (
  "id" uuid PRIMARY KEY,
  "tenant_id" uuid NOT NULL,
  "asset_id" uuid NOT NULL,
  "disposed_at" timestamptz,
  "disposal_method" varchar(100),
  "disposal_value" decimal(18,2),
  "reason" text
);

CREATE UNIQUE INDEX ON "tenant_domains" ("domain");

CREATE UNIQUE INDEX ON "tenant_settings" ("tenant_id", "setting_key");

CREATE INDEX ON "principals" ("tenant_id");

CREATE INDEX ON "users" ("email");

CREATE UNIQUE INDEX ON "users" ("tenant_id", "username");

CREATE UNIQUE INDEX ON "roles" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "organizations" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "organization_units" ("organization_id", "code");

CREATE INDEX ON "organization_units" ("parent_unit_id");

CREATE INDEX ON "organization_units" ("path");

CREATE UNIQUE INDEX ON "positions" ("organization_id", "code");

CREATE UNIQUE INDEX ON "configurations" ("tenant_id", "config_key");

CREATE UNIQUE INDEX ON "feature_flags" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "localization_resources" ("locale", "resource_key");

CREATE UNIQUE INDEX ON "workflow_definitions" ("tenant_id", "code", "version");

CREATE UNIQUE INDEX ON "workflow_steps" ("workflow_definition_id", "code");

CREATE UNIQUE INDEX ON "notification_templates" ("tenant_id", "code", "language");

CREATE UNIQUE INDEX ON "notification_recipients" ("notification_id", "principal_id");

CREATE UNIQUE INDEX ON "file_versions" ("file_id", "version");

CREATE INDEX ON "file_attachments" ("target_module", "target_entity", "target_record_id");

CREATE INDEX ON "audit_logs" ("target_module", "target_entity", "target_record_id");

CREATE INDEX ON "audit_logs" ("actor_principal_id");

CREATE INDEX ON "audit_logs" ("created_at");

CREATE INDEX ON "comments" ("target_module", "target_entity", "target_record_id");

CREATE INDEX ON "comments" ("parent_comment_id");

CREATE INDEX ON "comments" ("author_principal_id");

CREATE UNIQUE INDEX ON "comment_mentions" ("comment_id", "principal_id");

CREATE UNIQUE INDEX ON "comment_reactions" ("comment_id", "principal_id", "reaction");

CREATE UNIQUE INDEX ON "custom_field_definitions" ("tenant_id", "target_module", "target_entity", "code");

CREATE UNIQUE INDEX ON "custom_field_values" ("custom_field_definition_id", "target_record_id");

CREATE INDEX ON "custom_field_values" ("target_record_id");

CREATE UNIQUE INDEX ON "tags" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "tag_assignments" ("tag_id", "target_module", "target_entity", "target_record_id");

CREATE INDEX ON "tag_assignments" ("target_module", "target_entity", "target_record_id");

CREATE UNIQUE INDEX ON "employees" ("tenant_id", "employee_no");

CREATE UNIQUE INDEX ON "employees" ("principal_id");

CREATE UNIQUE INDEX ON "employment_types" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "contract_types" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "employments" ("tenant_id", "employee_code");

CREATE UNIQUE INDEX ON "job_titles" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "work_locations" ("tenant_id", "code");

CREATE INDEX ON "organization_assignments" ("employment_id", "effective_from");

CREATE INDEX ON "organization_assignments" ("department_id");

CREATE INDEX ON "organization_assignments" ("manager_employment_id");

CREATE UNIQUE INDEX ON "shifts" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "attendance_records" ("employment_id", "attendance_date");

CREATE INDEX ON "attendance_records" ("attendance_date");

CREATE UNIQUE INDEX ON "leave_types" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "leave_balances" ("employment_id", "leave_type_id", "leave_year");

CREATE UNIQUE INDEX ON "salary_structures" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "performance_cycles" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "training_courses" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "asset_categories" ("tenant_id", "code");

CREATE UNIQUE INDEX ON "assets" ("tenant_id", "asset_code");

CREATE INDEX ON "assets" ("serial_number");

COMMENT ON COLUMN "subscription_plans"."id" IS 'Gói dịch vụ ID (Khóa chính)';

COMMENT ON COLUMN "subscription_plans"."code" IS 'Mã gói dịch vụ duy nhất (BASIC, STANDARD, PREMIUM...)';

COMMENT ON COLUMN "subscription_plans"."name" IS 'Tên gói dịch vụ hiển thị trên UI';

COMMENT ON COLUMN "subscription_plans"."description" IS 'Mô tả chi tiết tính năng quyền lợi đi kèm gói';

COMMENT ON COLUMN "subscription_plans"."price" IS 'Giá tiền của gói dịch vụ';

COMMENT ON COLUMN "subscription_plans"."billing_cycle_month" IS 'Chu kỳ thanh toán tính bằng tháng (ví dụ: 1 tháng, 12 tháng...)';

COMMENT ON COLUMN "subscription_plans"."max_users" IS 'Hạn ngạch số lượng người dùng tối đa được tạo trong hệ thống';

COMMENT ON COLUMN "subscription_plans"."max_storage_gb" IS 'Dung lượng lưu trữ tối đa được phép sử dụng (tính bằng GB)';

COMMENT ON COLUMN "subscription_plans"."metadata" IS 'Dữ liệu mở rộng dạng động lưu trữ cấu hình riêng của gói (Feature Flags, Limits...)';

COMMENT ON COLUMN "subscription_plans"."created_at" IS 'Thời gian tạo gói (Có kèm múi giờ)';

COMMENT ON COLUMN "subscription_plans"."updated_at" IS 'Thời gian cập nhật gói (Có kèm múi giờ)';

COMMENT ON COLUMN "tenants"."id" IS 'Tenant ID (Khóa chính - Định danh phân vùng dữ liệu)';

COMMENT ON COLUMN "tenants"."code" IS 'Mã định danh tenant viết liền không dấu (Dùng làm prefix hoặc subdomain)';

COMMENT ON COLUMN "tenants"."name" IS 'Tên thương hiệu/Tên hiển thị ngắn gọn của doanh nghiệp';

COMMENT ON COLUMN "tenants"."legal_name" IS 'Tên pháp lý đầy đủ trên giấy phép kinh doanh';

COMMENT ON COLUMN "tenants"."tax_code" IS 'Mã số thuế doanh nghiệp';

COMMENT ON COLUMN "tenants"."email" IS 'Email liên hệ chính của doanh nghiệp';

COMMENT ON COLUMN "tenants"."phone" IS 'Số điện thoại tổng đài/liên hệ chính';

COMMENT ON COLUMN "tenants"."logo_file_id" IS 'Khóa ngoại liên kết tới file ảnh logo doanh nghiệp';

COMMENT ON COLUMN "tenants"."timezone" IS 'Múi giờ hoạt động mặc định của Tenant (ví dụ: Asia/Ho_Chi_Minh)';

COMMENT ON COLUMN "tenants"."locale" IS 'Ngôn ngữ và định dạng vùng mặc định (ví dụ: vi-VN, en-US)';

COMMENT ON COLUMN "tenants"."currency" IS 'Đơn vị tiền tệ hạch toán chính (ví dụ: VND, USD)';

COMMENT ON COLUMN "tenants"."status" IS 'Trạng thái hoạt động hiện tại (Áp dụng Enum tenant_status)';

COMMENT ON COLUMN "tenants"."metadata" IS 'Dữ liệu động mở rộng tùy ý phục vụ các logic nghiệp vụ đặc thù của Tenant';

COMMENT ON COLUMN "tenants"."created_at" IS 'Thời gian khởi tạo hệ thống Tenant';

COMMENT ON COLUMN "tenants"."updated_at" IS 'Thời gian cập nhật thông tin gần nhất';

COMMENT ON COLUMN "tenants"."deleted_at" IS 'Thời gian xóa tạm (Soft delete)';

COMMENT ON COLUMN "tenants"."version" IS 'Số phiên bản record phục vụ cơ chế ngăn chặn xung đột dữ liệu (Optimistic Locking)';

COMMENT ON COLUMN "tenant_domains"."id" IS 'Domain ID (Khóa chính)';

COMMENT ON COLUMN "tenant_domains"."tenant_id" IS 'Domain này thuộc quyền sở hữu của Tenant nào';

COMMENT ON COLUMN "tenant_domains"."domain" IS 'Địa chỉ tên miền truy cập hệ thống (ví dụ: tenant-a.com)';

COMMENT ON COLUMN "tenant_domains"."is_primary" IS 'Đánh dấu đây có phải là tên miền chính/mặc định dùng để định tuyến hệ thống không';

COMMENT ON COLUMN "tenant_domains"."verified_at" IS 'Thời điểm cấu hình DNS hoàn tất và được hệ thống xác thực thành công';

COMMENT ON COLUMN "tenant_domains"."created_at" IS 'Thời gian đăng ký domain vào hệ thống';

COMMENT ON COLUMN "tenant_subscriptions"."id" IS 'Mã hợp đồng thuê dịch vụ ID (Khóa chính)';

COMMENT ON COLUMN "tenant_subscriptions"."tenant_id" IS 'Liên kết tới Tenant sử dụng dịch vụ';

COMMENT ON COLUMN "tenant_subscriptions"."subscription_plan_id" IS 'Liên kết tới gói dịch vụ mẫu được đăng ký';

COMMENT ON COLUMN "tenant_subscriptions"."status" IS 'Trạng thái chu kỳ gói thuê hiện tại (Áp dụng Enum subscription_status)';

COMMENT ON COLUMN "tenant_subscriptions"."starts_at" IS 'Thời điểm gói dịch vụ bắt đầu có hiệu lực kích hoạt';

COMMENT ON COLUMN "tenant_subscriptions"."expires_at" IS 'Thời điểm gói dịch vụ hết hiệu lực (Thời gian hết hạn)';

COMMENT ON COLUMN "tenant_subscriptions"."auto_renew" IS 'Có tự động gia hạn khi đến kỳ tiếp theo hay không';

COMMENT ON COLUMN "tenant_subscriptions"."metadata" IS 'Lưu trữ thông tin bổ sung tại thời điểm mua (Thông tin khuyến mãi, mã giảm giá...)';

COMMENT ON COLUMN "tenant_subscriptions"."created_at" IS 'Thời gian đăng ký đơn thuê';

COMMENT ON COLUMN "tenant_subscriptions"."updated_at" IS 'Thời gian cập nhật trạng thái đơn thuê';

COMMENT ON COLUMN "tenant_settings"."id" IS 'Khóa chính';

COMMENT ON COLUMN "tenant_settings"."tenant_id" IS 'Cấu hình này thuộc về Tenant nào';

COMMENT ON COLUMN "tenant_settings"."setting_key" IS 'Từ khóa định danh cấu hình (ví dụ: security.mfa_required, mail.smtp_host)';

COMMENT ON COLUMN "tenant_settings"."setting_value" IS 'Giá trị cấu hình thực tế lưu ở định dạng JSON động';

COMMENT ON COLUMN "tenant_settings"."created_at" IS 'Thời gian thiết lập cấu hình';

COMMENT ON COLUMN "tenant_settings"."updated_at" IS 'Thời gian cập nhật cấu hình';

COMMENT ON COLUMN "principals"."id" IS 'Principal ID (Khóa chính - Gốc định danh hệ thống)';

COMMENT ON COLUMN "principals"."tenant_id" IS 'Thuộc Tenant nào';

COMMENT ON COLUMN "principals"."type" IS 'Loại chủ thể (Áp dụng Enum principal_type)';

COMMENT ON COLUMN "principals"."status" IS 'Trạng thái hoạt động (Áp dụng Enum principal_status)';

COMMENT ON COLUMN "principals"."display_name" IS 'Tên hiển thị tổng quát trên hệ thống';

COMMENT ON COLUMN "principals"."metadata" IS 'Dữ liệu cấu hình động mở rộng tùy ý';

COMMENT ON COLUMN "principals"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "principals"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "principals"."deleted_at" IS 'Thời gian xóa tạm (Soft delete)';

COMMENT ON COLUMN "principals"."version" IS 'Số phiên bản record phục vụ cơ chế Optimistic Locking';

COMMENT ON COLUMN "users"."id" IS 'User ID (Khóa chính)';

COMMENT ON COLUMN "users"."principal_id" IS 'Liên kết 1-1 tới chủ thể gốc định danh';

COMMENT ON COLUMN "users"."username" IS 'Tên tài khoản dùng để đăng nhập';

COMMENT ON COLUMN "users"."email" IS 'Email tài khoản';

COMMENT ON COLUMN "users"."phone" IS 'Số điện thoại tài khoản';

COMMENT ON COLUMN "users"."email_verified" IS 'Trạng thái xác thực email';

COMMENT ON COLUMN "users"."phone_verified" IS 'Trạng thái xác thực số điện thoại';

COMMENT ON COLUMN "users"."last_login_at" IS 'Thời điểm đăng nhập thành công gần nhất';

COMMENT ON COLUMN "users"."created_at" IS 'Thời gian tạo tài khoản';

COMMENT ON COLUMN "users"."updated_at" IS 'Thời gian cập nhật tài khoản';

COMMENT ON COLUMN "users"."tenant_id" IS 'Thuộc tổ chức/Tenant nào';

COMMENT ON COLUMN "credentials"."id" IS 'Khóa chính';

COMMENT ON COLUMN "credentials"."principal_id" IS 'Thông tin xác thực thuộc về chủ thể nào';

COMMENT ON COLUMN "credentials"."type" IS 'Loại thông tin xác thực (Áp dụng Enum credential_type)';

COMMENT ON COLUMN "credentials"."password_hash" IS 'Chuỗi mật khẩu đã được băm mã hóa bảo mật';

COMMENT ON COLUMN "credentials"."password_changed_at" IS 'Thời điểm đổi mật khẩu gần nhất';

COMMENT ON COLUMN "credentials"."password_expires_at" IS 'Thời hạn hết hiệu lực của mật khẩu (nếu bắt buộc đổi theo định kỳ)';

COMMENT ON COLUMN "credentials"."failed_attempts" IS 'Số lần liên tiếp cố gắng đăng nhập sai';

COMMENT ON COLUMN "credentials"."locked_until" IS 'Thời gian khóa tài khoản tạm thời đến khi nào (nếu nhập sai quá số lần)';

COMMENT ON COLUMN "credentials"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "sessions"."id" IS 'Session ID (Khóa chính)';

COMMENT ON COLUMN "sessions"."principal_id" IS 'Phiên làm việc thuộc về chủ thể nào';

COMMENT ON COLUMN "sessions"."refresh_token_id" IS 'Mã Refresh Token đi kèm điều khiển phiên làm việc này';

COMMENT ON COLUMN "sessions"."ip_address" IS 'Địa chỉ IP mạng khi khởi tạo phiên làm việc';

COMMENT ON COLUMN "sessions"."user_agent" IS 'Thông tin trình duyệt/môi trường thiết bị của client';

COMMENT ON COLUMN "sessions"."device_name" IS 'Tên định danh thiết bị dễ đọc (ví dụ: iPhone 16 Pro, Windows Desktop...)';

COMMENT ON COLUMN "sessions"."expires_at" IS 'Thời điểm phiên làm việc tự động hết hiệu lực';

COMMENT ON COLUMN "sessions"."revoked_at" IS 'Thời điểm phiên bị đăng xuất chủ động hoặc bị hủy bỏ';

COMMENT ON COLUMN "sessions"."created_at" IS 'Thời gian tạo phiên';

COMMENT ON COLUMN "mfa_methods"."id" IS 'Khóa chính';

COMMENT ON COLUMN "mfa_methods"."principal_id" IS 'Phương thức MFA áp dụng cho chủ thể nào';

COMMENT ON COLUMN "mfa_methods"."type" IS 'Loại bảo mật 2 lớp (Áp dụng Enum mfa_type)';

COMMENT ON COLUMN "mfa_methods"."secret" IS 'Mã bí mật hoặc khóa cấu hình OTP đã mã hóa lưu trữ';

COMMENT ON COLUMN "mfa_methods"."is_default" IS 'Đánh dấu đây có phải là phương thức xác thực 2 lớp ưu tiên mặc định không';

COMMENT ON COLUMN "mfa_methods"."enabled" IS 'Trạng thái kích hoạt sử dụng của phương thức';

COMMENT ON COLUMN "mfa_methods"."created_at" IS 'Thời gian thiết lập';

COMMENT ON COLUMN "api_keys"."id" IS 'API Key ID (Khóa chính)';

COMMENT ON COLUMN "api_keys"."principal_id" IS 'Khóa API này thuộc quyền sở hữu của chủ thể nào (thường là Service Account)';

COMMENT ON COLUMN "api_keys"."name" IS 'Tên gợi nhớ của khóa API (ví dụ: Integration Key ERP)';

COMMENT ON COLUMN "api_keys"."key_hash" IS 'Chuỗi khóa API đã được băm mã hóa để đối chiếu đối soát hệ thống';

COMMENT ON COLUMN "api_keys"."expires_at" IS 'Thời hạn hết hiệu lực của API Key';

COMMENT ON COLUMN "api_keys"."last_used_at" IS 'Thời điểm khóa API này được sử dụng gần nhất';

COMMENT ON COLUMN "api_keys"."revoked_at" IS 'Thời điểm khóa bị chủ động thu hồi/hủy kích hoạt sớm';

COMMENT ON COLUMN "api_keys"."created_at" IS 'Thời gian tạo khóa';

COMMENT ON COLUMN "refresh_tokens"."id" IS 'Khóa chính';

COMMENT ON COLUMN "refresh_tokens"."principal_id" IS 'Token được cấp cho chủ thể nào';

COMMENT ON COLUMN "refresh_tokens"."token_hash" IS 'Chuỗi Refresh Token đã được băm bảo mật để đối chiếu khi cấp lại token mới';

COMMENT ON COLUMN "refresh_tokens"."expires_at" IS 'Thời hạn hết hạn của token';

COMMENT ON COLUMN "refresh_tokens"."revoked_at" IS 'Thời điểm token bị chủ động thu hồi sớm';

COMMENT ON COLUMN "refresh_tokens"."created_at" IS 'Thời gian phát hành token';

COMMENT ON COLUMN "resources"."id" IS 'Resource ID (Khóa chính)';

COMMENT ON COLUMN "resources"."code" IS 'Mã tài nguyên hệ thống (ví dụ: orders, users, reports...)';

COMMENT ON COLUMN "resources"."name" IS 'Tên hiển thị trực quan của tài nguyên';

COMMENT ON COLUMN "actions"."id" IS 'Action ID (Khóa chính)';

COMMENT ON COLUMN "actions"."code" IS 'Mã hành động (ví dụ: create, read, update, delete, export...)';

COMMENT ON COLUMN "actions"."name" IS 'Tên hiển thị của hành động thao tác';

COMMENT ON COLUMN "permission_groups"."id" IS 'Khóa chính - Gom nhóm quyền phục vụ quản lý bộ lọc trên UI phân quyền';

COMMENT ON COLUMN "permission_groups"."code" IS 'Mã nhóm quyền (ví dụ: sales_mgmt, system_setting...)';

COMMENT ON COLUMN "permission_groups"."name" IS 'Tên hiển thị của nhóm phân loại quyền';

COMMENT ON COLUMN "permissions"."id" IS 'Permission ID (Khóa chính)';

COMMENT ON COLUMN "permissions"."permission_group_id" IS 'Mã liên kết nhóm quyền mẫu';

COMMENT ON COLUMN "permissions"."resource_id" IS 'Mã tài nguyên hệ thống gắn liền';

COMMENT ON COLUMN "permissions"."action_id" IS 'Mã hành động tương tác gắn liền';

COMMENT ON COLUMN "permissions"."code" IS 'Mã quyền định danh kết hợp hoàn chỉnh (ví dụ: orders:create, users:delete)';

COMMENT ON COLUMN "permissions"."description" IS 'Mô tả chi tiết tác vụ nghiệp vụ khi có quyền này';

COMMENT ON COLUMN "roles"."id" IS 'Role ID (Khóa chính)';

COMMENT ON COLUMN "roles"."tenant_id" IS 'Vai trò thuộc Tenant nào quản lý';

COMMENT ON COLUMN "roles"."code" IS 'Mã chức danh chức năng (ví dụ: director, admin, accountant...)';

COMMENT ON COLUMN "roles"."name" IS 'Tên chức danh hiển thị trực quan';

COMMENT ON COLUMN "roles"."description" IS 'Mô tả chi tiết ranh giới trách nhiệm công việc của vai trò';

COMMENT ON COLUMN "roles"."is_system" IS 'Đánh dấu vai trò hệ thống mặc định, không cho phép xóa sửa cấu trúc gốc';

COMMENT ON COLUMN "roles"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "roles"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "role_permissions"."role_id" IS 'Mã vai trò nhận cấu hình quyền';

COMMENT ON COLUMN "role_permissions"."permission_id" IS 'Mã quyền mẫu được gán vào vai trò';

COMMENT ON COLUMN "role_permissions"."effect" IS 'Tác động quyền định đoạt (Áp dụng Enum effect_type: allow/deny)';

COMMENT ON COLUMN "principal_roles"."principal_id" IS 'Mã chủ thể định danh nhận quyết định bổ nhiệm vai trò';

COMMENT ON COLUMN "principal_roles"."role_id" IS 'Mã vai trò chức danh được bổ nhiệm';

COMMENT ON COLUMN "principal_roles"."scope_id" IS 'Phạm vi dữ liệu thực thi của vai trò này (ví dụ: trong phòng ban A, trong chi nhánh B...)';

COMMENT ON COLUMN "principal_roles"."assigned_at" IS 'Thời điểm chính thức ký quyết định gán bổ nhiệm vai trò';

COMMENT ON COLUMN "principal_permissions"."principal_id" IS 'Chủ thể nhận quyền đặc hiệu (Hỗ trợ cấp quyền vượt cấp mà không cần tạo Role mới)';

COMMENT ON COLUMN "principal_permissions"."permission_id" IS 'Mã quyền mẫu đặc hiệu được cấu hình trực tiếp';

COMMENT ON COLUMN "principal_permissions"."scope_id" IS 'Giới hạn ranh giới phạm vi dữ liệu thực thi cho đặc quyền này';

COMMENT ON COLUMN "principal_permissions"."effect" IS 'Tác động quyền đặc hiệu định đoạt (ALLOW để thưởng thêm quyền, DENY để tước bỏ quyền riêng lẻ)';

COMMENT ON COLUMN "role_hierarchies"."parent_role_id" IS 'Mã vai trò cha cấp cao hơn (Tự động kế thừa toàn bộ tập quyền từ vai trò con)';

COMMENT ON COLUMN "role_hierarchies"."child_role_id" IS 'Mã vai trò con cấp thấp hơn';

COMMENT ON COLUMN "scopes"."id" IS 'Scope ID (Khóa chính)';

COMMENT ON COLUMN "scopes"."code" IS 'Mã ranh giới dữ liệu (ví dụ: global, tenant_wide, department_wide, personal_only...)';

COMMENT ON COLUMN "scopes"."name" IS 'Tên hiển thị trực quan của phạm vi dữ liệu';

COMMENT ON COLUMN "organizations"."id" IS 'Organization ID (Khóa chính - Định danh một tổ chức/pháp nhân cụ thể)';

COMMENT ON COLUMN "organizations"."tenant_id" IS 'Thuộc tổ chức/Tenant lớn nào';

COMMENT ON COLUMN "organizations"."code" IS 'Mã pháp nhân/công ty duy nhất trong Tenant (ví dụ: fpt_software, fpt_retail...)';

COMMENT ON COLUMN "organizations"."name" IS 'Tên đầy đủ theo giấy phép của tổ chức/pháp nhân';

COMMENT ON COLUMN "organizations"."description" IS 'Mô tả chi tiết lĩnh vực hoạt động hoặc quy mô tổ chức';

COMMENT ON COLUMN "organizations"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "organizations"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "organizations"."deleted_at" IS 'Thời gian xóa tạm (Soft delete)';

COMMENT ON COLUMN "organizations"."version" IS 'Số phiên bản record phục vụ cơ chế ngăn chặn xung đột dữ liệu (Optimistic Locking)';

COMMENT ON COLUMN "organization_unit_types"."id" IS 'Khóa chính';

COMMENT ON COLUMN "organization_unit_types"."code" IS 'Mã phân loại đơn vị hành chính (ví dụ: DIVISION, DEPARTMENT, TEAM, BRANCH...)';

COMMENT ON COLUMN "organization_unit_types"."name" IS 'Tên hiển thị loại đơn vị (Phòng ban, Khối, Trung tâm, Tổ đội...)';

COMMENT ON COLUMN "organization_unit_types"."description" IS 'Mô tả chi tiết về chức năng trách nhiệm tiêu chuẩn của loại đơn vị này';

COMMENT ON COLUMN "organization_units"."id" IS 'Unit ID (Khóa chính - Định danh một phòng ban/đơn vị cụ thể)';

COMMENT ON COLUMN "organization_units"."organization_id" IS 'Thuộc pháp nhân/công ty nào biên chế';

COMMENT ON COLUMN "organization_units"."parent_unit_id" IS 'Mã liên kết tới đơn vị/phòng ban cấp trên trực tiếp';

COMMENT ON COLUMN "organization_units"."unit_type_id" IS 'Liên kết hình thức phân loại đơn vị nội bộ';

COMMENT ON COLUMN "organization_units"."code" IS 'Mã phòng ban/đơn vị nội bộ (ví dụ: hr_dept, backend_team...)';

COMMENT ON COLUMN "organization_units"."name" IS 'Tên phòng ban hiển thị trực quan';

COMMENT ON COLUMN "organization_units"."path" IS 'Chuỗi đường dẫn phả hệ lưu vết từ nút gốc (Materialized Path, ví dụ: /root_id/parent_id/this_id) phục vụ truy vấn cây siêu nhanh';

COMMENT ON COLUMN "organization_units"."level" IS 'Cấp độ sâu của phòng ban trong cây sơ đồ tổ chức (ví dụ: Khối = 1, Phòng = 2, Tổ = 3)';

COMMENT ON COLUMN "organization_units"."sort_order" IS 'Thứ tự sắp xếp hiển thị các phòng ban cùng cấp trên UI sơ đồ cây';

COMMENT ON COLUMN "organization_units"."is_active" IS 'Trạng thái phòng ban còn đang hoạt động hay đã tạm ngưng/giải thể';

COMMENT ON COLUMN "organization_units"."metadata" IS 'Dữ liệu mở rộng động dạng JSON (Lưu cấu hình đặc thù của đơn vị, Key-Value...)';

COMMENT ON COLUMN "organization_units"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "organization_units"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "organization_units"."deleted_at" IS 'Thời gian xóa tạm đơn vị';

COMMENT ON COLUMN "organization_units"."version" IS 'Số phiên bản phục vụ Optimistic Locking';

COMMENT ON COLUMN "positions"."id" IS 'Position ID (Khóa chính)';

COMMENT ON COLUMN "positions"."organization_id" IS 'Vị trí chức danh này được chuẩn hóa cho pháp nhân/công ty nào';

COMMENT ON COLUMN "positions"."code" IS 'Mã chức danh công việc mẫu (ví dụ: ceo, accountant_manager, senior_dev...)';

COMMENT ON COLUMN "positions"."name" IS 'Tên chức danh công việc cụ thể hiển thị (ví dụ: Tổng Giám Đốc, Kế toán trưởng...)';

COMMENT ON COLUMN "positions"."description" IS 'Mô tả mô tả công việc (Job Description) tiêu chuẩn cho vị trí này';

COMMENT ON COLUMN "positions"."level" IS 'Trọng số phân cấp bậc vị trí chức danh (Phục vụ sắp xếp hoặc tính toán luồng phê duyệt duyệt đơn)';

COMMENT ON COLUMN "positions"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "positions"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "cost_centers"."id" IS 'Cost Center ID (Khóa chính)';

COMMENT ON COLUMN "cost_centers"."organization_id" IS 'Trung tâm chi phí này dùng để hạch toán cho pháp nhân nào';

COMMENT ON COLUMN "cost_centers"."code" IS 'Mã trung tâm chi phí hạch toán tài chính (ví dụ: cc_it_hcm, cc_sales_hn...)';

COMMENT ON COLUMN "cost_centers"."name" IS 'Tên trung tâm chi phí hạch toán trực quan';

COMMENT ON COLUMN "cost_centers"."description" IS 'Mô tả chi tiết mục đích hạch toán hoặc ranh giới ngân sách';

COMMENT ON COLUMN "cost_centers"."created_at" IS 'Thời gian khởi tạo trung tâm chi phí';

COMMENT ON COLUMN "organization_calendars"."id" IS 'Calendar ID (Khóa chính)';

COMMENT ON COLUMN "organization_calendars"."organization_id" IS 'Lịch làm việc này áp dụng cho pháp nhân/công ty nào';

COMMENT ON COLUMN "organization_calendars"."name" IS 'Tên lịch làm việc (ví dụ: Lịch khối văn phòng, Lịch công nhân nhà máy...)';

COMMENT ON COLUMN "organization_calendars"."timezone" IS 'Múi giờ áp dụng cho lịch trình (ví dụ: Asia/Ho_Chi_Minh)';

COMMENT ON COLUMN "organization_calendars"."work_days" IS 'Dữ liệu cấu hình động dạng JSON định nghĩa các ngày làm việc và giờ giấc chi tiết trong tuần (ví dụ: Thứ 2 -> Thứ 6, Ca sáng, Ca chiều...)';

COMMENT ON COLUMN "organization_calendars"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "configurations"."id" IS 'Khóa chính';

COMMENT ON COLUMN "configurations"."tenant_id" IS 'Thuộc tổ chức/Tenant nào (Null nếu là cấu hình dùng chung toàn hệ thống)';

COMMENT ON COLUMN "configurations"."config_key" IS 'Từ khóa định danh cấu hình (ví dụ: auth.password_policy, integration.erp_sync_interval)';

COMMENT ON COLUMN "configurations"."config_value" IS 'Giá trị cấu hình thực tế lưu ở định dạng JSON động (Hỗ trợ string, number, object...)';

COMMENT ON COLUMN "configurations"."description" IS 'Mô tả chi tiết ý nghĩa và tác động của cấu hình này';

COMMENT ON COLUMN "configurations"."created_at" IS 'Thời gian tạo cấu hình';

COMMENT ON COLUMN "configurations"."updated_at" IS 'Thời gian cập nhật cấu hình';

COMMENT ON COLUMN "feature_flags"."id" IS 'Khóa chính';

COMMENT ON COLUMN "feature_flags"."tenant_id" IS 'Áp dụng cho Tenant nào (Null nếu là flag dùng chung toàn hệ thống)';

COMMENT ON COLUMN "feature_flags"."code" IS 'Mã định danh tính năng (ví dụ: beta.new_dashboard_v2, payment.momo_integration)';

COMMENT ON COLUMN "feature_flags"."name" IS 'Tên hiển thị của tính năng động này';

COMMENT ON COLUMN "feature_flags"."status" IS 'Trạng thái bật/tắt (Áp dụng Enum feature_flag_status)';

COMMENT ON COLUMN "feature_flags"."metadata" IS 'Cấu hình nâng cao cho việc kích hoạt (ví dụ: phân phối ngẫu nhiên 10% user, phân theo quốc gia...)';

COMMENT ON COLUMN "feature_flags"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "feature_flags"."updated_at" IS 'Thời gian cập nhật';

COMMENT ON COLUMN "numbering_sequences"."id" IS 'Khóa chính';

COMMENT ON COLUMN "numbering_sequences"."tenant_id" IS 'Thuộc tổ chức/Tenant nào biên chế chuỗi mã';

COMMENT ON COLUMN "numbering_sequences"."code" IS 'Mã định danh chuỗi sinh mã (ví dụ: INV_SEQ (Hóa đơn), PO_SEQ (Đơn mua hàng)...)';

COMMENT ON COLUMN "numbering_sequences"."prefix" IS 'Tiền tố đính kèm đầu mã số (ví dụ: INV-, SO-)';

COMMENT ON COLUMN "numbering_sequences"."suffix" IS 'Hậu tố đính kèm cuối mã số (ví dụ: -2026)';

COMMENT ON COLUMN "numbering_sequences"."next_number" IS 'Giá trị số tự tăng tiếp theo sẽ được phát hành (ví dụ: 105, tăng dần lên)';

COMMENT ON COLUMN "numbering_sequences"."padding" IS 'Độ dài tối thiểu của phần số tự tăng để chèn các số 0 phía trước (ví dụ: padding = 5 -> 00105)';

COMMENT ON COLUMN "numbering_sequences"."reset_rule" IS 'Quy tắc reset số thứ tự về lại từ đầu (ví dụ: DAILY (Hàng ngày), MONTHLY, YEARLY, NEVER)';

COMMENT ON COLUMN "numbering_sequences"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "numbering_sequences"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "localization_resources"."id" IS 'Khóa chính';

COMMENT ON COLUMN "localization_resources"."locale" IS 'Mã ngôn ngữ và vùng địa lý (ví dụ: vi-VN, en-US, ja-JP)';

COMMENT ON COLUMN "localization_resources"."resource_key" IS 'Từ khóa văn bản hệ thống (ví dụ: common.buttons.save, errors.auth.failed)';

COMMENT ON COLUMN "localization_resources"."resource_value" IS 'Nội dung văn bản dịch thuật thực tế hiển thị trên UI ứng dụng';

COMMENT ON COLUMN "email_templates"."id" IS 'Email Template ID (Khóa chính)';

COMMENT ON COLUMN "email_templates"."tenant_id" IS 'Mẫu email thuộc Tenant nào quản lý (Null nếu là mẫu mặc định của hệ thống)';

COMMENT ON COLUMN "email_templates"."code" IS 'Mã định danh mẫu email gửi đi (ví dụ: welcome_user, password_reset_request)';

COMMENT ON COLUMN "email_templates"."subject" IS 'Tiêu đề Email (Hỗ trợ các placeholder động dạng {{username}}, {{reset_link}})';

COMMENT ON COLUMN "email_templates"."body" IS 'Nội dung chi tiết của Email (Hỗ trợ cấu trúc mã nguồn HTML/Markdown để render UI)';

COMMENT ON COLUMN "email_templates"."language" IS 'Ngôn ngữ của mẫu Email (ví dụ: vi, en...) phục vụ đa ngôn ngữ';

COMMENT ON COLUMN "email_templates"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "email_templates"."updated_at" IS 'Thời gian cập nhật mẫu gần nhất';

COMMENT ON COLUMN "system_calendars"."id" IS 'Calendar ID (Khóa chính)';

COMMENT ON COLUMN "system_calendars"."tenant_id" IS 'Lịch làm việc chuẩn này thuộc Tenant nào';

COMMENT ON COLUMN "system_calendars"."code" IS 'Mã lịch trình hệ thống (ví dụ: standard_office_cal, night_shift_cal)';

COMMENT ON COLUMN "system_calendars"."name" IS 'Tên lịch làm việc hiển thị trực quan';

COMMENT ON COLUMN "system_calendars"."timezone" IS 'Múi giờ áp dụng điều phối lịch (ví dụ: Asia/Ho_Chi_Minh)';

COMMENT ON COLUMN "system_calendars"."work_days" IS 'Dữ liệu cấu hình JSON định nghĩa các ngày làm việc tiêu chuẩn trong tuần và khung giờ làm việc';

COMMENT ON COLUMN "holidays"."id" IS 'Holiday ID (Khóa chính)';

COMMENT ON COLUMN "holidays"."calendar_id" IS 'Ngày nghỉ lễ này được áp dụng và trừ đi vào lịch làm việc nào';

COMMENT ON COLUMN "holidays"."holiday_date" IS 'Ngày tháng năm diễn ra ngày nghỉ lễ thực tế';

COMMENT ON COLUMN "holidays"."name" IS 'Tên ngày nghỉ lễ hiển thị (ví dụ: Ngày Quốc Khánh, Tết Nguyên Đán...)';

COMMENT ON COLUMN "holidays"."recurring" IS 'Đánh dấu ngày lễ này có lặp lại định kỳ hàng năm vào đúng ngày này không (ví dụ: Đúng ngày Dương lịch)';

COMMENT ON COLUMN "workflow_definitions"."id" IS 'Workflow Definition ID (Khóa chính)';

COMMENT ON COLUMN "workflow_definitions"."tenant_id" IS 'Quy trình thuộc Tenant nào sở hữu';

COMMENT ON COLUMN "workflow_definitions"."code" IS 'Mã quy trình duy nhất (ví dụ: leave_request_wf, expense_claim_wf)';

COMMENT ON COLUMN "workflow_definitions"."name" IS 'Tên quy trình hiển thị trực quan';

COMMENT ON COLUMN "workflow_definitions"."description" IS 'Mô tả chi tiết luồng nghiệp vụ của quy trình';

COMMENT ON COLUMN "workflow_definitions"."version" IS 'Số phiên bản của quy trình (Dùng để quản lý vòng đời quy trình khi thay đổi sơ đồ bước)';

COMMENT ON COLUMN "workflow_definitions"."status" IS 'Trạng thái hoạt động của phiên bản quy trình (Áp dụng Enum workflow_status)';

COMMENT ON COLUMN "workflow_definitions"."metadata" IS 'Dữ liệu cấu hình mở rộng dạng JSON (UI layout, SLA cấu hình toàn cục...)';

COMMENT ON COLUMN "workflow_definitions"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "workflow_definitions"."updated_at" IS 'Thời gian cập nhật';

COMMENT ON COLUMN "workflow_definitions"."deleted_at" IS 'Thời gian xóa tạm (Soft delete)';

COMMENT ON COLUMN "workflow_steps"."id" IS 'Step ID (Khóa chính - Định nghĩa một mắt xích/nút)';

COMMENT ON COLUMN "workflow_steps"."workflow_definition_id" IS 'Thuộc định nghĩa quy trình nào';

COMMENT ON COLUMN "workflow_steps"."code" IS 'Mã bước trong phạm vi quy trình (ví dụ: step_draft, step_dept_manager_review)';

COMMENT ON COLUMN "workflow_steps"."name" IS 'Tên bước hiển thị (ví dụ: Trưởng phòng duyệt, Kế toán kiểm tra)';

COMMENT ON COLUMN "workflow_steps"."step_type" IS 'Đặc tính/Loại bước (Áp dụng Enum workflow_step_type)';

COMMENT ON COLUMN "workflow_steps"."sequence_no" IS 'Thứ tự sắp xếp logic tuyến tính của bước';

COMMENT ON COLUMN "workflow_steps"."assignment_type" IS 'Cơ chế tìm người xử lý tại bước này (Áp dụng Enum assignment_type)';

COMMENT ON COLUMN "workflow_steps"."assignment_config" IS 'Cấu hình chi tiết cho việc gán việc (ví dụ: lưu danh sách user_id, role_id hoặc cấu hình toán tử AND/OR khi duyệt nhóm)';

COMMENT ON COLUMN "workflow_steps"."metadata" IS 'Dữ liệu mở rộng cho bước (Cấu hình tọa độ vẽ sơ đồ UI, SLA giới hạn số giờ duyệt của bước...)';

COMMENT ON COLUMN "workflow_steps"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "workflow_steps"."updated_at" IS 'Thời gian cập nhật';

COMMENT ON COLUMN "workflow_transitions"."id" IS 'Transition ID (Khóa chính - Mũi tên nối bước A sang bước B)';

COMMENT ON COLUMN "workflow_transitions"."workflow_definition_id" IS 'Thuộc định nghĩa quy trình nào';

COMMENT ON COLUMN "workflow_transitions"."from_step_id" IS 'Mã bước nguồn đi ra';

COMMENT ON COLUMN "workflow_transitions"."to_step_id" IS 'Mã bước đích đi vào';

COMMENT ON COLUMN "workflow_transitions"."transition_name" IS 'Tên nút hành động trên UI kích hoạt đường đi này (ví dụ: Đồng ý, Từ chối, Yêu cầu làm lại)';

COMMENT ON COLUMN "workflow_transitions"."condition_expression" IS 'Cấu hình biểu thức điều kiện tự động để rẽ nhánh luồng đi (ví dụ: total_amount > 10.000.000)';

COMMENT ON COLUMN "workflow_transitions"."metadata" IS 'Dữ liệu mở rộng dạng JSON';

COMMENT ON COLUMN "workflow_transitions"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "workflow_transitions"."updated_at" IS 'Thời gian cập nhật';

COMMENT ON COLUMN "workflow_instances"."id" IS 'Instance ID (Khóa chính - Một hồ sơ/đơn từ cụ thể chạy trong quy trình)';

COMMENT ON COLUMN "workflow_instances"."workflow_definition_id" IS 'Hồ sơ này đang chạy theo khuôn mẫu quy trình nào';

COMMENT ON COLUMN "workflow_instances"."target_record_id" IS 'ID của bản ghi nghiệp vụ thực tế nằm ở bảng dữ liệu động (ví dụ: ID đơn xin nghỉ phép số #099)';

COMMENT ON COLUMN "workflow_instances"."current_step_id" IS 'Vị trí hiện tại của hồ sơ đang dừng ở bước nào';

COMMENT ON COLUMN "workflow_instances"."status" IS 'Trạng thái tổng quát của hồ sơ đơn từ (Áp dụng Enum workflow_instance_status)';

COMMENT ON COLUMN "workflow_instances"."started_by_principal_id" IS 'Chủ thể định danh ký đơn/khởi động quy trình';

COMMENT ON COLUMN "workflow_instances"."started_at" IS 'Thời điểm bắt đầu nộp đơn khởi động quy trình';

COMMENT ON COLUMN "workflow_instances"."completed_at" IS 'Thời điểm hồ sơ đi đến bước cuối cùng (hoàn thành hoặc hủy/từ chối hoàn toàn)';

COMMENT ON COLUMN "workflow_instances"."metadata" IS 'Lưu trữ các biến snapshot dữ liệu chạy quy trình tại thời điểm thực thi';

COMMENT ON COLUMN "workflow_instances"."created_at" IS 'Thời gian tạo bản ghi';

COMMENT ON COLUMN "workflow_instances"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "workflow_tasks"."id" IS 'Task ID (Khóa chính - Phiếu giao việc tại một bước duyệt)';

COMMENT ON COLUMN "workflow_tasks"."workflow_instance_id" IS 'Thuộc hồ sơ/phiên thực thi quy trình nào';

COMMENT ON COLUMN "workflow_tasks"."workflow_step_id" IS 'Nhiệm vụ này thuộc bước cấu hình nào';

COMMENT ON COLUMN "workflow_tasks"."assignee_principal_id" IS 'Chủ thể cá nhân chịu trách nhiệm xử lý phiếu việc này (Người duyệt/Người làm)';

COMMENT ON COLUMN "workflow_tasks"."status" IS 'Trạng thái xử lý của phiếu việc (Áp dụng Enum workflow_task_status)';

COMMENT ON COLUMN "workflow_tasks"."due_at" IS 'Thời hạn muộn nhất phải xử lý xong nhiệm vụ (Hạn SLA)';

COMMENT ON COLUMN "workflow_tasks"."remind_at" IS 'Thời điểm hệ thống tự động bắn thông báo nhắc nhở việc tồn đọng';

COMMENT ON COLUMN "workflow_tasks"."priority" IS 'Độ ưu tiên xử lý nhiệm vụ (1: Thấp, 2: Thường, 3: Cao, Khẩn cấp)';

COMMENT ON COLUMN "workflow_tasks"."assigned_at" IS 'Thời điểm phát hành phiếu việc gán cho nhân sự';

COMMENT ON COLUMN "workflow_tasks"."completed_at" IS 'Thời điểm nhân sự hoàn thành bấm xử lý phiếu';

COMMENT ON COLUMN "workflow_tasks"."comment" IS 'Ý kiến phê duyệt, lý do từ chối hoặc giải trình của người xử lý';

COMMENT ON COLUMN "workflow_tasks"."metadata" IS 'Dữ liệu mở rộng dạng JSON';

COMMENT ON COLUMN "workflow_tasks"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "workflow_tasks"."updated_at" IS 'Thời gian cập nhật';

COMMENT ON COLUMN "workflow_histories"."id" IS 'History ID (Khóa chính - Nhật ký bất biến lưu phả hệ luồng duyệt)';

COMMENT ON COLUMN "workflow_histories"."workflow_instance_id" IS 'Thuộc hồ sơ/phiên thực thi quy trình nào';

COMMENT ON COLUMN "workflow_histories"."workflow_step_id" IS 'Sự kiện diễn ra tại bước nào';

COMMENT ON COLUMN "workflow_histories"."actor_principal_id" IS 'Chủ thể trực tiếp tương tác bấm nút thực hiện hành động';

COMMENT ON COLUMN "workflow_histories"."action" IS 'Tên hành động thực thi hệ thống ghi nhận (ví dụ: submit, approve, reject, delegate...)';

COMMENT ON COLUMN "workflow_histories"."from_status" IS 'Trạng thái instance trước khi bấm nút';

COMMENT ON COLUMN "workflow_histories"."to_status" IS 'Trạng thái instance chuyển đổi sau khi bấm nút thành công';

COMMENT ON COLUMN "workflow_histories"."comment" IS 'Bản sao ý kiến phê duyệt/bình luận đính kèm tại thời điểm bấm nút';

COMMENT ON COLUMN "workflow_histories"."metadata" IS 'Lưu trữ các dữ liệu kỹ thuật snapshot luồng đi tại thời điểm ghi log';

COMMENT ON COLUMN "workflow_histories"."created_at" IS 'Thời điểm ghi nhận nhật ký lịch sử bất biến';

COMMENT ON COLUMN "notification_templates"."id" IS 'Template ID (Khóa chính)';

COMMENT ON COLUMN "notification_templates"."tenant_id" IS 'Mẫu thông báo thuộc quyền sở hữu của Tenant nào (Null nếu là mẫu Global hệ thống)';

COMMENT ON COLUMN "notification_templates"."code" IS 'Mã mẫu thông báo duy nhất (ví dụ: password_reset, task_assigned)';

COMMENT ON COLUMN "notification_templates"."name" IS 'Tên mẫu hiển thị trên trang cấu hình quản trị';

COMMENT ON COLUMN "notification_templates"."channel" IS 'Kênh truyền tải định nghĩa của mẫu (Áp dụng Enum notification_channel)';

COMMENT ON COLUMN "notification_templates"."subject" IS 'Tiêu đề mặc định của mẫu (Hỗ trợ các placeholder động như {{title}})';

COMMENT ON COLUMN "notification_templates"."body" IS 'Nội dung chi tiết mẫu thông báo (Hỗ trợ cấu trúc mã nguồn HTML, Markdown hoặc biến mẫu động)';

COMMENT ON COLUMN "notification_templates"."language" IS 'Mã ngôn ngữ cấu hình của mẫu (ví dụ: vi, en...) phục vụ đa ngôn ngữ i18n';

COMMENT ON COLUMN "notification_templates"."is_active" IS 'Mẫu thông báo này còn đang được phép áp dụng để sinh tin nhắn hay không';

COMMENT ON COLUMN "notification_templates"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "notification_templates"."updated_at" IS 'Thời gian cập nhật';

COMMENT ON COLUMN "notifications"."id" IS 'Notification ID (Khóa chính - Phiên phát thông báo)';

COMMENT ON COLUMN "notifications"."tenant_id" IS 'Phiên phát thông báo thuộc Tenant nào';

COMMENT ON COLUMN "notifications"."template_id" IS 'Được biên dịch từ mẫu cấu hình nào (Null nếu là tin tùy biến bắn trực tiếp)';

COMMENT ON COLUMN "notifications"."target_module" IS 'Tên phân hệ nghiệp vụ phát ra thông báo (ví dụ: HRM, CRM, WORKFLOW...)';

COMMENT ON COLUMN "notifications"."target_entity" IS 'Tên thực thể nghiệp vụ kích hoạt phát tin (ví dụ: leave_requests, tasks...)';

COMMENT ON COLUMN "notifications"."target_record_id" IS 'ID của bản ghi nghiệp vụ thực tế tương ứng để liên kết chuyển hướng sâu (Deep Link) khi bấm vào thông báo';

COMMENT ON COLUMN "notifications"."title" IS 'Tiêu đề thông báo cuối cùng sau khi đã điền đầy đủ các tham số động';

COMMENT ON COLUMN "notifications"."message" IS 'Nội dung thông báo hoàn chỉnh đã biên dịch để chuẩn bị đẩy sang hàng đợi';

COMMENT ON COLUMN "notifications"."metadata" IS 'Lưu trữ các dữ liệu payload phụ đính kèm (ví dụ: custom deep link url, route param...)';

COMMENT ON COLUMN "notifications"."created_by_principal_id" IS 'Chủ thể định danh ra lệnh phát thông báo này (Có thể là ID của Service Account hệ thống)';

COMMENT ON COLUMN "notifications"."scheduled_at" IS 'Thời gian đặt lịch phát thông báo (Để trống nếu muốn đẩy đi ngay lập tức)';

COMMENT ON COLUMN "notifications"."created_at" IS 'Thời gian khởi tạo bản ghi';

COMMENT ON COLUMN "notification_recipients"."id" IS 'Khóa chính - Danh sách người nhận của một thông báo';

COMMENT ON COLUMN "notification_recipients"."notification_id" IS 'Thuộc phiên phát thông báo nào';

COMMENT ON COLUMN "notification_recipients"."principal_id" IS 'Chủ thể định danh nhận thông báo';

COMMENT ON COLUMN "notification_recipients"."is_read" IS 'Trạng thái đã đọc thông báo hay chưa (Đặc biệt dùng cho luồng IN_APP)';

COMMENT ON COLUMN "notification_recipients"."read_at" IS 'Thời điểm người dùng bấm xem/đọc thông báo thực tế';

COMMENT ON COLUMN "notification_recipients"."created_at" IS 'Thời gian gán đối tượng nhận';

COMMENT ON COLUMN "notification_deliveries"."id" IS 'Delivery ID (Khóa chính - Phiên vận chuyển vật lý qua Gateway)';

COMMENT ON COLUMN "notification_deliveries"."recipient_id" IS 'Lệnh vận chuyển vật lý này phục vụ cho người nhận cụ thể nào';

COMMENT ON COLUMN "notification_deliveries"."channel" IS 'Kênh truyền tải thực hiện gửi tin (Áp dụng Enum notification_channel)';

COMMENT ON COLUMN "notification_deliveries"."status" IS 'Trạng thái truyền tin vật lý thực tế (Áp dụng Enum notification_status)';

COMMENT ON COLUMN "notification_deliveries"."provider" IS 'Tên nhà cung cấp/Gateway hạ tầng xử lý vật lý (ví dụ: sendgrid, twilio, firebase, fpt-sms...)';

COMMENT ON COLUMN "notification_deliveries"."provider_message_id" IS 'Mã định danh tin nhắn do phía Provider bên thứ ba phản hồi về (phục vụ tracking trạng thái DLR/Webhooks lỗi)';

COMMENT ON COLUMN "notification_deliveries"."retry_count" IS 'Số lần hệ thống đã tự động thử gửi lại khi gặp sự cố ngắt kết nối tạm thời';

COMMENT ON COLUMN "notification_deliveries"."sent_at" IS 'Thời điểm hệ thống hoàn tất lệnh bắn tin sang phía Gateway';

COMMENT ON COLUMN "notification_deliveries"."delivered_at" IS 'Thời điểm Gateway phản hồi thông tin thiết bị/đầu cuối đã nhận thành công';

COMMENT ON COLUMN "notification_deliveries"."failed_at" IS 'Thời điểm ghi nhận lệnh gửi thất bại hẳn';

COMMENT ON COLUMN "notification_deliveries"."error_message" IS 'Chi tiết thông điệp báo lỗi kỹ thuật thu về từ Gateway nếu tiến trình gửi lỗi';

COMMENT ON COLUMN "notification_deliveries"."created_at" IS 'Thời gian tạo lệnh vận chuyển';

COMMENT ON COLUMN "files"."id" IS 'File ID (Khóa chính - Định danh hồ sơ tệp tin cha)';

COMMENT ON COLUMN "files"."tenant_id" IS 'Tệp tin này thuộc quyền sở hữu dữ liệu của Tenant nào';

COMMENT ON COLUMN "files"."code" IS 'Mã định danh tệp tin tùy chọn (ví dụ: avatar_admin, contract_template_01)';

COMMENT ON COLUMN "files"."file_name" IS 'Tên tệp tin hiển thị trực quan (bao gồm cả đuôi mở rộng, ví dụ: bao_cao_tai_chinh.pdf)';

COMMENT ON COLUMN "files"."mime_type" IS 'Kiểu định dạng nội dung internet của tệp (ví dụ: application/pdf, image/png...)';

COMMENT ON COLUMN "files"."extension" IS 'Đuôi mở rộng của tệp tin (ví dụ: pdf, docx, xlsx, zip...)';

COMMENT ON COLUMN "files"."visibility" IS 'Cấp độ hiển thị/quyền hạn tiếp cận tệp (Áp dụng Enum file_visibility)';

COMMENT ON COLUMN "files"."current_version" IS 'Số thứ tự phiên bản mới nhất hiện tại của tệp (Đồng bộ với bảng file_versions)';

COMMENT ON COLUMN "files"."size" IS 'Dung lượng của phiên bản tệp hiện tại (tính bằng đơn vị Byte)';

COMMENT ON COLUMN "files"."checksum" IS 'Mã băm kiểm tra tính toàn vẹn dữ liệu (MD5/SHA-256) giúp phát hiện trùng lặp dữ liệu thô';

COMMENT ON COLUMN "files"."metadata" IS 'Dữ liệu mở rộng động dạng JSON (Lưu kích thước ảnh width/height, thời lượng video...)';

COMMENT ON COLUMN "files"."created_by_principal_id" IS 'Chủ thể định danh thực hiện tải tệp tin này lên lần đầu tiên';

COMMENT ON COLUMN "files"."created_at" IS 'Thời gian tải lên ban đầu';

COMMENT ON COLUMN "files"."updated_at" IS 'Thời gian cập nhật tệp gần nhất';

COMMENT ON COLUMN "file_versions"."id" IS 'File Version ID (Khóa chính)';

COMMENT ON COLUMN "file_versions"."file_id" IS 'Mã liên kết tới hồ sơ tệp tin gốc';

COMMENT ON COLUMN "file_versions"."version" IS 'Số thứ tự phiên bản (Tự tăng từ 1, 2, 3... khi người dùng ghi đè tệp tin)';

COMMENT ON COLUMN "file_versions"."storage_provider" IS 'Hạ tầng lưu trữ vật lý của phiên bản này (Áp dụng Enum file_storage_provider)';

COMMENT ON COLUMN "file_versions"."storage_key" IS 'Đường dẫn tương đối lưu trữ vật lý của tệp bên trong Bucket (Object Key, dùng để gọi lên hạ tầng Cloud)';

COMMENT ON COLUMN "file_versions"."size" IS 'Dung lượng của riêng phiên bản tệp tin này (Byte)';

COMMENT ON COLUMN "file_versions"."checksum" IS 'Mã băm toàn vẹn dữ liệu riêng biệt cho phiên bản này';

COMMENT ON COLUMN "file_versions"."uploaded_by_principal_id" IS 'Chủ thể thực hiện hành động tải đè tạo ra phiên bản mới này';

COMMENT ON COLUMN "file_versions"."uploaded_at" IS 'Thời điểm phiên bản này được tải lên hệ thống';

COMMENT ON COLUMN "file_attachments"."id" IS 'Khóa chính - Bản ghi liên kết đính kèm file vật lý vào các thực thể nghiệp vụ';

COMMENT ON COLUMN "file_attachments"."file_id" IS 'Mã tệp tin được chọn để làm đính kèm';

COMMENT ON COLUMN "file_attachments"."target_module" IS 'Tên phân hệ nghiệp vụ cần đính kèm file (ví dụ: WORKFLOW, HRM, PROCUREMENT...)';

COMMENT ON COLUMN "file_attachments"."target_entity" IS 'Tên thực thể/Bảng nghiệp vụ cần đính kèm file (ví dụ: leave_requests, contracts, wiki_pages...)';

COMMENT ON COLUMN "file_attachments"."target_record_id" IS 'ID của bản ghi nghiệp vụ thực tế tương ứng cần đính kèm file tài liệu này';

COMMENT ON COLUMN "file_attachments"."attached_by_principal_id" IS 'Chủ thể thực hiện hành động đính kèm file này vào hồ sơ nghiệp vụ';

COMMENT ON COLUMN "file_attachments"."created_at" IS 'Thời điểm thực hiện hành động liên kết đính kèm';

COMMENT ON COLUMN "audit_logs"."id" IS 'Audit Log ID (Khóa chính)';

COMMENT ON COLUMN "audit_logs"."tenant_id" IS 'Sự kiện kiểm toán xảy ra thuộc Tenant nào';

COMMENT ON COLUMN "audit_logs"."target_module" IS 'Tên phân hệ nghiệp vụ nơi xảy ra sự kiện (ví dụ: HRM, CRM, CONFIGURATION...)';

COMMENT ON COLUMN "audit_logs"."target_entity" IS 'Tên thực thể/Bảng dữ liệu bị tác động (ví dụ: users, roles, contracts...)';

COMMENT ON COLUMN "audit_logs"."target_record_id" IS 'ID của bản ghi dữ liệu cụ thể bị tác động hoặc can thiệp';

COMMENT ON COLUMN "audit_logs"."action" IS 'Loại hành vi tác động được thực hiện (Áp dụng Enum audit_action)';

COMMENT ON COLUMN "audit_logs"."actor_principal_id" IS 'Chủ thể định danh trực tiếp thực hiện hành động này';

COMMENT ON COLUMN "audit_logs"."ip_address" IS 'Địa chỉ IP mạng của thiết bị phát ra request đầu cuối';

COMMENT ON COLUMN "audit_logs"."user_agent" IS 'Thông tin môi trường thiết bị, hệ điều hành và trình duyệt của client';

COMMENT ON COLUMN "audit_logs"."request_id" IS 'Mã định danh lượt gọi API (Correlation ID) dùng để trace chéo với hệ thống APM Log và Error Log kỹ thuật';

COMMENT ON COLUMN "audit_logs"."metadata" IS 'Lưu trữ các payload phụ đính kèm (ví dụ: context bổ sung, snapshot bổ trợ hành vi...)';

COMMENT ON COLUMN "audit_logs"."created_at" IS 'Thời điểm ghi nhận nhật ký kiểm toán bất biến (Có múi giờ)';

COMMENT ON COLUMN "audit_details"."id" IS 'Khóa chính';

COMMENT ON COLUMN "audit_details"."audit_log_id" IS 'Thuộc bản ghi nhật ký kiểm toán cha nào';

COMMENT ON COLUMN "audit_details"."field_name" IS 'Tên trường/cột dữ liệu bị biến động (ví dụ: status, legal_name, email...)';

COMMENT ON COLUMN "audit_details"."old_value" IS 'Giá trị cũ TRƯỚC KHI thực hiện hành động sửa đổi (Dạng văn bản thô hoặc JSON string)';

COMMENT ON COLUMN "audit_details"."new_value" IS 'Giá trị mới SAU KHI thực hiện hành động sửa đổi';

COMMENT ON COLUMN "audit_exports"."id" IS 'Khóa chính - Theo dõi hành vi xuất dữ liệu log an ninh để tránh thất thoát dữ liệu';

COMMENT ON COLUMN "audit_exports"."tenant_id" IS 'Hoạt động kết xuất dữ liệu thuộc Tenant nào';

COMMENT ON COLUMN "audit_exports"."exported_by_principal_id" IS 'Chủ thể (thường là đặc quyền Super Admin) thực hiện lệnh xuất file dữ liệu kiểm toán';

COMMENT ON COLUMN "audit_exports"."file_id" IS 'Khóa ngoại liên kết tới file dữ liệu (.csv, .xlsx) được sinh ra trong hệ thống quản lý file';

COMMENT ON COLUMN "audit_exports"."exported_at" IS 'Thời điểm thực hiện hành động kết xuất file thành công';

COMMENT ON COLUMN "audit_exports"."filters" IS 'Lưu cấu hình bộ lọc dữ liệu động dạng JSON được áp dụng khi xuất log (ví dụ: lưu dải ngày lọc, lọc theo module nào...)';

COMMENT ON COLUMN "comments"."id" IS 'Comment ID (Khóa chính)';

COMMENT ON COLUMN "comments"."tenant_id" IS 'Bình luận thuộc không gian dữ liệu của Tenant nào';

COMMENT ON COLUMN "comments"."target_module" IS 'Tên phân hệ nghiệp vụ chứa bình luận (ví dụ: WORKFLOW, PROJECT, CRM...)';

COMMENT ON COLUMN "comments"."target_entity" IS 'Tên bảng/Thực thể nghiệp vụ cụ thể cần bình luận (ví dụ: tasks, contracts, wiki_pages...)';

COMMENT ON COLUMN "comments"."target_record_id" IS 'ID của bản ghi nghiệp vụ thực tế tương ứng làm mục tiêu thảo luận';

COMMENT ON COLUMN "comments"."parent_comment_id" IS 'Mã liên kết tới bình luận cấp cha nếu đây là một lượt phản hồi (Reply) tạo luồng Threaded Comment';

COMMENT ON COLUMN "comments"."author_principal_id" IS 'Chủ thể định danh viết nội dung bình luận này';

COMMENT ON COLUMN "comments"."content" IS 'Nội dung chi tiết văn bản của bình luận (Hỗ trợ định dạng Rich Text hoặc Markdown thô)';

COMMENT ON COLUMN "comments"."status" IS 'Trạng thái hiển thị của bình luận (Áp dụng Enum comment_status)';

COMMENT ON COLUMN "comments"."metadata" IS 'Lưu trữ các payload phụ đính kèm (ví dụ: danh sách file đính kèm nhanh, định dạng UI bổ trợ...)';

COMMENT ON COLUMN "comments"."created_at" IS 'Thời điểm đăng bình luận';

COMMENT ON COLUMN "comments"."updated_at" IS 'Thời điểm chỉnh sửa nội dung bình luận gần nhất';

COMMENT ON COLUMN "comments"."deleted_at" IS 'Thời điểm thực hiện xóa bình luận';

COMMENT ON COLUMN "comment_mentions"."id" IS 'Khóa chính';

COMMENT ON COLUMN "comment_mentions"."comment_id" IS 'Nằm trong nội dung bình luận nào';

COMMENT ON COLUMN "comment_mentions"."principal_id" IS 'Chủ thể định danh được tag/nhắc tên vào cuộc hội thoại (Phục vụ trigger bắn thông báo nhanh)';

COMMENT ON COLUMN "comment_mentions"."created_at" IS 'Thời điểm ghi nhận lượt nhắc tên';

COMMENT ON COLUMN "comment_reactions"."id" IS 'Khóa chính';

COMMENT ON COLUMN "comment_reactions"."comment_id" IS 'Cảm xúc này thả cho bình luận nào';

COMMENT ON COLUMN "comment_reactions"."principal_id" IS 'Chủ thể định danh thực hiện thả cảm xúc';

COMMENT ON COLUMN "comment_reactions"."reaction" IS 'Mã định danh loại cảm xúc (ví dụ: LIKE, LOVE, THUMBS_UP, CLAP, LAUGH...)';

COMMENT ON COLUMN "comment_reactions"."created_at" IS 'Thời điểm thả cảm xúc';

COMMENT ON COLUMN "custom_field_definitions"."id" IS 'Definition ID (Khóa chính - Định nghĩa trường động)';

COMMENT ON COLUMN "custom_field_definitions"."tenant_id" IS 'Trường động này thuộc không gian cấu hình của Tenant nào';

COMMENT ON COLUMN "custom_field_definitions"."target_module" IS 'Tên phân hệ nghiệp vụ áp dụng trường động (ví dụ: CRM, HRM, PROCUREMENT...)';

COMMENT ON COLUMN "custom_field_definitions"."target_entity" IS 'Tên thực thể/Bảng nghiệp vụ cần chèn trường động (ví dụ: customers, employees, products...)';

COMMENT ON COLUMN "custom_field_definitions"."code" IS 'Mã định danh kỹ thuật của trường (ví dụ: c_passport_no, c_membership_level...)';

COMMENT ON COLUMN "custom_field_definitions"."name" IS 'Tên nhãn hiển thị của trường động trên giao diện UI (ví dụ: Số hộ chiếu, Hạng thành viên)';

COMMENT ON COLUMN "custom_field_definitions"."field_type" IS 'Kiểu dữ liệu kỹ thuật của trường (Áp dụng Enum custom_field_type)';

COMMENT ON COLUMN "custom_field_definitions"."is_required" IS 'Đánh dấu trường này có bắt buộc phải nhập dữ liệu khi lưu form hay không';

COMMENT ON COLUMN "custom_field_definitions"."default_value" IS 'Giá trị mặc định tự điền của trường nếu người dùng để trống khi khởi tạo form';

COMMENT ON COLUMN "custom_field_definitions"."validation_rules" IS 'Quy tắc kiểm tra tính hợp lệ dữ liệu dạng JSON (ví dụ: min_value, max_value, validation_regex...)';

COMMENT ON COLUMN "custom_field_definitions"."display_order" IS 'Thứ tự sắp xếp hiển thị của trường động này trên form giao diện UI';

COMMENT ON COLUMN "custom_field_definitions"."metadata" IS 'Cấu hình mở rộng dạng JSON (Lưu placeholder text, tooltip hướng dẫn, CSS class...)';

COMMENT ON COLUMN "custom_field_definitions"."created_by_principal_id" IS 'Chủ thể định danh (Admin) thực hiện cấu hình tạo trường động này';

COMMENT ON COLUMN "custom_field_definitions"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "custom_field_definitions"."updated_at" IS 'Thời gian cập nhật cấu hình gần nhất';

COMMENT ON COLUMN "custom_field_options"."id" IS 'Option ID (Khóa chính)';

COMMENT ON COLUMN "custom_field_options"."custom_field_definition_id" IS 'Tùy chọn này thuộc quyền sở hữu của trường định nghĩa nào (Chỉ dùng cho kiểu dữ liệu select/multiselect)';

COMMENT ON COLUMN "custom_field_options"."value" IS 'Giá trị lưu xuống database cơ sở dữ liệu khi chọn (Mã code/Value kỹ thuật, ví dụ: gold, silver)';

COMMENT ON COLUMN "custom_field_options"."label" IS 'Văn bản trực quan hiển thị trên UI cho người dùng đọc (ví dụ: Thành viên Vàng, Thành viên Bạc)';

COMMENT ON COLUMN "custom_field_options"."sort_order" IS 'Thứ tự sắp xếp hiển thị của các dòng tùy chọn trong hộp Dropdown';

COMMENT ON COLUMN "custom_field_options"."is_active" IS 'Tùy chọn này còn khả dụng để lựa chọn trên form nữa hay không';

COMMENT ON COLUMN "custom_field_values"."id" IS 'Khóa chính';

COMMENT ON COLUMN "custom_field_values"."custom_field_definition_id" IS 'Giá trị này áp dụng điền cho trường tùy biến định nghĩa nào';

COMMENT ON COLUMN "custom_field_values"."target_record_id" IS 'ID của bản ghi nghiệp vụ thực tế chứa giá trị này (ví dụ: ID của khách hàng Nguyễn Văn A)';

COMMENT ON COLUMN "custom_field_values"."value" IS 'Giá trị thực tế được điền, lưu ở định dạng JSON động nhằm bao quát hết mọi kiểu dữ liệu từ đơn trị (text, số) cho đến đa trị (mảng từ multiselect, object từ json)';

COMMENT ON COLUMN "custom_field_values"."created_at" IS 'Thời điểm tạo mới giá trị';

COMMENT ON COLUMN "custom_field_values"."updated_at" IS 'Thời điểm cập nhật thay đổi giá trị gần nhất';

COMMENT ON COLUMN "tags"."id" IS 'Tag ID (Khóa chính)';

COMMENT ON COLUMN "tags"."tenant_id" IS 'Thẻ phân loại thuộc không gian dữ liệu của Tenant nào';

COMMENT ON COLUMN "tags"."code" IS 'Mã kỹ thuật của thẻ viết liền không dấu (ví dụ: vip_customer, urgent, hot_deal...)';

COMMENT ON COLUMN "tags"."name" IS 'Tên thẻ hiển thị trực quan trên giao diện UI (ví dụ: Khách hàng VIP, Khẩn cấp, Giá hời...)';

COMMENT ON COLUMN "tags"."color" IS 'Mã màu sắc đại diện hiển thị cho thẻ (Ví dụ lưu mã màu Hex: #EF4444 hoặc tên lớp màu Tailwind: red-500)';

COMMENT ON COLUMN "tags"."description" IS 'Mô tả ngắn gọn tiêu chí hoặc mục đích áp dụng thẻ từ khóa này';

COMMENT ON COLUMN "tags"."created_by_principal_id" IS 'Chủ thể định danh (User/Admin) thực hiện khởi tạo thẻ phân loại này';

COMMENT ON COLUMN "tags"."created_at" IS 'Thời gian tạo thẻ';

COMMENT ON COLUMN "tags"."updated_at" IS 'Thời gian cập nhật thông tin thẻ gần nhất';

COMMENT ON COLUMN "tag_assignments"."id" IS 'Khóa chính - Ghi nhận một lượt gắn nhãn dán vào hồ sơ nghiệp vụ';

COMMENT ON COLUMN "tag_assignments"."tag_id" IS 'Mã liên kết tới thẻ phân loại được chọn để gắn dán';

COMMENT ON COLUMN "tag_assignments"."target_module" IS 'Tên phân hệ nghiệp vụ chứa hồ sơ cần gắn nhãn (ví dụ: CRM, WORKFLOW, HRM, SCM...)';

COMMENT ON COLUMN "tag_assignments"."target_entity" IS 'Tên thực thể/Bảng nghiệp vụ cần gắn nhãn (ví dụ: customers, tasks, employees, products...)';

COMMENT ON COLUMN "tag_assignments"."target_record_id" IS 'ID của bản ghi nghiệp vụ thực tế tương ứng được gắn nhãn dán (ví dụ: ID của công việc A)';

COMMENT ON COLUMN "tag_assignments"."assigned_by_principal_id" IS 'Chủ thể định danh trực tiếp thực hiện hành động gán gắn thẻ này vào hồ sơ';

COMMENT ON COLUMN "tag_assignments"."assigned_at" IS 'Thời điểm thực hiện hành động gắn nhãn';

COMMENT ON COLUMN "employees"."id" IS 'Employee ID (Khóa chính)';

COMMENT ON COLUMN "employees"."tenant_id" IS 'Nhân sự thuộc không gian dữ liệu Tenant nào';

COMMENT ON COLUMN "employees"."employee_no" IS 'Mã số nhân viên (Mã nhân sự duy nhất trong công ty, ví dụ: EMP001, FPT-1052...)';

COMMENT ON COLUMN "employees"."principal_id" IS 'Liên kết 1-1 tới chủ thể định danh hệ thống (Phục vụ phân quyền và nhận diện user)';

COMMENT ON COLUMN "employees"."first_name" IS 'Tên và tên đệm (ví dụ: Văn A)';

COMMENT ON COLUMN "employees"."last_name" IS 'Họ nhân viên (ví dụ: Nguyễn)';

COMMENT ON COLUMN "employees"."preferred_name" IS 'Tên gọi khác/Biệt danh/Tên tiếng Anh nếu có (ví dụ: Tony)';

COMMENT ON COLUMN "employees"."gender" IS 'Giới tính (Áp dụng Enum gender)';

COMMENT ON COLUMN "employees"."date_of_birth" IS 'Ngày tháng năm sinh';

COMMENT ON COLUMN "employees"."marital_status" IS 'Tình trạng hôn nhân (Áp dụng Enum marital_status)';

COMMENT ON COLUMN "employees"."nationality" IS 'Quốc tịch (ví dụ: Vietnamese, American...)';

COMMENT ON COLUMN "employees"."national_id" IS 'Số Căn cước công dân / Chứng minh nhân dân';

COMMENT ON COLUMN "employees"."passport_no" IS 'Số hộ chiếu';

COMMENT ON COLUMN "employees"."tax_number" IS 'Mã số thuế cá nhân';

COMMENT ON COLUMN "employees"."avatar_file_id" IS 'Mã liên kết tới file ảnh chân dung/đại diện trong hệ thống quản lý file';

COMMENT ON COLUMN "employees"."status" IS 'Trạng thái lao động (ví dụ: PROBATION (Thử việc), ACTIVE (Chính thức), SUSPENDED, TERMINATED (Đã nghỉ việc)...)';

COMMENT ON COLUMN "employees"."metadata" IS 'Lưu trữ thông tin bổ sung động dạng JSON';

COMMENT ON COLUMN "employees"."created_at" IS 'Thời gian tạo hồ sơ';

COMMENT ON COLUMN "employees"."updated_at" IS 'Thời gian cập nhật hồ sơ gần nhất';

COMMENT ON COLUMN "employees"."deleted_at" IS 'Thời gian xóa tạm hồ sơ (Soft delete)';

COMMENT ON COLUMN "employee_contacts"."id" IS 'Khóa chính';

COMMENT ON COLUMN "employee_contacts"."employee_id" IS 'Thông tin liên hệ này thuộc về nhân viên nào';

COMMENT ON COLUMN "employee_contacts"."contact_type" IS 'Phân loại hình thức liên hệ (ví dụ: PERSONAL_EMAIL, WORK_EMAIL, PERSONAL_PHONE, WORK_PHONE, SKYPE...)';

COMMENT ON COLUMN "employee_contacts"."value" IS 'Giá trị thông tin liên hệ (Địa chỉ email cụ thể hoặc số điện thoại)';

COMMENT ON COLUMN "employee_contacts"."is_primary" IS 'Đánh dấu đây có phải là thông tin liên hệ chính/mặc định để hệ thống liên lạc hay không';

COMMENT ON COLUMN "employee_contacts"."verified_at" IS 'Thời điểm thông tin liên hệ này được xác thực chính chủ thành công (nếu có)';

COMMENT ON COLUMN "employee_contacts"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "employee_addresses"."id" IS 'Khóa chính';

COMMENT ON COLUMN "employee_addresses"."employee_id" IS 'Địa chỉ này thuộc về nhân viên nào';

COMMENT ON COLUMN "employee_addresses"."address_type" IS 'Phân loại địa chỉ (ví dụ: PERMANENT (Thường trú), CURRENT (Tạm trú/Chỗ ở hiện tại)...)';

COMMENT ON COLUMN "employee_addresses"."country" IS 'Quốc gia (ví dụ: Việt Nam)';

COMMENT ON COLUMN "employee_addresses"."state" IS 'Tỉnh / Thành phố trực thuộc trung ương (ví dụ: Thành phố Hồ Chí Minh, Đà Nẵng...)';

COMMENT ON COLUMN "employee_addresses"."city" IS 'Thành phố thuộc tỉnh / Quận / Huyện';

COMMENT ON COLUMN "employee_addresses"."district" IS 'Quận / Huyện / Thị xã';

COMMENT ON COLUMN "employee_addresses"."ward" IS 'Phường / Xã / Thị trấn';

COMMENT ON COLUMN "employee_addresses"."address_line" IS 'Địa chỉ chi tiết số nhà, tên đường, khu phố';

COMMENT ON COLUMN "employee_addresses"."postal_code" IS 'Mã bưu chính';

COMMENT ON COLUMN "employee_addresses"."is_primary" IS 'Đánh dấu đây có phải là địa chỉ chính/mặc định không';

COMMENT ON COLUMN "employee_addresses"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "employee_emergency_contacts"."id" IS 'Khóa chính';

COMMENT ON COLUMN "employee_emergency_contacts"."employee_id" IS 'Thông tin liên hệ khẩn cấp của nhân viên nào';

COMMENT ON COLUMN "employee_emergency_contacts"."full_name" IS 'Họ và tên của người liên hệ khẩn cấp';

COMMENT ON COLUMN "employee_emergency_contacts"."relationship" IS 'Mối quan hệ với nhân viên (ví dụ: Cha, Mẹ, Vợ, Chồng, Anh ruột...)';

COMMENT ON COLUMN "employee_emergency_contacts"."phone" IS 'Số điện thoại liên lạc';

COMMENT ON COLUMN "employee_emergency_contacts"."email" IS 'Địa chỉ email người liên hệ khẩn cấp';

COMMENT ON COLUMN "employee_emergency_contacts"."address" IS 'Địa chỉ nơi ở của người liên hệ khẩn cấp';

COMMENT ON COLUMN "employee_emergency_contacts"."priority" IS 'Thứ tự ưu tiên gọi khi xảy ra sự cố khẩn cấp (Số càng nhỏ ưu tiên gọi trước, ví dụ: 1, 2...)';

COMMENT ON COLUMN "employee_emergency_contacts"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "employee_documents"."id" IS 'Khóa chính';

COMMENT ON COLUMN "employee_documents"."employee_id" IS 'Tài liệu giấy tờ này thuộc về nhân viên nào';

COMMENT ON COLUMN "employee_documents"."document_type" IS 'Phân loại giấy tờ văn bằng (ví dụ: LABOR_CONTRACT (Hợp đồng lao động), DEGREE (Bằng đại học), CERTIFICATE (Chứng chỉ), HEALTH_CHECK (Giấy khám sức khỏe)...)';

COMMENT ON COLUMN "employee_documents"."document_number" IS 'Số hiệu của văn bản/tài liệu (ví dụ: Số hợp đồng, Số bằng...)';

COMMENT ON COLUMN "employee_documents"."issued_date" IS 'Ngày cấp / Ngày ký ban hành văn bản';

COMMENT ON COLUMN "employee_documents"."expiry_date" IS 'Ngày hết hạn hiệu lực của văn bản (nếu có, ví dụ như Hợp đồng xác định thời hạn)';

COMMENT ON COLUMN "employee_documents"."issued_place" IS 'Nơi cấp / Cơ quan ban hành văn bản (ví dụ: Đại học Bách Khoa, Sở Tư Pháp...)';

COMMENT ON COLUMN "employee_documents"."file_id" IS 'Mã liên kết tới file scan tài liệu thực tế lưu trữ trong phân hệ Quản lý file';

COMMENT ON COLUMN "employee_documents"."created_at" IS 'Thời gian tạo bản ghi tài liệu';

COMMENT ON COLUMN "employment_types"."id" IS 'Khóa chính';

COMMENT ON COLUMN "employment_types"."tenant_id" IS 'Hình thức lao động thuộc cấu hình của Tenant nào';

COMMENT ON COLUMN "employment_types"."code" IS 'Mã hình thức lao động (ví dụ: FULL_TIME, PART_TIME, CONTRACTOR, INTERN...)';

COMMENT ON COLUMN "employment_types"."name" IS 'Tên hình thức lao động hiển thị trực quan (ví dụ: Toàn thời gian, Bán thời gian, Thực tập sinh...)';

COMMENT ON COLUMN "employment_types"."description" IS 'Mô tả chi tiết các chính sách hoặc đặc thù của hình thức lao động này';

COMMENT ON COLUMN "employment_types"."is_active" IS 'Hình thức lao động này còn được áp dụng để tuyển mới/gán cho nhân sự hay không';

COMMENT ON COLUMN "employment_types"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "employment_types"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "contract_types"."id" IS 'Khóa chính';

COMMENT ON COLUMN "contract_types"."tenant_id" IS 'Loại hợp đồng thuộc cấu hình của Tenant nào';

COMMENT ON COLUMN "contract_types"."code" IS 'Mã phân loại hợp đồng (ví dụ: INDEFINITE, DEFINITE_12M, PROBATION_2M...)';

COMMENT ON COLUMN "contract_types"."name" IS 'Tên loại hợp đồng hiển thị trực quan (ví dụ: Hợp đồng không xác định thời hạn, HĐLĐ 12 tháng...)';

COMMENT ON COLUMN "contract_types"."duration_month" IS 'Thời hạn mặc định của loại hợp đồng tính bằng tháng (Để trống đối với hợp đồng không thời hạn)';

COMMENT ON COLUMN "contract_types"."description" IS 'Mô tả chi tiết điều khoản mẫu hoặc ghi chú';

COMMENT ON COLUMN "contract_types"."is_active" IS 'Loại hợp đồng này còn đang được áp dụng để ký kết mới không';

COMMENT ON COLUMN "contract_types"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "contract_types"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "employments"."id" IS 'Employment ID (Khóa chính - Quản lý quá trình làm việc vật lý)';

COMMENT ON COLUMN "employments"."tenant_id" IS 'Mối quan hệ lao động này thuộc Tenant nào';

COMMENT ON COLUMN "employments"."employee_id" IS 'Gán quan hệ lao động này cho hồ sơ nhân viên nào';

COMMENT ON COLUMN "employments"."employment_type_id" IS 'Hình thức lao động hiện tại (Toàn thời gian/Bán thời gian...)';

COMMENT ON COLUMN "employments"."employee_code" IS 'Bản sao mã nhân viên phục vụ đồng bộ truy vấn nhanh tại phân hệ này';

COMMENT ON COLUMN "employments"."hire_date" IS 'Ngày chính thức tiếp nhận nhân sự vào công ty';

COMMENT ON COLUMN "employments"."probation_start_date" IS 'Ngày bắt đầu giai đoạn thử việc';

COMMENT ON COLUMN "employments"."probation_end_date" IS 'Ngày kết thúc giai đoạn thử việc dự kiến';

COMMENT ON COLUMN "employments"."confirmation_date" IS 'Ngày chính thức ký hợp đồng chính thức sau thử việc (Ngày lên chính thức)';

COMMENT ON COLUMN "employments"."termination_date" IS 'Ngày chính thức chấm dứt quan hệ lao động / Nghỉ việc hẳn';

COMMENT ON COLUMN "employments"."status" IS 'Trạng thái lao động hiện tại của nhân sự (Áp dụng Enum employment_status)';

COMMENT ON COLUMN "employments"."reason" IS 'Lý do biến động nhân sự (ví dụ: Lý do nghỉ việc, lý do tạm hoãn hợp đồng...)';

COMMENT ON COLUMN "employments"."metadata" IS 'Lưu trữ thông tin bổ sung động dạng JSON';

COMMENT ON COLUMN "employments"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "employments"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "employments"."deleted_at" IS 'Thời gian xóa tạm (Soft delete)';

COMMENT ON COLUMN "employment_contracts"."id" IS 'Contract ID (Khóa chính - Quản lý chi tiết từng bản hợp đồng đã ký)';

COMMENT ON COLUMN "employment_contracts"."employment_id" IS 'Hợp đồng này thuộc về quan hệ lao động nào';

COMMENT ON COLUMN "employment_contracts"."contract_type_id" IS 'Hợp đồng ký kết thuộc phân loại nào';

COMMENT ON COLUMN "employment_contracts"."contract_number" IS 'Số hiệu hợp đồng lao động văn bản (ví dụ: 105/2026/HĐLĐ-FPT)';

COMMENT ON COLUMN "employment_contracts"."start_date" IS 'Ngày hợp đồng chính thức có hiệu lực pháp lý';

COMMENT ON COLUMN "employment_contracts"."end_date" IS 'Ngày hợp đồng hết hiệu lực (Để trống nếu là hợp đồng không xác định thời hạn)';

COMMENT ON COLUMN "employment_contracts"."signed_date" IS 'Ngày hai bên thực hiện ký kết hợp đồng văn bản';

COMMENT ON COLUMN "employment_contracts"."file_id" IS 'Mã liên kết tới file scan hợp đồng gốc có chữ ký/mộc lưu trữ trong phân hệ Quản lý file';

COMMENT ON COLUMN "employment_contracts"."is_current" IS 'Đánh dấu đây có phải là bản hợp đồng mới nhất đang có hiệu lực thực tế hay không';

COMMENT ON COLUMN "employment_contracts"."created_at" IS 'Thời gian tạo bản ghi';

COMMENT ON COLUMN "employment_contracts"."updated_at" IS 'Thời gian cập nhật bản ghi gần nhất';

COMMENT ON COLUMN "employment_status_histories"."id" IS 'Khóa chính - Nhật ký kiểm toán hành trình làm việc biệt phái/biến động của nhân sự';

COMMENT ON COLUMN "employment_status_histories"."employment_id" IS 'Lịch sử biến động thuộc về nhân sự nào';

COMMENT ON COLUMN "employment_status_histories"."from_status" IS 'Trạng thái cũ trước khi biến động (Áp dụng Enum employment_status)';

COMMENT ON COLUMN "employment_status_histories"."to_status" IS 'Trạng thái mới chuyển đổi sau biến động (Áp dụng Enum employment_status)';

COMMENT ON COLUMN "employment_status_histories"."effective_date" IS 'Ngày chính thức có hiệu lực của quyết định thay đổi trạng thái';

COMMENT ON COLUMN "employment_status_histories"."reason" IS 'Ghi chú lý do thay đổi (ví dụ: Đạt thử việc trước thời hạn, Vi phạm kỷ luật nên sa thải...)';

COMMENT ON COLUMN "employment_status_histories"."changed_by_principal_id" IS 'Chủ thể định danh (HR Admin/Manager) thực hiện cập nhật quyết định thay đổi này';

COMMENT ON COLUMN "employment_status_histories"."created_at" IS 'Thời điểm hệ thống ghi nhận nhật ký';

COMMENT ON COLUMN "job_titles"."id" IS 'Job Title ID (Khóa chính)';

COMMENT ON COLUMN "job_titles"."tenant_id" IS 'Danh mục thuộc không gian dữ liệu Tenant nào';

COMMENT ON COLUMN "job_titles"."code" IS 'Mã chức danh chuyên môn (ví dụ: software_engineer_3, senior_accountant...)';

COMMENT ON COLUMN "job_titles"."name" IS 'Tên chức danh chuyên môn hiển thị trực quan (ví dụ: Kỹ sư phần mềm bậc 3, Chuyên viên kế toán cao cấp...)';

COMMENT ON COLUMN "job_titles"."description" IS 'Mô tả chi tiết về yêu cầu năng lực hoặc bậc chuyên môn chuẩn';

COMMENT ON COLUMN "job_titles"."is_active" IS 'Chức danh chuyên môn này còn đang được áp dụng để gán cho nhân sự mới không';

COMMENT ON COLUMN "job_titles"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "job_titles"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "work_locations"."id" IS 'Location ID (Khóa chính)';

COMMENT ON COLUMN "work_locations"."tenant_id" IS 'Địa điểm làm việc thuộc cấu hình của Tenant nào';

COMMENT ON COLUMN "work_locations"."code" IS 'Mã địa điểm văn phòng (ví dụ: hcm_campus, hn_office_level5...)';

COMMENT ON COLUMN "work_locations"."name" IS 'Tên văn phòng/chi nhánh/nhà máy hiển thị trực quan (ví dụ: Trụ sở chính TP.HCM, Nhà máy Bình Dương...)';

COMMENT ON COLUMN "work_locations"."address" IS 'Địa chỉ chi tiết cụ thể của địa điểm làm việc phục vụ check-in chấm công và khai báo thuế';

COMMENT ON COLUMN "work_locations"."timezone" IS 'Múi giờ áp dụng tại địa điểm làm việc đó (ví dụ: Asia/Ho_Chi_Minh) để tính công chuẩn xác';

COMMENT ON COLUMN "work_locations"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "work_locations"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "organization_assignments"."id" IS 'Assignment ID (Khóa chính - Quyết định điều động biên chế)';

COMMENT ON COLUMN "organization_assignments"."tenant_id" IS 'Quyết định biên chế thuộc phạm vi Tenant nào';

COMMENT ON COLUMN "organization_assignments"."employment_id" IS 'Bổ nhiệm/Điều động vị trí này cho quan hệ lao động của nhân sự nào';

COMMENT ON COLUMN "organization_assignments"."department_id" IS 'Biên chế nhân viên vào đơn vị/phòng ban nào (ví dụ: Phòng Kế toán, Tổ Backend...)';

COMMENT ON COLUMN "organization_assignments"."position_id" IS 'Gán vị trí công việc nào (về mặt hành chính, ví dụ: Trưởng phòng, Chuyên viên...)';

COMMENT ON COLUMN "organization_assignments"."job_title_id" IS 'Gán chức danh chuyên môn chuyên sâu (ví dụ: Senior Java Dev, Talent Acquisition...)';

COMMENT ON COLUMN "organization_assignments"."manager_employment_id" IS 'Mã quan hệ lao động của người quản lý trực tiếp (Sếp trực tiếp của nhân viên này)';

COMMENT ON COLUMN "organization_assignments"."work_location_id" IS 'Địa điểm làm việc được gán chính thức của nhân sự để quy chuẩn khung ca/chấm công';

COMMENT ON COLUMN "organization_assignments"."cost_center_id" IS 'Trung tâm chi phí chịu trách nhiệm chi trả quỹ lương/phúc lợi cho nhân viên này';

COMMENT ON COLUMN "organization_assignments"."effective_from" IS 'Ngày quyết định bổ nhiệm/điều động chính thức bắt đầu có hiệu lực pháp lý';

COMMENT ON COLUMN "organization_assignments"."effective_to" IS 'Ngày quyết định hết hiệu lực (Để trống nếu quyết định có hiệu lực vô thời hạn cho tới khi có lệnh điều động mới)';

COMMENT ON COLUMN "organization_assignments"."is_primary" IS 'Đánh dấu đây có phải là biên chế gốc/chính hay không (Hỗ trợ mô hình nhân sự kiêm nhiệm nhiều vị trí/phòng ban cùng lúc)';

COMMENT ON COLUMN "organization_assignments"."status" IS 'Trạng thái hiệu lực của dòng biên chế (Áp dụng Enum assignment_status)';

COMMENT ON COLUMN "organization_assignments"."created_at" IS 'Thời gian tạo bản ghi';

COMMENT ON COLUMN "organization_assignments"."updated_at" IS 'Thời gian cập nhật bản ghi gần nhất';

COMMENT ON COLUMN "shifts"."id" IS 'Shift ID (Khóa chính)';

COMMENT ON COLUMN "shifts"."tenant_id" IS 'Ca làm việc thuộc cấu hình của Tenant nào';

COMMENT ON COLUMN "shifts"."code" IS 'Mã ca làm việc (ví dụ: OFFICE_HC, NIGHT_SHIFT, CA_SANG...)';

COMMENT ON COLUMN "shifts"."name" IS 'Tên ca làm việc hiển thị trực quan (ví dụ: Hành chính văn phòng, Ca đêm nhà máy...)';

COMMENT ON COLUMN "shifts"."start_time" IS 'Mốc thời gian bắt đầu tính ca (Giờ vào ca chuẩn, ví dụ: 08:00:00)';

COMMENT ON COLUMN "shifts"."end_time" IS 'Mốc thời gian kết thúc ca làm việc (Giờ ra ca chuẩn, ví dụ: 17:00:00)';

COMMENT ON COLUMN "shifts"."break_minutes" IS 'Tổng số phút nghỉ giữa ca được trừ ra khi tính công (ví dụ: Nghỉ trưa 60 phút)';

COMMENT ON COLUMN "shifts"."is_flexible" IS 'Đánh dấu ca làm việc linh hoạt (Chỉ tính đủ tổng số giờ, không phạt đi muộn/về sớm theo mốc cố định)';

COMMENT ON COLUMN "shifts"."created_at" IS 'Thời gian tạo ca';

COMMENT ON COLUMN "shifts"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "shift_assignments"."id" IS 'Khóa chính - Quyết định xếp lịch phân ca cho nhân sự';

COMMENT ON COLUMN "shift_assignments"."tenant_id" IS 'Lịch trình phân ca thuộc phạm vi Tenant nào';

COMMENT ON COLUMN "shift_assignments"."employment_id" IS 'Xếp ca làm việc này cho quan hệ lao động của nhân sự nào';

COMMENT ON COLUMN "shift_assignments"."shift_id" IS 'Loại ca làm việc mẫu được gán';

COMMENT ON COLUMN "shift_assignments"."effective_from" IS 'Ngày bắt đầu áp dụng lịch phân ca này thực tế';

COMMENT ON COLUMN "shift_assignments"."effective_to" IS 'Ngày kết thúc áp dụng lịch phân ca (Để trống nếu lịch ca áp dụng vô thời hạn)';

COMMENT ON COLUMN "shift_assignments"."is_primary" IS 'Đánh dấu lịch xếp ca chính/mặc định (Phục vụ bài toán một ngày nhân viên có thể xoay nhiều ca phụ)';

COMMENT ON COLUMN "shift_assignments"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "shift_assignments"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "attendance_records"."id" IS 'Record ID (Khóa chính - Dữ liệu bảng công hàng ngày)';

COMMENT ON COLUMN "attendance_records"."tenant_id" IS 'Dữ liệu công thuộc Tenant nào';

COMMENT ON COLUMN "attendance_records"."employment_id" IS 'Ghi nhận ngày công cho nhân sự nào';

COMMENT ON COLUMN "attendance_records"."shift_assignment_id" IS 'Đối chiếu kết quả chấm công dựa trên lượt xếp ca nào của ngày đó';

COMMENT ON COLUMN "attendance_records"."attendance_date" IS 'Ngày hạch toán công (ngày/tháng/năm thực tế thực hiện chấm công)';

COMMENT ON COLUMN "attendance_records"."check_in_at" IS 'Thời điểm quẹt thẻ/ghi nhận dữ liệu vào làm thực tế (Check-in)';

COMMENT ON COLUMN "attendance_records"."check_out_at" IS 'Thời điểm quẹt thẻ/ghi nhận dữ liệu ra về thực tế (Check-out)';

COMMENT ON COLUMN "attendance_records"."worked_minutes" IS 'Tổng số phút làm việc thực tế trong ca sau khi đã trừ giờ nghỉ';

COMMENT ON COLUMN "attendance_records"."overtime_minutes" IS 'Tổng số phút làm thêm giờ (tăng ca) thu được trong ngày';

COMMENT ON COLUMN "attendance_records"."late_minutes" IS 'Tổng số phút đi muộn so với giờ vào ca chuẩn';

COMMENT ON COLUMN "attendance_records"."early_leave_minutes" IS 'Tổng số phút về sớm so với giờ ra ca chuẩn';

COMMENT ON COLUMN "attendance_records"."status" IS 'Trạng thái tổng hợp công của ngày (Áp dụng Enum attendance_status)';

COMMENT ON COLUMN "attendance_records"."source" IS 'Phương thức quẹt công cuối cùng được chốt (Áp dụng Enum attendance_source)';

COMMENT ON COLUMN "attendance_records"."device_id" IS 'Mã máy chấm công vật lý ghi nhận lượt quẹt thẻ cuối (nếu có)';

COMMENT ON COLUMN "attendance_records"."metadata" IS 'Lưu trữ payload thô từ thiết bị chấm công hoặc tọa độ GPS, IP mạng lúc bấm công';

COMMENT ON COLUMN "attendance_records"."created_at" IS 'Thời gian tạo bản ghi';

COMMENT ON COLUMN "attendance_records"."updated_at" IS 'Thời gian cập nhật bản ghi gần nhất';

COMMENT ON COLUMN "attendance_adjustments"."id" IS 'Adjustment ID (Khóa chính - Đơn giải trình sửa công)';

COMMENT ON COLUMN "attendance_adjustments"."attendance_record_id" IS 'Điều chỉnh bổ sung dữ liệu cho dòng công ngày nào';

COMMENT ON COLUMN "attendance_adjustments"."requested_by_principal_id" IS 'Chủ thể định danh (Nhân viên) làm đơn giải trình/yêu cầu sửa giờ quẹt thẻ';

COMMENT ON COLUMN "attendance_adjustments"."approved_by_principal_id" IS 'Chủ thể định danh (Manager/HR Admin) ký duyệt đồng ý sửa công';

COMMENT ON COLUMN "attendance_adjustments"."reason" IS 'Lý do xin điều chỉnh công (ví dụ: Quên quẹt thẻ khi về, Đi gặp khách hàng bên ngoài...)';

COMMENT ON COLUMN "attendance_adjustments"."old_check_in" IS 'Dữ liệu giờ vào cũ (Snapshot trước khi sửa)';

COMMENT ON COLUMN "attendance_adjustments"."new_check_in" IS 'Giờ vào mới được đề xuất cập nhật thay thế';

COMMENT ON COLUMN "attendance_adjustments"."old_check_out" IS 'Dữ liệu giờ ra cũ (Snapshot trước khi sửa)';

COMMENT ON COLUMN "attendance_adjustments"."new_check_out" IS 'Giờ ra mới được đề xuất cập nhật thay thế';

COMMENT ON COLUMN "attendance_adjustments"."created_at" IS 'Thời điểm tạo đơn giải trình sửa công';

COMMENT ON COLUMN "attendance_devices"."id" IS 'Device ID (Khóa chính - Danh mục phần cứng chấm công)';

COMMENT ON COLUMN "attendance_devices"."tenant_id" IS 'Thiết bị phần cứng thuộc quyền quản lý của Tenant nào';

COMMENT ON COLUMN "attendance_devices"."code" IS 'Mã số định danh thiết bị phần cứng (ví dụ: MCC_HN_01, MCC_FACTORY_B...)';

COMMENT ON COLUMN "attendance_devices"."name" IS 'Tên hiển thị trực quan của máy chấm công (ví dụ: Máy chấm công Vân tay Khối Văn Phòng)';

COMMENT ON COLUMN "attendance_devices"."device_type" IS 'Chủng loại thiết bị chấm công (ví dụ: HIKVISION_FACEID, RONALD_JACK_FINGER...)';

COMMENT ON COLUMN "attendance_devices"."location" IS 'Vị trí lắp đặt thiết bị vật lý trong công ty (ví dụ: Cửa ra vào Tầng 1, Phòng bảo vệ...)';

COMMENT ON COLUMN "attendance_devices"."created_at" IS 'Thời gian khai báo máy vào hệ thống';

COMMENT ON COLUMN "attendance_devices"."updated_at" IS 'Thời gian cập nhật thông tin máy gần nhất';

COMMENT ON COLUMN "leave_types"."id" IS 'Leave Type ID (Khóa chính)';

COMMENT ON COLUMN "leave_types"."tenant_id" IS 'Loại nghỉ phép thuộc cấu hình của Tenant nào';

COMMENT ON COLUMN "leave_types"."code" IS 'Mã loại nghỉ phép (ví dụ: ANNUAL_LEAVE (Phép năm), SICK_LEAVE (Nghỉ ốm), MATERNITY (Thai sản)...)';

COMMENT ON COLUMN "leave_types"."name" IS 'Tên loại nghỉ phép hiển thị trực quan (ví dụ: Nghỉ phép năm, Nghỉ ốm hưởng BHXH...)';

COMMENT ON COLUMN "leave_types"."is_paid" IS 'Đánh dấu loại nghỉ phép này có được hưởng nguyên lương hay không (Nghỉ không lương = false)';

COMMENT ON COLUMN "leave_types"."requires_attachment" IS 'Bắt buộc phải đính kèm minh chứng tài liệu khi làm đơn không (ví dụ: Nghỉ ốm cần giấy viện C65)';

COMMENT ON COLUMN "leave_types"."color" IS 'Mã màu sắc hiển thị đại diện trên giao diện UI Lịch nghỉ phép (Calendar Layout)';

COMMENT ON COLUMN "leave_types"."description" IS 'Mô tả chi tiết tiêu chuẩn hoặc ghi chú về loại nghỉ phép này';

COMMENT ON COLUMN "leave_types"."created_at" IS 'Thời gian tạo loại phép';

COMMENT ON COLUMN "leave_types"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "leave_policies"."id" IS 'Policy ID (Khóa chính - Cấu hình luật phép)';

COMMENT ON COLUMN "leave_policies"."tenant_id" IS 'Chính sách phép thuộc cấu hình của Tenant nào';

COMMENT ON COLUMN "leave_policies"."leave_type_id" IS 'Chính sách này quy định điều khoản cho loại nghỉ phép nào';

COMMENT ON COLUMN "leave_policies"."employment_type_id" IS 'Áp dụng riêng cho hình thức lao động nào (ví dụ: Chỉ áp dụng cho Full-time, để trống nếu áp dụng toàn dân)';

COMMENT ON COLUMN "leave_policies"."annual_days" IS 'Số ngày phép được hưởng định biên tiêu chuẩn trong một năm lịch (ví dụ: 12.00 ngày, 14.00 ngày...)';

COMMENT ON COLUMN "leave_policies"."max_consecutive_days" IS 'Số ngày nghỉ liên tục tối đa được phép trong một đơn (Ví dụ: Không được nghỉ quá 5 ngày liên tiếp nếu không duyệt đặc biệt)';

COMMENT ON COLUMN "leave_policies"."carry_forward_limit" IS 'Số ngày phép tồn tối đa được phép cộng dồn gối đầu chuyển sang năm sau (Số còn lại quá hạn sẽ bị xóa)';

COMMENT ON COLUMN "leave_policies"."requires_approval" IS 'Đánh dấu việc nghỉ loại này có cần chạy qua luồng phê duyệt hay không';

COMMENT ON COLUMN "leave_policies"."effective_from" IS 'Ngày chính thức chính sách phép này có hiệu lực bắt buộc áp dụng';

COMMENT ON COLUMN "leave_policies"."effective_to" IS 'Ngày chính thức hết hiệu lực của chính sách phép';

COMMENT ON COLUMN "leave_policies"."created_at" IS 'Thời gian tạo cấu hình';

COMMENT ON COLUMN "leave_policies"."updated_at" IS 'Thời gian cập nhật cấu hình gần nhất';

COMMENT ON COLUMN "leave_balances"."id" IS 'Balance ID (Khóa chính - Quản lý quỹ số dư phép năm)';

COMMENT ON COLUMN "leave_balances"."tenant_id" IS 'Số dư phép thuộc Tenant nào';

COMMENT ON COLUMN "leave_balances"."employment_id" IS 'Quỹ số dư phép này cấp phát cho quan hệ lao động của nhân sự nào';

COMMENT ON COLUMN "leave_balances"."leave_type_id" IS 'Áp dụng số dư cho loại nghỉ phép nào';

COMMENT ON COLUMN "leave_balances"."leave_year" IS 'Năm hạch toán quỹ phép (ví dụ: năm 2026)';

COMMENT ON COLUMN "leave_balances"."entitled_days" IS 'Tổng số ngày phép nhân sự được quyền hưởng trong năm (Phép năm gốc + Phép thâm niên nếu có)';

COMMENT ON COLUMN "leave_balances"."used_days" IS 'Tổng số ngày phép đã thực tế nghỉ thành công (Đã trừ đi)';

COMMENT ON COLUMN "leave_balances"."pending_days" IS 'Tổng số ngày phép đang nằm trong các đơn trạng thái chờ duyệt (Giữ chỗ trước)';

COMMENT ON COLUMN "leave_balances"."remaining_days" IS 'Số ngày phép sạch còn lại thực tế có thể đặt lịch nghỉ (Remaining = Entitled - Used - Pending)';

COMMENT ON COLUMN "leave_balances"."updated_at" IS 'Thời điểm cập nhật biến động số dư gần nhất';

COMMENT ON COLUMN "leave_requests"."id" IS 'Leave Request ID (Khóa chính - Đơn xin nghỉ phép)';

COMMENT ON COLUMN "leave_requests"."tenant_id" IS 'Đơn xin nghỉ phép thuộc Tenant nào';

COMMENT ON COLUMN "leave_requests"."employment_id" IS 'Đơn nghỉ phép làm cho quan hệ lao động của nhân sự nào';

COMMENT ON COLUMN "leave_requests"."leave_type_id" IS 'Nhân sự xin nghỉ theo diện loại phép nào';

COMMENT ON COLUMN "leave_requests"."workflow_instance_id" IS 'Mã liên kết phiên thực thi quy trình duyệt tự động đi kèm ở phân hệ Workflow Engine';

COMMENT ON COLUMN "leave_requests"."start_date" IS 'Ngày bắt đầu nghỉ phép thực tế';

COMMENT ON COLUMN "leave_requests"."end_date" IS 'Ngày kết thúc nghỉ phép thực tế';

COMMENT ON COLUMN "leave_requests"."total_days" IS 'Tổng số ngày xin nghỉ quy đổi tương đương tính toán (ví dụ: Nghỉ nửa ngày = 0.50, nghỉ 3 ngày = 3.00)';

COMMENT ON COLUMN "leave_requests"."reason" IS 'Lý do chi tiết xin nghỉ phép (Giải trình gửi quản lý cấp trên xử lý)';

COMMENT ON COLUMN "leave_requests"."status" IS 'Trạng thái xử lý phê duyệt đơn hiện tại (Áp dụng Enum leave_request_status)';

COMMENT ON COLUMN "leave_requests"."created_at" IS 'Thời gian nộp đơn';

COMMENT ON COLUMN "leave_requests"."updated_at" IS 'Thời gian cập nhật đơn gần nhất';

COMMENT ON COLUMN "leave_transactions"."id" IS 'Transaction ID (Khóa chính - Sổ cái biến động lịch sử ví phép)';

COMMENT ON COLUMN "leave_transactions"."tenant_id" IS 'Nhật ký biến động thuộc Tenant nào';

COMMENT ON COLUMN "leave_transactions"."leave_balance_id" IS 'Tác động trực tiếp thay đổi số dư của ví phép nào';

COMMENT ON COLUMN "leave_transactions"."leave_request_id" IS 'Liên kết tới mã đơn xin nghỉ phép gây ra biến động (Null nếu đây là hành vi cộng phép định kỳ hệ thống hoặc HR điều chỉnh tay)';

COMMENT ON COLUMN "leave_transactions"."transaction_type" IS 'Mã loại giao dịch biến động quỹ phép (ví dụ: ACCRUAL (Cộng phép tháng), USAGE (Trừ phép khi duyệt đơn), CARRY_FORWARD (Gối đầu năm mới), ADJUSTMENT (HR điều chỉnh sửa đổi)...)';

COMMENT ON COLUMN "leave_transactions"."days" IS 'Số lượng ngày phép biến động (Giá trị dương để cộng thêm vào Entitled, giá trị âm đại diện cho việc khấu trừ giảm phép)';

COMMENT ON COLUMN "leave_transactions"."description" IS 'Nội dung mô tả lý do phát sinh dòng giao dịch biến động số dư phục vụ đối soát kiểm toán';

COMMENT ON COLUMN "leave_transactions"."created_at" IS 'Thời điểm ghi nhận giao dịch bất biến trong sổ cái kiểm toán phép';

COMMENT ON COLUMN "salary_structures"."id" IS 'Structure ID (Khóa chính)';

COMMENT ON COLUMN "salary_structures"."tenant_id" IS 'Cấu trúc lương thuộc cấu hình của Tenant nào';

COMMENT ON COLUMN "salary_structures"."code" IS 'Mã cấu trúc lương (ví dụ: VN_OFFICE_STRUCTURE, GLOBAL_EXPAT_STRUCTURE...)';

COMMENT ON COLUMN "salary_structures"."name" IS 'Tên cấu trúc lương hiển thị trực quan (ví dụ: Khung lương khối văn phòng Việt Nam...)';

COMMENT ON COLUMN "salary_structures"."description" IS 'Mô tả chi tiết tiêu chí áp dụng khung lương này';

COMMENT ON COLUMN "salary_structures"."is_active" IS 'Khung lương này còn đang được áp dụng để gán cho nhân sự mới không';

COMMENT ON COLUMN "salary_structures"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "salary_structures"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "salary_components"."id" IS 'Component ID (Khóa chính - Danh mục cấu phần lương)';

COMMENT ON COLUMN "salary_components"."tenant_id" IS 'Thành phần lương thuộc cấu hình của Tenant nào';

COMMENT ON COLUMN "salary_components"."code" IS 'Mã thành phần lương (ví dụ: BASE_SALARY, MEAL_ALLOW, SHIFT_BONUS, BHXH_EE...)';

COMMENT ON COLUMN "salary_components"."name" IS 'Tên thành phần lương hiển thị (ví dụ: Lương cơ bản, Phụ cấp ăn trưa, Khấu trừ BHXH...)';

COMMENT ON COLUMN "salary_components"."component_type" IS 'Phân loại đặc tính cấu phần (Áp dụng Enum salary_component_type)';

COMMENT ON COLUMN "salary_components"."calculation_type" IS 'Cơ chế tính toán (ví dụ: FIXED (Cố định), FORMULA (Tính theo công thức), ATTENDANCE (Tính theo ngày công thực tế)...)';

COMMENT ON COLUMN "salary_components"."default_amount" IS 'Số tiền định biên mặc định của thành phần này (nếu có, ví dụ: Phụ cấp ăn trưa cố định 730.000 VND)';

COMMENT ON COLUMN "salary_components"."taxable" IS 'Thành phần này có phải chịu thuế thu nhập cá nhân (PIT) khi tính toán hay không';

COMMENT ON COLUMN "salary_components"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "salary_components"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "employee_salary_assignments"."id" IS 'Assignment ID (Khóa chính - Quyết định lương nhân sự)';

COMMENT ON COLUMN "employee_salary_assignments"."tenant_id" IS 'Quyết định lương thuộc phạm vi Tenant nào';

COMMENT ON COLUMN "employee_salary_assignments"."employment_id" IS 'Áp dụng mức lương này cho quan hệ lao động của nhân sự nào';

COMMENT ON COLUMN "employee_salary_assignments"."salary_structure_id" IS 'Nhân sự được tính lương dựa trên khuôn mẫu cấu trúc lương nào';

COMMENT ON COLUMN "employee_salary_assignments"."effective_from" IS 'Ngày mức lương và khung lương này chính thức bắt đầu có hiệu lực hạch toán';

COMMENT ON COLUMN "employee_salary_assignments"."effective_to" IS 'Ngày hết hiệu lực của mức lương (Để trống nếu áp dụng cho đến khi có quyết định thay đổi lương mới)';

COMMENT ON COLUMN "employee_salary_assignments"."base_salary" IS 'Mức lương cơ sở / Lương đóng hợp đồng gốc của nhân viên (chưa tính thưởng/phụ cấp)';

COMMENT ON COLUMN "employee_salary_assignments"."currency" IS 'Đơn vị tiền tệ áp dụng chi trả lương (ví dụ: VND, USD)';

COMMENT ON COLUMN "employee_salary_assignments"."created_at" IS 'Thời gian tạo bản ghi';

COMMENT ON COLUMN "employee_salary_assignments"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "payroll_periods"."id" IS 'Period ID (Khóa chính - Kỳ tính lương hàng tháng)';

COMMENT ON COLUMN "payroll_periods"."tenant_id" IS 'Kỳ lương thuộc phạm vi Tenant nào';

COMMENT ON COLUMN "payroll_periods"."code" IS 'Mã kỳ lương định danh (ví dụ: P_2026_07 (Kỳ lương tháng 7/2026))';

COMMENT ON COLUMN "payroll_periods"."start_date" IS 'Ngày bắt đầu chu kỳ gom dữ liệu công phụ trợ tính lương';

COMMENT ON COLUMN "payroll_periods"."end_date" IS 'Ngày kết thúc chu kỳ gom dữ liệu công phụ trợ tính lương';

COMMENT ON COLUMN "payroll_periods"."payment_date" IS 'Ngày dự kiến thực hiện chuyển khoản/giải ngân lương thực tế cho nhân sự';

COMMENT ON COLUMN "payroll_periods"."status" IS 'Trạng thái tổng quát của toàn bộ kỳ lương (Áp dụng Enum payroll_status)';

COMMENT ON COLUMN "payroll_periods"."created_at" IS 'Thời gian tạo kỳ lương';

COMMENT ON COLUMN "payrolls"."id" IS 'Payroll ID (Khóa chính - Phiếu tổng hợp lương trong kỳ)';

COMMENT ON COLUMN "payrolls"."tenant_id" IS 'Bản ghi lương thuộc Tenant nào';

COMMENT ON COLUMN "payrolls"."payroll_period_id" IS 'Dòng lương này nằm trong chu kỳ tính lương nào';

COMMENT ON COLUMN "payrolls"."employment_id" IS 'Bảng công lương hạch toán cho nhân sự nào';

COMMENT ON COLUMN "payrolls"."gross_salary" IS 'Tổng thu nhập chịu thuế trước khấu trừ (Gross Salary = Base + Thu nhập tính công khác)';

COMMENT ON COLUMN "payrolls"."total_allowance" IS 'Tổng cộng toàn bộ các khoản phụ cấp được nhận trong kỳ';

COMMENT ON COLUMN "payrolls"."total_deduction" IS 'Tổng cộng toàn bộ các khoản khấu trừ giảm lương trong kỳ (Thuế, bảo hiểm, phạt...)';

COMMENT ON COLUMN "payrolls"."net_salary" IS 'Lương thực nhận cuối cùng chuyển khoản của nhân viên (Net = Gross + Allowance - Deduction)';

COMMENT ON COLUMN "payrolls"."status" IS 'Trạng thái chốt lương của riêng nhân viên này (Áp dụng Enum payroll_status)';

COMMENT ON COLUMN "payrolls"."payslip_file_id" IS 'Mã liên kết tới file phiếu lương cá nhân (Payslip PDF) được sinh ra để gửi mail/UI cho nhân viên';

COMMENT ON COLUMN "payrolls"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "payrolls"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "payroll_items"."id" IS 'Khóa chính - Hàng chi tiết số tiền của từng cấu phần cấu thành Phiếu lương';

COMMENT ON COLUMN "payroll_items"."payroll_id" IS 'Thuộc phiếu tổng hợp lương cha nào của nhân viên';

COMMENT ON COLUMN "payroll_items"."salary_component_id" IS 'Dòng tiền này tính toán chi tiết cho cấu phần lương nào';

COMMENT ON COLUMN "payroll_items"."amount" IS 'Số tiền thực tế tính toán thu được của cấu phần đó trong kỳ này (Giá trị tuyệt đối)';

COMMENT ON COLUMN "payroll_items"."remark" IS 'Ghi chú chi tiết toán lý giải trình thuật toán tính (ví dụ: Đi muộn 3 lần phạt trừ, làm thêm ca ngày nghỉ x2...)';

COMMENT ON COLUMN "job_requisitions"."id" IS 'Requisition ID (Khóa chính - Đơn xin thêm người)';

COMMENT ON COLUMN "job_requisitions"."tenant_id" IS 'Yêu cầu tuyển dụng thuộc Tenant nào';

COMMENT ON COLUMN "job_requisitions"."code" IS 'Mã yêu cầu tuyển dụng (ví dụ: REQ_2026_IT05, REQ_MKT_01...)';

COMMENT ON COLUMN "job_requisitions"."title" IS 'Tiêu đề vị trí cần tuyển dụng (ví dụ: Tuyển Kỹ sư phần mềm Java, Chuyên viên Content...)';

COMMENT ON COLUMN "job_requisitions"."department_id" IS 'Phòng ban/Đơn vị đưa ra đề xuất cần bổ sung nhân sự';

COMMENT ON COLUMN "job_requisitions"."position_id" IS 'Vị trí chức danh hành chính cần tuyển thêm';

COMMENT ON COLUMN "job_requisitions"."requested_by_employment_id" IS 'Mã quan hệ lao động của Quản lý/Trưởng phòng đưa ra đề xuất';

COMMENT ON COLUMN "job_requisitions"."quantity" IS 'Số lượng chỉ tiêu nhân sự cần tuyển thêm (ví dụ: Cần tuyển thêm 3 người)';

COMMENT ON COLUMN "job_requisitions"."status" IS 'Trạng thái xử lý phê duyệt của yêu cầu tuyển dụng (Áp dụng Enum requisition_status)';

COMMENT ON COLUMN "job_requisitions"."created_at" IS 'Thời gian tạo đề xuất';

COMMENT ON COLUMN "job_requisitions"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "job_postings"."id" IS 'Posting ID (Khóa chính - Tin đăng tuyển)';

COMMENT ON COLUMN "job_postings"."tenant_id" IS 'Tin đăng tuyển thuộc Tenant nào';

COMMENT ON COLUMN "job_postings"."requisition_id" IS 'Tin đăng được triển khai cụ thể từ yêu cầu tuyển dụng gốc nào';

COMMENT ON COLUMN "job_postings"."title" IS 'Tiêu đề hiển thị tin đăng tuyển trên trang Careers/Website tuyển dụng';

COMMENT ON COLUMN "job_postings"."description" IS 'Nội dung chi tiết mô tả công việc, quyền lợi và yêu cầu (JD - Job Description) hiển thị cho ứng viên đọc';

COMMENT ON COLUMN "job_postings"."published_at" IS 'Thời điểm tin đăng chính thức được bấm xuất bản public';

COMMENT ON COLUMN "job_postings"."expired_at" IS 'Thời hạn đóng tin tuyển dụng công khai';

COMMENT ON COLUMN "job_postings"."is_active" IS 'Tin tuyển dụng còn đang hiển thị hoạt động hay không';

COMMENT ON COLUMN "candidates"."id" IS 'Candidate ID (Khóa chính - Danh mục ứng viên gốc)';

COMMENT ON COLUMN "candidates"."tenant_id" IS 'Hồ sơ ứng viên thuộc Tenant nào quản lý';

COMMENT ON COLUMN "candidates"."full_name" IS 'Họ và tên đầy đủ của ứng viên';

COMMENT ON COLUMN "candidates"."email" IS 'Địa chỉ email liên hệ của ứng viên';

COMMENT ON COLUMN "candidates"."phone" IS 'Số điện thoại liên hệ của ứng viên';

COMMENT ON COLUMN "candidates"."source" IS 'Nguồn ứng viên (ví dụ: Linkedin, VietnamWorks, ITViec, Facebook, HR_Referral (Nội bộ giới thiệu)...)';

COMMENT ON COLUMN "candidates"."resume_file_id" IS 'Mã liên kết tới file CV gốc (.pdf, .docx) của ứng viên lưu trong phân hệ Quản lý file';

COMMENT ON COLUMN "candidates"."created_at" IS 'Thời điểm hồ sơ ứng viên được tạo trên hệ thống';

COMMENT ON COLUMN "job_applications"."id" IS 'Application ID (Khóa chính - Một lượt nộp đơn ứng tuyển)';

COMMENT ON COLUMN "job_applications"."tenant_id" IS 'Lượt ứng tuyển thuộc Tenant nào';

COMMENT ON COLUMN "job_applications"."candidate_id" IS 'Liên kết tới ứng viên thực hiện nộp hồ sơ';

COMMENT ON COLUMN "job_applications"."job_posting_id" IS 'Ứng viên nộp đơn ứng tuyển vào tin đăng tuyển dụng cụ thể nào';

COMMENT ON COLUMN "job_applications"."status" IS 'Trạng thái tổng quát của đơn ứng tuyển (Áp dụng Enum application_status)';

COMMENT ON COLUMN "job_applications"."applied_at" IS 'Thời điểm ứng viên bấm nút nộp đơn ứng tuyển';

COMMENT ON COLUMN "job_applications"."current_stage" IS 'Bước/Vòng chi tiết hiện tại trong quy trình tuyển dụng (ví dụ: Vòng test Tech, Phỏng vấn lần 1, Phỏng vấn với Giám đốc...)';

COMMENT ON COLUMN "interviews"."id" IS 'Interview ID (Khóa chính - Một buổi phỏng vấn)';

COMMENT ON COLUMN "interviews"."application_id" IS 'Buổi phỏng vấn được lên lịch phục vụ cho đơn ứng tuyển nào';

COMMENT ON COLUMN "interviews"."interviewer_employment_id" IS 'Mã quan hệ lao động của Nhân viên/Quản lý đóng vai trò là Người phỏng vấn (Hội đồng phỏng vấn)';

COMMENT ON COLUMN "interviews"."scheduled_at" IS 'Thời gian diễn ra buổi phỏng vấn (Ngày và giờ)';

COMMENT ON COLUMN "interviews"."location" IS 'Địa điểm phỏng vấn trực tiếp (ví dụ: Phòng họp tầng 3, Trụ sở chính...)';

COMMENT ON COLUMN "interviews"."meeting_url" IS 'Đường link phỏng vấn trực tuyến nếu gặp online (ví dụ: Google Meet, Zoom, MS Teams...)';

COMMENT ON COLUMN "interviews"."result" IS 'Đánh giá / Nhận xét kết quả sơ bộ sau buổi phỏng vấn (ví dụ: PASS, FAIL, CONSIDER...)';

COMMENT ON COLUMN "interviews"."status" IS 'Trạng thái tiến trình của buổi phỏng vấn (Áp dụng Enum interview_status)';

COMMENT ON COLUMN "job_offers"."id" IS 'Offer ID (Khóa chính - Lời mời nhận việc)';

COMMENT ON COLUMN "job_offers"."application_id" IS 'Mời nhận việc dựa trên đơn ứng tuyển thành công nào';

COMMENT ON COLUMN "job_offers"."offered_salary" IS 'Mức lương thỏa thuận đề xuất trong thư mời việc';

COMMENT ON COLUMN "job_offers"."currency" IS 'Đơn vị tiền tệ hạch toán mức lương mời việc (ví dụ: VND, USD)';

COMMENT ON COLUMN "job_offers"."start_date" IS 'Ngày dự kiến ứng viên sẽ chính thức đến nhận việc tại công ty (Ngày onboard dự kiến)';

COMMENT ON COLUMN "job_offers"."status" IS 'Trạng thái phản hồi của thư mời nhận việc (Áp dụng Enum offer_status)';

COMMENT ON COLUMN "job_offers"."offer_file_id" IS 'Mã liên kết tới file văn bản Offer Letter chính thức gửi ứng viên trong phân hệ Quản lý file';

COMMENT ON COLUMN "job_offers"."created_at" IS 'Thời gian tạo thư mời việc';

COMMENT ON COLUMN "hiring_records"."id" IS 'Hiring Record ID (Khóa chính - Cầu nối hoàn tất vòng đời chuyển đổi thành Nhân viên)';

COMMENT ON COLUMN "hiring_records"."application_id" IS 'Kết quả chuyển đổi thành công từ đơn ứng tuyển gốc nào';

COMMENT ON COLUMN "hiring_records"."employee_id" IS 'Liên kết tới hồ sơ nhân sự lõi mới được tạo lập sau khi trúng tuyển';

COMMENT ON COLUMN "hiring_records"."employment_id" IS 'Liên kết tới dòng quan hệ lao động mới được kích hoạt phục vụ tính công lương';

COMMENT ON COLUMN "hiring_records"."hired_at" IS 'Thời điểm chính thức đánh dấu ứng viên trở thành nhân viên (Ngày onboard thực tế)';

COMMENT ON COLUMN "performance_cycles"."id" IS 'Cycle ID (Khóa chính - Chu kỳ đánh giá)';

COMMENT ON COLUMN "performance_cycles"."tenant_id" IS 'Chu kỳ đánh giá thuộc Tenant nào';

COMMENT ON COLUMN "performance_cycles"."code" IS 'Mã chu kỳ đánh giá (ví dụ: KPI_2026_H1 (Sáu tháng đầu năm), BONUS_2026_Q4...)';

COMMENT ON COLUMN "performance_cycles"."name" IS 'Tên chu kỳ đánh giá hiển thị (ví dụ: Đánh giá hiệu suất Định kỳ Sáu tháng đầu năm 2026...)';

COMMENT ON COLUMN "performance_cycles"."start_date" IS 'Ngày bắt đầu tính chu kỳ theo dõi hiệu suất';

COMMENT ON COLUMN "performance_cycles"."end_date" IS 'Ngày kết thúc chu kỳ theo dõi hiệu suất';

COMMENT ON COLUMN "performance_cycles"."is_active" IS 'Chu kỳ đánh giá này có đang mở để nhập liệu/chấm điểm không';

COMMENT ON COLUMN "performance_cycles"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "performance_cycles"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "performance_ratings"."id" IS 'Rating ID (Khóa chính - Danh mục xếp hạng)';

COMMENT ON COLUMN "performance_ratings"."tenant_id" IS 'Thang đo hiệu suất thuộc cấu hình của Tenant nào';

COMMENT ON COLUMN "performance_ratings"."code" IS 'Mã xếp hạng (ví dụ: A (Xuất sắc), B (Tốt), C (Trung bình), D (Kém)...)';

COMMENT ON COLUMN "performance_ratings"."name" IS 'Tên nhãn xếp hạng hiển thị trực quan (ví dụ: Excellent, Good, Meet Expectations...)';

COMMENT ON COLUMN "performance_ratings"."score" IS 'Trọng số mốc điểm tối thiểu hoặc điểm quy đổi tương đương của hạng (ví dụ: Hạng A tương đương 4.00 hoặc 90-100 điểm)';

COMMENT ON COLUMN "performance_ratings"."description" IS 'Mô tả chi tiết tiêu chí hành vi hoặc kết quả để đạt được thứ hạng này';

COMMENT ON COLUMN "performance_ratings"."created_at" IS 'Thời gian tạo mốc';

COMMENT ON COLUMN "performance_goals"."id" IS 'Goal ID (Khóa chính - Chỉ tiêu cam kết nhân sự)';

COMMENT ON COLUMN "performance_goals"."tenant_id" IS 'Mục tiêu hiệu suất thuộc Tenant nào';

COMMENT ON COLUMN "performance_goals"."employment_id" IS 'Chỉ tiêu mục tiêu này được gán giao cho nhân sự nào thực hiện';

COMMENT ON COLUMN "performance_goals"."performance_cycle_id" IS 'Mục tiêu cam kết này áp dụng chạy cho chu kỳ đánh giá nào';

COMMENT ON COLUMN "performance_goals"."title" IS 'Tên mục tiêu / Chỉ tiêu ngắn gọn (ví dụ: Đạt doanh số bán hàng cá nhân, Tối ưu 20% tốc độ tải trang...)';

COMMENT ON COLUMN "performance_goals"."description" IS 'Mô tả chi tiết cách thức thực hiện và tiêu chí đo lường định lượng thành công (Key Results)';

COMMENT ON COLUMN "performance_goals"."target_value" IS 'Giá trị con số mục tiêu cần đạt được (ví dụ: Đạt con số 100.00%, đạt doanh thu 500,000,000 VND)';

COMMENT ON COLUMN "performance_goals"."weight" IS 'Tỷ trọng phần trăm đóng góp của mục tiêu này trong tổng bộ chỉ tiêu (Tổng trọng số các mục tiêu trong kỳ = 100.00%)';

COMMENT ON COLUMN "performance_goals"."due_date" IS 'Hạn chót bắt buộc phải hoàn thành mục tiêu đề ra';

COMMENT ON COLUMN "performance_goals"."created_at" IS 'Thời gian tạo mục tiêu';

COMMENT ON COLUMN "performance_goals"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "performance_goal_progress"."id" IS 'Progress ID (Khóa chính)';

COMMENT ON COLUMN "performance_goal_progress"."goal_id" IS 'Cập nhật tiến trình thực hiện cho chỉ tiêu mục tiêu nào';

COMMENT ON COLUMN "performance_goal_progress"."progress" IS 'Tỷ lệ phần trăm tiến độ hoàn thành thực tế hiện tại (ví dụ: Đã đạt được 75.50%)';

COMMENT ON COLUMN "performance_goal_progress"."note" IS 'Giải trình chi tiết kết quả đạt được tại mốc cập nhật này (Chứng minh kết quả kèm theo Link...)';

COMMENT ON COLUMN "performance_goal_progress"."updated_by_principal_id" IS 'Chủ thể định danh (Bản thân nhân viên hoặc Quản lý đối soát) cập nhật số liệu tiến độ này';

COMMENT ON COLUMN "performance_goal_progress"."updated_at" IS 'Thời điểm cập nhật ghi nhận tiến độ';

COMMENT ON COLUMN "performance_reviews"."id" IS 'Review ID (Khóa chính - Phiếu đánh giá trung tâm)';

COMMENT ON COLUMN "performance_reviews"."tenant_id" IS 'Phiếu đánh giá thuộc không gian dữ liệu Tenant nào';

COMMENT ON COLUMN "performance_reviews"."employment_id" IS 'Phiếu đánh giá lập ra cho quan hệ lao động của nhân viên nào nhận';

COMMENT ON COLUMN "performance_reviews"."reviewer_employment_id" IS 'Mã quan hệ lao động của Quản lý cấp trên đóng vai trò là Người chấm điểm chính';

COMMENT ON COLUMN "performance_reviews"."performance_cycle_id" IS 'Phiếu đánh giá hạch toán tổng kết cho chu kỳ nào';

COMMENT ON COLUMN "performance_reviews"."workflow_instance_id" IS 'Liên kết luồng chạy quy trình ký duyệt điểm số tự động qua phân hệ Workflow Engine';

COMMENT ON COLUMN "performance_reviews"."overall_rating_id" IS 'Kết quả phân loại xếp hạng chung cuộc sau khi chốt điểm (ví dụ: Hạng A, Hạng B...)';

COMMENT ON COLUMN "performance_reviews"."overall_score" IS 'Điểm số tổng kết cuối cùng tính toán từ trung bình cộng có tỷ trọng của các dòng mục tiêu';

COMMENT ON COLUMN "performance_reviews"."status" IS 'Trạng thái tiến trình của phiếu đánh giá (Áp dụng Enum review_status)';

COMMENT ON COLUMN "performance_reviews"."comment" IS 'Nhận xét tổng quát chi tiết của Quản lý về điểm mạnh, điểm yếu và định hướng phát triển của nhân viên';

COMMENT ON COLUMN "performance_reviews"."created_at" IS 'Thời gian tạo phiếu đánh giá';

COMMENT ON COLUMN "performance_reviews"."updated_at" IS 'Thời gian cập nhật phiếu gần nhất';

COMMENT ON COLUMN "performance_review_items"."id" IS 'Khóa chính - Dòng chi tiết điểm số của phiếu đánh giá';

COMMENT ON COLUMN "performance_review_items"."performance_review_id" IS 'Thuộc phiếu tổng hợp đánh giá hiệu suất cha nào';

COMMENT ON COLUMN "performance_review_items"."goal_id" IS 'Dòng chấm điểm này đối chiếu kết quả cho chỉ tiêu KPI/OKR cụ thể nào (Để trống nếu chấm điểm theo tiêu chí năng lực hành vi mềm)';

COMMENT ON COLUMN "performance_review_items"."criteria" IS 'Tên tiêu chí năng lực hành vi chấm điểm bổ sung (ví dụ: Tinh thần đồng đội, Tính chủ động...) nếu không gắn theo KPI cụ thể';

COMMENT ON COLUMN "performance_review_items"."rating_id" IS 'Kết quả xếp hạng riêng lẻ được cấu hình cho dòng chỉ tiêu này';

COMMENT ON COLUMN "performance_review_items"."score" IS 'Điểm số chi tiết do người đánh giá chấm cho riêng mục tiêu/tiêu chí này';

COMMENT ON COLUMN "performance_review_items"."comment" IS 'Ý kiến nhận xét, lý giải giải trình riêng cho điểm số của mục tiêu/tiêu chí này';

COMMENT ON COLUMN "training_courses"."id" IS 'Course ID (Khóa chính - Định nghĩa khung khóa học)';

COMMENT ON COLUMN "training_courses"."tenant_id" IS 'Khóa học thuộc cấu hình của Tenant nào';

COMMENT ON COLUMN "training_courses"."code" IS 'Mã khóa học mẫu (ví dụ: SEC_AW_01 (An toàn thông tin), SOFT_SKILLS_02...)';

COMMENT ON COLUMN "training_courses"."name" IS 'Tên khóa học hiển thị trực quan (ví dụ: Đào tạo Hội nhập văn hóa doanh nghiệp, Kỹ năng giao tiếp nâng cao...)';

COMMENT ON COLUMN "training_courses"."category" IS 'Phân loại nhóm khóa học (ví dụ: COMPLIANCE (Bắt buộc tuân thủ), TECHNICAL (Chuyên môn kỹ thuật), SOFT_SKILLS...)';

COMMENT ON COLUMN "training_courses"."duration_hours" IS 'Thời lượng phân bổ ước tính của khóa học tính theo đơn vị Giờ (ví dụ: 12.50 giờ)';

COMMENT ON COLUMN "training_courses"."description" IS 'Mô tả chi tiết nội dung chương trình học và mục tiêu đầu ra của khóa học';

COMMENT ON COLUMN "training_courses"."is_active" IS 'Khóa học này còn đang được phép áp dụng để mở lớp đào tạo mới hay không';

COMMENT ON COLUMN "training_courses"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "training_courses"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "training_sessions"."id" IS 'Session ID (Khóa chính - Một lớp học vật lý theo lịch)';

COMMENT ON COLUMN "training_sessions"."tenant_id" IS 'Lớp học thuộc phạm vi Tenant nào';

COMMENT ON COLUMN "training_sessions"."course_id" IS 'Lớp học này triển khai giảng dạy dựa trên khung nội dung khóa học nào';

COMMENT ON COLUMN "training_sessions"."instructor_employment_id" IS 'Mã quan hệ lao động của Nhân viên đóng vai trò là Giảng viên/Người hướng dẫn lớp học';

COMMENT ON COLUMN "training_sessions"."start_date" IS 'Ngày khai giảng / Bắt đầu buổi học đầu tiên';

COMMENT ON COLUMN "training_sessions"."end_date" IS 'Ngày bế giảng / Kết thúc thời gian học';

COMMENT ON COLUMN "training_sessions"."location" IS 'Địa điểm diễn ra lớp học (ví dụ: Phòng đào tạo Tầng 2, Hội trường chính, hoặc ghi ONLINE nếu học trực tuyến)';

COMMENT ON COLUMN "training_sessions"."capacity" IS 'Số lượng học viên tối đa được phép đăng ký tham gia lớp (Giới hạn quy mô lớp học)';

COMMENT ON COLUMN "training_sessions"."status" IS 'Trạng thái vận hành của lớp học (Áp dụng Enum training_status)';

COMMENT ON COLUMN "training_sessions"."created_at" IS 'Thời gian tạo lớp học';

COMMENT ON COLUMN "training_sessions"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "training_enrollments"."id" IS 'Enrollment ID (Khóa chính - Một lượt đăng ký học)';

COMMENT ON COLUMN "training_enrollments"."tenant_id" IS 'Lượt đăng ký thuộc phạm vi Tenant nào';

COMMENT ON COLUMN "training_enrollments"."employment_id" IS 'Đăng ký khóa học cho quan hệ lao động của nhân sự nào làm học viên';

COMMENT ON COLUMN "training_enrollments"."session_id" IS 'Học viên đăng ký tham gia vào lớp học cụ thể nào';

COMMENT ON COLUMN "training_enrollments"."enrolled_at" IS 'Thời điểm nhân viên thực hiện thao tác đăng ký hoặc được HR chỉ định vào lớp học';

COMMENT ON COLUMN "training_enrollments"."status" IS 'Trạng thái học tập của học viên trong lớp (Áp dụng Enum enrollment_status)';

COMMENT ON COLUMN "training_enrollments"."created_at" IS 'Thời gian tạo bản ghi';

COMMENT ON COLUMN "training_results"."id" IS 'Result ID (Khóa chính - Bảng điểm thi cuối khóa)';

COMMENT ON COLUMN "training_results"."enrollment_id" IS 'Bảng điểm thi đánh giá áp dụng cho lượt học tập của học viên nào';

COMMENT ON COLUMN "training_results"."score" IS 'Điểm số bài thi hoặc bài kiểm tra cuối khóa đạt được (ví dụ: 85.50 / 100 điểm)';

COMMENT ON COLUMN "training_results"."passed" IS 'Đánh giá kết luận học viên Đạt (True) hay Không đạt (False) tiêu chuẩn hoàn thành khóa học';

COMMENT ON COLUMN "training_results"."feedback" IS 'Ý kiến nhận xét chi tiết, đánh giá ưu khuyết điểm của giảng viên dành cho học viên';

COMMENT ON COLUMN "training_results"."evaluated_by_employment_id" IS 'Mã quan hệ lao động của Nhân viên/Giảng viên thực hiện chấm điểm bài thi này';

COMMENT ON COLUMN "training_results"."evaluated_at" IS 'Thời điểm thực hiện chấm điểm và công bố kết quả học tập';

COMMENT ON COLUMN "training_certificates"."id" IS 'Certificate ID (Khóa chính - Chứng chỉ số)';

COMMENT ON COLUMN "training_certificates"."tenant_id" IS 'Chứng chỉ thuộc phạm vi Tenant nào phát hành';

COMMENT ON COLUMN "training_certificates"."enrollment_id" IS 'Chứng chỉ được cấp dựa trên lượt hoàn thành khóa học đạt chuẩn tương ứng nào';

COMMENT ON COLUMN "training_certificates"."certificate_no" IS 'Số hiệu văn bản định danh của chứng chỉ (ví dụ: CERT-2026-ISO-0092)';

COMMENT ON COLUMN "training_certificates"."issued_date" IS 'Ngày chính thức cấp phát và công nhận chứng chỉ';

COMMENT ON COLUMN "training_certificates"."expiry_date" IS 'Ngày hết hiệu lực của chứng chỉ (đối với một số chứng chỉ chuyên môn cần tái đào tạo định kỳ, ví dụ: PMP, An toàn lao động...)';

COMMENT ON COLUMN "training_certificates"."file_id" IS 'Mã liên kết tới file ảnh/PDF phôi chứng chỉ lưu trong phân hệ Quản lý file để nhân viên xem/tải về';

COMMENT ON COLUMN "training_certificates"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "asset_categories"."id" IS 'Category ID (Khóa chính)';

COMMENT ON COLUMN "asset_categories"."tenant_id" IS 'Danh mục tài sản thuộc cấu hình của Tenant nào';

COMMENT ON COLUMN "asset_categories"."code" IS 'Mã nhóm tài sản (ví dụ: LAPTOP, SMARTPHONE, OFFICE_CHAIR, VEHICLE...)';

COMMENT ON COLUMN "asset_categories"."name" IS 'Tên nhóm tài sản hiển thị trực quan (ví dụ: Máy tính xách tay, Điện thoại công vụ, Ghế văn phòng...)';

COMMENT ON COLUMN "asset_categories"."description" IS 'Mô tả chi tiết quy định sử dụng hoặc định biên tiêu chuẩn của nhóm tài sản này';

COMMENT ON COLUMN "asset_categories"."created_at" IS 'Thời gian tạo';

COMMENT ON COLUMN "asset_categories"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "assets"."id" IS 'Asset ID (Khóa chính - Định danh một mã tài sản cụ thể)';

COMMENT ON COLUMN "assets"."tenant_id" IS 'Tài sản vật lý thuộc Tenant nào sở hữu';

COMMENT ON COLUMN "assets"."category_id" IS 'Tài sản thuộc nhóm phân loại nào';

COMMENT ON COLUMN "assets"."asset_code" IS 'Mã thẻ tài sản độc nhất (Mã kiểm kê hành chính, ví dụ: FA-LAP-2026-0092)';

COMMENT ON COLUMN "assets"."asset_name" IS 'Tên chi tiết của thiết bị tài sản (ví dụ: Macbook Pro M4 16GB)';

COMMENT ON COLUMN "assets"."serial_number" IS 'Số Serial của nhà sản xuất ghi trên phần cứng thiết bị (S/N)';

COMMENT ON COLUMN "assets"."manufacturer" IS 'Hãng sản xuất thiết bị (ví dụ: Apple, Dell, Samsung, Logitech...)';

COMMENT ON COLUMN "assets"."model" IS 'Dòng sản phẩm / Đời máy của thiết bị (ví dụ: A2941, XPS 13...)';

COMMENT ON COLUMN "assets"."purchase_date" IS 'Ngày doanh nghiệp mua tài sản về';

COMMENT ON COLUMN "assets"."purchase_price" IS 'Nguyên giá / Giá trị mua của tài sản phục vụ hạch toán khấu hao';

COMMENT ON COLUMN "assets"."warranty_expiry" IS 'Ngày hết hạn bảo hành chính hãng của thiết bị';

COMMENT ON COLUMN "assets"."current_status" IS 'Trạng thái vận hành hiện tại của tài sản (Áp dụng Enum asset_status)';

COMMENT ON COLUMN "assets"."metadata" IS 'Dữ liệu cấu hình phần cứng mở rộng dạng JSON (Lưu chi tiết RAM, CPU, Ổ cứng...)';

COMMENT ON COLUMN "assets"."created_at" IS 'Thời gian tạo bản ghi tài sản';

COMMENT ON COLUMN "assets"."updated_at" IS 'Thời gian cập nhật gần nhất';

COMMENT ON COLUMN "asset_assignments"."id" IS 'Assignment ID (Khóa chính - Biên bản bàn giao tài sản)';

COMMENT ON COLUMN "asset_assignments"."tenant_id" IS 'Lượt bàn giao cấp phát thuộc phạm vi Tenant nào';

COMMENT ON COLUMN "asset_assignments"."asset_id" IS 'Thiết bị tài sản cụ thể nào được mang đi cấp phát';

COMMENT ON COLUMN "asset_assignments"."employment_id" IS 'Bàn giao thiết bị cho quan hệ lao động của nhân viên nào sử dụng';

COMMENT ON COLUMN "asset_assignments"."assigned_by_principal_id" IS 'Chủ thể định danh (Admin/Thủ kho) thực hiện ký lệnh bàn giao thiết bị';

COMMENT ON COLUMN "asset_assignments"."assigned_at" IS 'Thời điểm bàn giao vật lý thiết bị tài sản cho nhân viên';

COMMENT ON COLUMN "asset_assignments"."expected_return_at" IS 'Ngày dự kiến bắt buộc phải hoàn trả tài sản (ví dụ: Hết hạn thử việc, bàn giao theo dự án 3 tháng...)';

COMMENT ON COLUMN "asset_assignments"."actual_return_at" IS 'Ngày hoàn trả thực tế (Được cập nhật khi nhân sự làm thủ tục trả tài sản)';

COMMENT ON COLUMN "asset_assignments"."assignment_status" IS 'Trạng thái hiệu lực của lượt cấp phát (Áp dụng Enum assignment_status)';

COMMENT ON COLUMN "asset_assignments"."note" IS 'Ghi chú hiện trạng của tài sản tại thời điểm bàn giao (ví dụ: Máy mới 100%, Máy trầy xước nhẹ góc...)';

COMMENT ON COLUMN "asset_assignments"."created_at" IS 'Thời gian tạo biên bản bàn giao';

COMMENT ON COLUMN "asset_returns"."id" IS 'Return ID (Khóa chính - Biên bản thu hồi tài sản)';

COMMENT ON COLUMN "asset_returns"."assignment_id" IS 'Lượt thu hồi này xử lý hoàn trả dựa trên biên bản bàn giao gốc nào';

COMMENT ON COLUMN "asset_returns"."returned_by_principal_id" IS 'Chủ thể định danh (Thủ kho/HR Admin) thực hiện tiếp nhận thu hồi lại tài sản từ nhân viên';

COMMENT ON COLUMN "asset_returns"."returned_at" IS 'Thời điểm thu hồi vật lý thiết bị về kho thành công';

COMMENT ON COLUMN "asset_returns"."condition_note" IS 'Ghi chú hiện trạng tài sản sau khi nhận lại (Đối soát hư hại, ví dụ: Máy móp vỏ, mất sạc...)';

COMMENT ON COLUMN "asset_returns"."damage_cost" IS 'Chi phí đền bù thiệt hại vật chất do nhân viên làm hỏng (nếu có, để khấu trừ vào lương hoặc phạt)';

COMMENT ON COLUMN "asset_returns"."created_at" IS 'Thời gian tạo biên bản thu hồi';

COMMENT ON COLUMN "asset_maintenances"."id" IS 'Maintenance ID (Khóa chính - Phiếu bảo trì sửa chữa)';

COMMENT ON COLUMN "asset_maintenances"."tenant_id" IS 'Lịch sử bảo trì thuộc phạm vi Tenant nào';

COMMENT ON COLUMN "asset_maintenances"."asset_id" IS 'Thiết bị tài sản cụ thể nào được đem đi sửa chữa/bảo dưỡng';

COMMENT ON COLUMN "asset_maintenances"."maintenance_type" IS 'Phân loại hình thức sửa chữa (ví dụ: ROUTINE (Bảo dưỡng định kỳ), REPAIR (Sửa chữa hư hỏng), UPGRADE (Nâng cao linh kiện)...)';

COMMENT ON COLUMN "asset_maintenances"."vendor" IS 'Tên trung tâm bảo hành hoặc đối tác bên thứ ba thực hiện sửa chữa sửa thiết bị';

COMMENT ON COLUMN "asset_maintenances"."cost" IS 'Chi phí phát sinh cho việc sửa chữa/bảo trì thiết bị tài sản';

COMMENT ON COLUMN "asset_maintenances"."started_at" IS 'Thời điểm bàn giao máy cho bên kỹ thuật để bắt đầu bảo trì';

COMMENT ON COLUMN "asset_maintenances"."completed_at" IS 'Thời điểm hoàn thành bảo trì và nhận máy về lại kho';

COMMENT ON COLUMN "asset_maintenances"."note" IS 'Nội dung chi tiết các hạng mục đã can thiệp kỹ thuật (ví dụ: Thay thế ổ cứng SSD, Thay màn hình mới...)';

COMMENT ON COLUMN "asset_disposals"."id" IS 'Disposal ID (Khóa chính - Phiếu quyết định thanh lý tài sản)';

COMMENT ON COLUMN "asset_disposals"."tenant_id" IS 'Quyết định thanh lý thuộc phạm vi Tenant nào';

COMMENT ON COLUMN "asset_disposals"."asset_id" IS 'Thiết bị tài sản cụ thể nào bị loại bỏ khỏi hệ thống';

COMMENT ON COLUMN "asset_disposals"."disposed_at" IS 'Thời điểm chính thức thực hiện hành vi hủy/thanh lý tài sản vật lý';

COMMENT ON COLUMN "asset_disposals"."disposal_method" IS 'Hình thức loại bỏ tài sản (ví dụ: SCRAPPED (Hủy thành phế liệu), SOLD (Bán thanh lý hóa giá), DONATED (Quyên góp)...)';

COMMENT ON COLUMN "asset_disposals"."disposal_value" IS 'Giá trị tiền thu về được từ việc bán thanh lý hóa giá tài sản (Bằng 0 nếu hủy bỏ vứt đi)';

COMMENT ON COLUMN "asset_disposals"."reason" IS 'Lý do chi tiết đưa ra quyết định thanh lý (ví dụ: Thiết bị lỗi thời không đáp ứng hiệu năng, Chập cháy phần cứng không thể sửa chữa...)';

ALTER TABLE "tenants" ADD FOREIGN KEY ("logo_file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tenant_domains" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tenant_subscriptions" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tenant_subscriptions" ADD FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tenant_settings" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "principals" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "users" ADD FOREIGN KEY ("principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "users" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "credentials" ADD FOREIGN KEY ("principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "sessions" ADD FOREIGN KEY ("principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "sessions" ADD FOREIGN KEY ("refresh_token_id") REFERENCES "refresh_tokens" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "mfa_methods" ADD FOREIGN KEY ("principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "api_keys" ADD FOREIGN KEY ("principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "refresh_tokens" ADD FOREIGN KEY ("principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "permissions" ADD FOREIGN KEY ("permission_group_id") REFERENCES "permission_groups" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "permissions" ADD FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "permissions" ADD FOREIGN KEY ("action_id") REFERENCES "actions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "roles" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "role_permissions" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "role_permissions" ADD FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "principal_roles" ADD FOREIGN KEY ("principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "principal_roles" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "principal_roles" ADD FOREIGN KEY ("scope_id") REFERENCES "scopes" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "principal_permissions" ADD FOREIGN KEY ("principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "principal_permissions" ADD FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "principal_permissions" ADD FOREIGN KEY ("scope_id") REFERENCES "scopes" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "role_hierarchies" ADD FOREIGN KEY ("parent_role_id") REFERENCES "roles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "role_hierarchies" ADD FOREIGN KEY ("child_role_id") REFERENCES "roles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organizations" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organization_units" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organization_units" ADD FOREIGN KEY ("parent_unit_id") REFERENCES "organization_units" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organization_units" ADD FOREIGN KEY ("unit_type_id") REFERENCES "organization_unit_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "positions" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cost_centers" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organization_calendars" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "configurations" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "feature_flags" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "numbering_sequences" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "email_templates" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "system_calendars" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "holidays" ADD FOREIGN KEY ("calendar_id") REFERENCES "system_calendars" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_definitions" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_steps" ADD FOREIGN KEY ("workflow_definition_id") REFERENCES "workflow_definitions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_transitions" ADD FOREIGN KEY ("workflow_definition_id") REFERENCES "workflow_definitions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_transitions" ADD FOREIGN KEY ("from_step_id") REFERENCES "workflow_steps" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_transitions" ADD FOREIGN KEY ("to_step_id") REFERENCES "workflow_steps" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_instances" ADD FOREIGN KEY ("workflow_definition_id") REFERENCES "workflow_definitions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_instances" ADD FOREIGN KEY ("current_step_id") REFERENCES "workflow_steps" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_instances" ADD FOREIGN KEY ("started_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_tasks" ADD FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow_instances" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_tasks" ADD FOREIGN KEY ("workflow_step_id") REFERENCES "workflow_steps" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_tasks" ADD FOREIGN KEY ("assignee_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_histories" ADD FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow_instances" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_histories" ADD FOREIGN KEY ("workflow_step_id") REFERENCES "workflow_steps" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "workflow_histories" ADD FOREIGN KEY ("actor_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notification_templates" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("template_id") REFERENCES "notification_templates" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("created_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notification_recipients" ADD FOREIGN KEY ("notification_id") REFERENCES "notifications" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notification_recipients" ADD FOREIGN KEY ("principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notification_deliveries" ADD FOREIGN KEY ("recipient_id") REFERENCES "notification_recipients" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "files" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "files" ADD FOREIGN KEY ("created_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "file_versions" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "file_versions" ADD FOREIGN KEY ("uploaded_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "file_attachments" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "file_attachments" ADD FOREIGN KEY ("attached_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_logs" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_logs" ADD FOREIGN KEY ("actor_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_details" ADD FOREIGN KEY ("audit_log_id") REFERENCES "audit_logs" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_exports" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_exports" ADD FOREIGN KEY ("exported_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_exports" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comments" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comments" ADD FOREIGN KEY ("parent_comment_id") REFERENCES "comments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comments" ADD FOREIGN KEY ("author_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comment_mentions" ADD FOREIGN KEY ("comment_id") REFERENCES "comments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comment_mentions" ADD FOREIGN KEY ("principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comment_reactions" ADD FOREIGN KEY ("comment_id") REFERENCES "comments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comment_reactions" ADD FOREIGN KEY ("principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "custom_field_definitions" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "custom_field_definitions" ADD FOREIGN KEY ("created_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "custom_field_options" ADD FOREIGN KEY ("custom_field_definition_id") REFERENCES "custom_field_definitions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "custom_field_values" ADD FOREIGN KEY ("custom_field_definition_id") REFERENCES "custom_field_definitions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tags" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tags" ADD FOREIGN KEY ("created_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tag_assignments" ADD FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tag_assignments" ADD FOREIGN KEY ("assigned_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employees" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employees" ADD FOREIGN KEY ("principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employees" ADD FOREIGN KEY ("avatar_file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee_contacts" ADD FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee_addresses" ADD FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee_emergency_contacts" ADD FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee_documents" ADD FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee_documents" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee_contacts" ADD FOREIGN KEY ("employee_id") REFERENCES "employee_addresses" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employment_types" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "contract_types" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employments" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employments" ADD FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employments" ADD FOREIGN KEY ("employment_type_id") REFERENCES "employment_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employment_contracts" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employment_contracts" ADD FOREIGN KEY ("contract_type_id") REFERENCES "contract_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employment_contracts" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employment_status_histories" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employment_status_histories" ADD FOREIGN KEY ("changed_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_titles" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "work_locations" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organization_assignments" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organization_assignments" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organization_assignments" ADD FOREIGN KEY ("department_id") REFERENCES "organization_assignments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organization_assignments" ADD FOREIGN KEY ("position_id") REFERENCES "positions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organization_assignments" ADD FOREIGN KEY ("job_title_id") REFERENCES "job_titles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organization_assignments" ADD FOREIGN KEY ("manager_employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organization_assignments" ADD FOREIGN KEY ("work_location_id") REFERENCES "work_locations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "organization_assignments" ADD FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "shifts" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "shift_assignments" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "shift_assignments" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "shift_assignments" ADD FOREIGN KEY ("shift_id") REFERENCES "shifts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_records" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_records" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_records" ADD FOREIGN KEY ("shift_assignment_id") REFERENCES "shift_assignments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_records" ADD FOREIGN KEY ("device_id") REFERENCES "attendance_devices" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_adjustments" ADD FOREIGN KEY ("attendance_record_id") REFERENCES "attendance_records" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_adjustments" ADD FOREIGN KEY ("requested_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_adjustments" ADD FOREIGN KEY ("approved_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attendance_devices" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_types" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_policies" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_policies" ADD FOREIGN KEY ("leave_type_id") REFERENCES "leave_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_policies" ADD FOREIGN KEY ("employment_type_id") REFERENCES "employment_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_balances" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_balances" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_balances" ADD FOREIGN KEY ("leave_type_id") REFERENCES "leave_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_requests" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_requests" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_requests" ADD FOREIGN KEY ("leave_type_id") REFERENCES "leave_types" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_requests" ADD FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow_instances" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_transactions" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_transactions" ADD FOREIGN KEY ("leave_balance_id") REFERENCES "leave_balances" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "leave_transactions" ADD FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "salary_structures" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "salary_components" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee_salary_assignments" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee_salary_assignments" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee_salary_assignments" ADD FOREIGN KEY ("salary_structure_id") REFERENCES "salary_structures" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payroll_periods" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payrolls" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payrolls" ADD FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payrolls" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payrolls" ADD FOREIGN KEY ("payslip_file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payroll_items" ADD FOREIGN KEY ("payroll_id") REFERENCES "payrolls" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payroll_items" ADD FOREIGN KEY ("salary_component_id") REFERENCES "salary_components" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee_salary_assignments" ADD FOREIGN KEY ("employment_id") REFERENCES "employee_salary_assignments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_requisitions" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_requisitions" ADD FOREIGN KEY ("department_id") REFERENCES "organization_units" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_requisitions" ADD FOREIGN KEY ("position_id") REFERENCES "positions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_requisitions" ADD FOREIGN KEY ("requested_by_employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_postings" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_postings" ADD FOREIGN KEY ("requisition_id") REFERENCES "job_requisitions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "candidates" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "candidates" ADD FOREIGN KEY ("resume_file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_applications" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_applications" ADD FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_applications" ADD FOREIGN KEY ("job_posting_id") REFERENCES "job_postings" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "interviews" ADD FOREIGN KEY ("application_id") REFERENCES "job_applications" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "interviews" ADD FOREIGN KEY ("interviewer_employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_offers" ADD FOREIGN KEY ("application_id") REFERENCES "job_applications" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "job_offers" ADD FOREIGN KEY ("offer_file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "hiring_records" ADD FOREIGN KEY ("application_id") REFERENCES "job_applications" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "hiring_records" ADD FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "hiring_records" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_cycles" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_ratings" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_goals" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_goals" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_goals" ADD FOREIGN KEY ("performance_cycle_id") REFERENCES "performance_cycles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_goal_progress" ADD FOREIGN KEY ("goal_id") REFERENCES "performance_goals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_goal_progress" ADD FOREIGN KEY ("updated_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_reviews" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_reviews" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_reviews" ADD FOREIGN KEY ("reviewer_employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_reviews" ADD FOREIGN KEY ("performance_cycle_id") REFERENCES "performance_cycles" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_reviews" ADD FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow_instances" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_reviews" ADD FOREIGN KEY ("overall_rating_id") REFERENCES "performance_ratings" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_review_items" ADD FOREIGN KEY ("performance_review_id") REFERENCES "performance_reviews" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_review_items" ADD FOREIGN KEY ("goal_id") REFERENCES "performance_goals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "performance_review_items" ADD FOREIGN KEY ("rating_id") REFERENCES "performance_ratings" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "training_courses" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "training_sessions" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "training_sessions" ADD FOREIGN KEY ("course_id") REFERENCES "training_courses" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "training_sessions" ADD FOREIGN KEY ("instructor_employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "training_enrollments" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "training_enrollments" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "training_enrollments" ADD FOREIGN KEY ("session_id") REFERENCES "training_sessions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "training_results" ADD FOREIGN KEY ("enrollment_id") REFERENCES "training_enrollments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "training_results" ADD FOREIGN KEY ("evaluated_by_employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "training_certificates" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "training_certificates" ADD FOREIGN KEY ("enrollment_id") REFERENCES "training_enrollments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "training_certificates" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_categories" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "assets" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "assets" ADD FOREIGN KEY ("category_id") REFERENCES "asset_categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_assignments" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_assignments" ADD FOREIGN KEY ("asset_id") REFERENCES "assets" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_assignments" ADD FOREIGN KEY ("employment_id") REFERENCES "employments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_assignments" ADD FOREIGN KEY ("assigned_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_returns" ADD FOREIGN KEY ("assignment_id") REFERENCES "asset_assignments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_returns" ADD FOREIGN KEY ("returned_by_principal_id") REFERENCES "principals" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_maintenances" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_maintenances" ADD FOREIGN KEY ("asset_id") REFERENCES "assets" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_disposals" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "asset_disposals" ADD FOREIGN KEY ("asset_id") REFERENCES "assets" ("id") DEFERRABLE INITIALLY IMMEDIATE;
