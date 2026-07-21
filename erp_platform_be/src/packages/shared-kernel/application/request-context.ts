export interface RequestContext {
  tenantId: string;
  principalId: string;
  username: string;
  email?: string;
  roles: readonly string[];
  permissions: readonly string[];
  avatarUrl?: string;
  impersonatorId?: string;
}
