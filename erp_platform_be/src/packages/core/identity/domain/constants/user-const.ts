export enum UserErrorCode {
  NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'USER_EMAIL_ALREADY_EXISTS',
  INVALID_PASSWORD = 'USER_INVALID_PASSWORD',
  USER_LOCKED = 'USER_LOCKED',
}

export enum UserSuccessCode {
  CREATED = 'USER_CREATED',
  UPDATED = 'USER_UPDATED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
}

export const UserMessages = {
  SUCCESS: {
    CREATED: 'User created successfully.',
    UPDATED: 'User updated successfully.',
    PASSWORD_CHANGED: 'Password changed successfully.',
  },

  ERROR: {
    NOT_FOUND: 'User not found.',
    EMAIL_ALREADY_EXISTS: 'Email already exists.',
    INVALID_PASSWORD: 'Invalid password.',
    USER_LOCKED: 'User has been locked.',
  },
};
