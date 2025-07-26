import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { getAuthConfig } from '../../../config/auth.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const authConfig = getAuthConfig(configService);
    
    super({
      clientID: authConfig.google.clientId,
      clientSecret: authConfig.google.clientSecret,
      callbackURL: authConfig.google.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;
      
      // Google 프로필에서 사용자 정보 추출
      const googleUser = {
        googleId: id,
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        avatar: photos[0]?.value || null,
        emailVerified: emails[0].verified,
      };

      // 기존 사용자 찾거나 새로 생성
      const user = await this.authService.validateGoogleUser(googleUser);
      
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}