export interface JwtPayload {
  sub: string; // 사용자 ID
  email: string;
  role: string;
  iat?: number; // 발급 시간
  exp?: number; // 만료 시간
}

export interface RefreshTokenPayload {
  sub: string; // 사용자 ID
  tokenId: string; // 토큰 고유 ID
  iat?: number;
  exp?: number;
}