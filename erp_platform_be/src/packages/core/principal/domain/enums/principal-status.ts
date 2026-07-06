export enum PrincipalStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  LOCKED = 'LOCKED',
}

export enum PrincipalType {
  USER = 'USER',
  SERVICE_ACCOUNT = 'SERVICE_ACCOUNT',
  API_KEY = 'API_KEY',
}

export const PRINCIPAL_REPOSITORY = Symbol('PRINCIPAL_REPOSITORY');
