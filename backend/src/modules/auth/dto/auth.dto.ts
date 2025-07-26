import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    description: '사용자 비밀번호',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  @ApiProperty({
    description: '로그인 유지 여부',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}

export class RegisterDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    description: '사용자 비밀번호',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.',
    }
  )
  password: string;

  @ApiProperty({
    description: '사용자 이름 (성)',
    example: '홍',
  })
  @IsString()
  @MinLength(1, { message: '성은 필수입니다.' })
  @MaxLength(50, { message: '성은 50자를 초과할 수 없습니다.' })
  firstName: string;

  @ApiProperty({
    description: '사용자 이름 (이름)',
    example: '길동',
  })
  @IsString()
  @MinLength(1, { message: '이름은 필수입니다.' })
  @MaxLength(50, { message: '이름은 50자를 초과할 수 없습니다.' })
  lastName: string;

  @ApiProperty({
    description: '서비스 이용약관 동의',
    example: true,
  })
  @IsBoolean()
  agreeToTerms: boolean;

  @ApiProperty({
    description: '개인정보 처리방침 동의',
    example: true,
  })
  @IsBoolean()
  agreeToPrivacy: boolean;
}

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google OAuth 인증 코드',
    example: 'google_auth_code_here',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'OAuth 리다이렉트 URI',
    example: 'http://localhost:3000/auth/google/callback',
  })
  @IsString()
  redirectUri: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: '리프레시 토큰',
    example: 'refresh_token_here',
  })
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: '현재 비밀번호',
    example: 'current_password',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: '새 비밀번호',
    example: 'new_password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.',
    }
  )
  newPassword: string;

  @ApiProperty({
    description: '새 비밀번호 확인',
    example: 'new_password123',
  })
  @IsString()
  confirmPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: '비밀번호 재설정 토큰',
    example: 'reset_token_here',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: '새 비밀번호',
    example: 'new_password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.',
    }
  )
  newPassword: string;

  @ApiProperty({
    description: '새 비밀번호 확인',
    example: 'new_password123',
  })
  @IsString()
  confirmPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    description: '이메일 인증 토큰',
    example: 'verification_token_here',
  })
  @IsString()
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;
}