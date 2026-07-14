export enum OrganizationErrorCode {
  ORGANIZATION_ALREADY_EXISTS = 'ORGANIZATION_ALREADY_EXISTS',
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
}

export enum OrganizationSuccessCode {
  ORGANIZATION_CREATED = 'ORGANIZATION_CREATED',
  ORGANIZATION_UPDATED = 'ORGANIZATION_UPDATED',
  ORGANIZATION_DELETED = 'ORGANIZATION_DELETED',
}

export const OrganizationMessages = {
  SUCCESS: {
    ORGANIZATION_CREATED: 'Organization created successfully.',
    ORGANIZATION_UPDATED: 'Organization updated successfully.',
    ORGANIZATION_DELETED: 'Organization deleted successfully.',
  },
  ERROR: {
    ORGANIZATION_ALREADY_EXISTS: 'Organization code already exists.',
    ORGANIZATION_NOT_FOUND: 'Organization not found.',
  },
};
