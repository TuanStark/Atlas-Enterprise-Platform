export const JWT_TOKEN_SERVICE = Symbol('JWT_TOKEN_SERVICE');

export interface JwtTokenService {
  generateAccessToken(principalId: string): Promise<string>;
  generateRefreshToken(principalId: string): Promise<string>;
  verifyAccessToken<T>(token: string): Promise<T>;
  verifyRefreshToken<T>(token: string): Promise<T>;
}
