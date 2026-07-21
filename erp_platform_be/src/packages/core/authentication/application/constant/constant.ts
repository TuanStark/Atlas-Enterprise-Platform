export enum AuthErrorCode {
  PRINCIPAL_NOT_FOUND = 'PRINCIPAL_NOT_FOUND',
  PASSWORD_NOT_MATCH = 'PASSWORD_NOT_MATCH',
  USER_LOCKED = 'USER_LOCKED',
  IMPERSONATE_SELF = 'IMPERSONATE_SELF',
  TARGET_NOT_FOUND = 'TARGET_NOT_FOUND',
  CROSS_TENANT = 'CROSS_TENANT',
  TARGET_INACTIVE = 'TARGET_INACTIVE',
  INSUFFICIENT_HIERARCHY = 'INSUFFICIENT_HIERARCHY',
  NOT_IMPERSONATING = 'NOT_IMPERSONATING',
}

export enum AuthSuccessCode {
  SWITCH_SUCCESS = 'SWITCH_ACCOUNT_SUCCESS',
  END_IMPERSONATION_SUCCESS = 'END_IMPERSONATION_SUCCESS',
}

export const AuthMessages = {
  ERROR: {
    IMPERSONATE_SELF: 'Không thể đóng vai chính mình.',
    TARGET_NOT_FOUND: 'Tài khoản mục tiêu không tồn tại.',
    CROSS_TENANT: 'Không thể chuyển đổi sang tài khoản thuộc tổ chức khác.',
    TARGET_INACTIVE: 'Tài khoản mục tiêu không hoạt động.',
    INSUFFICIENT_HIERARCHY:
      'Bạn không có quyền đóng vai tài khoản này. Chỉ tài khoản cấp cao hơn mới có thể đóng vai tài khoản cấp thấp hơn.',
    NOT_IMPERSONATING: 'Bạn hiện không đang trong phiên đóng vai.',
    PRINCIPAL_NOT_FOUND: 'Phiên đăng nhập không hợp lệ.',
  },
  SUCCESS: {
    SWITCH_SUCCESS: 'Chuyển đổi tài khoản thành công.',
    END_IMPERSONATION_SUCCESS: 'Kết thúc đóng vai thành công.',
  },
};
