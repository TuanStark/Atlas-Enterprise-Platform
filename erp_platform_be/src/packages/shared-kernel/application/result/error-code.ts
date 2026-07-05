export type ErrorCode = string;

export interface ErrorDetail {
  code: ErrorCode;
  message: string;
  field?: string;
}
