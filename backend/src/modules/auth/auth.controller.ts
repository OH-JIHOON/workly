import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import {
  LoginDto,
  RegisterDto,
  GoogleAuthDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from './dto/auth.dto';
import {
  AuthResponse,
  LoginResponse,
} from '@workly/shared';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 1분에 5번 시도 제한
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 429,
    description: '너무 많은 로그인 시도',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 1시간에 3번 가입 제한
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일',
  })
  @ApiResponse({
    status: 429,
    description: '너무 많은 가입 시도',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth 로그인 시작' })
  @ApiResponse({
    status: 302,
    description: 'Google OAuth 페이지로 리다이렉트',
  })
  async googleAuth(@Req() req: Request) {
    // Google OAuth 시작 - Passport가 처리
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth 콜백' })
  @ApiResponse({
    status: 200,
    description: 'Google 로그인 성공',
  })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as User;
      
      // DB에서 최신 사용자 정보를 다시 조회하여 adminRole을 포함시킴
      const freshUser = await this.authService.validateUserById(user.id);
      if (!freshUser) {
        throw new Error('User not found after Google auth');
      }

      // JWT 토큰 생성
      const tokens = await this.authService.generateTokensForUser(freshUser);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?` +
        `status=success&` +
        `accessToken=${encodeURIComponent(tokens.accessToken)}&` +
        `refreshToken=${encodeURIComponent(tokens.refreshToken)}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?status=error&message=${encodeURIComponent('로그인 중 오류가 발생했습니다.')}`;
      
      res.redirect(redirectUrl);
    }
  }

  @Public()
  @Post('google/login')
  @ApiOperation({ summary: 'Google OAuth 토큰으로 로그인' })
  @ApiBody({ type: GoogleAuthDto })
  @ApiResponse({
    status: 200,
    description: 'Google 로그인 성공',
  })
  async googleLogin(@Body() googleAuthDto: GoogleAuthDto): Promise<LoginResponse> {
    return this.authService.googleLogin(googleAuthDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 새로고침' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: '토큰 새로고침 성공',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: '비밀번호 변경 성공',
  })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<AuthResponse> {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 재설정 요청' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: '비밀번호 재설정 이메일 발송',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<AuthResponse> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: '비밀번호 재설정' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: '비밀번호 재설정 성공',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<AuthResponse> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: '이메일 인증' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 200,
    description: '이메일 인증 성공',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<AuthResponse> {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '인증 이메일 재발송' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse({
    status: 200,
    description: '인증 이메일 재발송 완료',
  })
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto): Promise<AuthResponse> {
    return this.authService.resendVerification(resendVerificationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '현재 사용자 프로필 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 프로필 조회 성공',
  })
  async getProfile(@CurrentUser() user: User) {
    return {
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
  })
  async logout(@CurrentUser() user: User): Promise<AuthResponse> {
    // TODO: 리프레시 토큰 무효화 로직 구현
    return {
      message: '로그아웃되었습니다.',
    };
  }
}