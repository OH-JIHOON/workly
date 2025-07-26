import { ConfigService } from '@nestjs/config';

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  bcrypt: {
    saltRounds: number;
  };
  session: {
    secret: string;
    maxAge: number;
  };
}

export const getAuthConfig = (configService: ConfigService): AuthConfig => {
  return {
    jwt: {
      secret: configService.get('JWT_SECRET', 'workly-super-secret-key'),
      expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
      refreshExpiresIn: configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    },
    google: {
      clientId: configService.get('GOOGLE_CLIENT_ID', ''),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET', ''),
      callbackUrl: configService.get('GOOGLE_CALLBACK_URL', 'http://localhost:8000/auth/google/callback'),
    },
    bcrypt: {
      saltRounds: parseInt(configService.get('BCRYPT_SALT_ROUNDS', '12')),
    },
    session: {
      secret: configService.get('SESSION_SECRET', 'workly-session-secret'),
      maxAge: parseInt(configService.get('SESSION_MAX_AGE', '86400000')), // 24시간
    },
  };
};