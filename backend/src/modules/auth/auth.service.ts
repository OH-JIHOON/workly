import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException,
  NotFoundException,
  BadRequestException 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../../database/entities/user.entity';
import { getAuthConfig } from '../../config/auth.config';
import { JwtPayload, RefreshTokenPayload } from '@workly/shared';
import { 
  LoginDto, 
  RegisterDto, 
  GoogleAuthDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto
} from './dto/auth.dto';
import { 
  AuthResponse, 
  LoginResponse, 
  UserRole, 
  UserStatus 
} from '@workly/shared';

@Injectable()
export class AuthService {
  private authConfig;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.authConfig = getAuthConfig(configService);
  }

  // 일반 로그인
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password, rememberMe } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'status', 'emailVerifiedAt'],
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('계정이 활성화되지 않았습니다.');
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('이메일 인증이 필요합니다.');
    }

    // 마지막 로그인 시간 업데이트
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    const tokens = await this.generateTokens(user, rememberMe);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // 회원가입
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, firstName, lastName, agreeToTerms, agreeToPrivacy } = registerDto;

    // 이메일 중복 확인
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 동의 확인
    if (!agreeToTerms || !agreeToPrivacy) {
      throw new BadRequestException('서비스 이용약관 및 개인정보 처리방침에 동의해야 합니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, this.authConfig.bcrypt.saltRounds);

    // 이메일 인증 토큰 생성
    const emailVerificationToken = uuidv4();

    // 사용자 생성
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      emailVerificationToken,
      profile: {
        firstName,
        lastName,
        timezone: 'Asia/Seoul',
        language: 'ko',
      },
      preferences: {
        theme: 'system',
        language: 'ko',
        timezone: 'Asia/Seoul',
        notifications: {
          email: true,
          push: true,
          desktop: true,
          taskAssigned: true,
          taskCompleted: true,
          taskDue: true,
          projectUpdates: true,
          mentions: true,
          weeklyDigest: true,
          dailyReminder: false,
        },
        workingHours: {
          enabled: true,
          startTime: '09:00',
          endTime: '18:00',
          timezone: 'Asia/Seoul',
          workingDays: [1, 2, 3, 4, 5],
          breakTime: {
            enabled: true,
            startTime: '12:00',
            endTime: '13:00',
          },
        },
        dashboard: {
          layout: 'grid',
          widgets: {
            myTasks: true,
            recentProjects: true,
            teamActivity: true,
            notifications: true,
            calendar: true,
            quickStats: true,
          },
          defaultView: 'dashboard',
        },
      },
    });

    const savedUser = await this.userRepository.save(user);

    // TODO: 이메일 인증 메일 발송
    // await this.emailService.sendVerificationEmail(savedUser.email, emailVerificationToken);

    return {
      message: '회원가입이 완료되었습니다. 이메일 인증을 완료해주세요.',
      user: this.sanitizeUser(savedUser),
    };
  }

  // Google OAuth 로그인
  async googleLogin(googleAuthDto: GoogleAuthDto): Promise<LoginResponse> {
    // TODO: Google OAuth 코드 검증 및 사용자 정보 가져오기
    // 현재는 기본 구현만 제공
    throw new BadRequestException('Google OAuth 기능은 아직 구현 중입니다.');
  }

  // Google 사용자 검증 (Passport Strategy에서 사용)
  async validateGoogleUser(googleUser: any): Promise<User> {
    const { googleId, email, firstName, lastName, avatar, emailVerified } = googleUser;

    // 기존 Google 사용자 찾기
    let user = await this.userRepository.findOne({
      where: { googleId },
    });

    if (user) {
      // 기존 사용자 정보 업데이트
      user.lastLoginAt = new Date();
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      return this.userRepository.save(user);
    }

    // 이메일로 기존 사용자 찾기
    user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      // 기존 사용자에 Google ID 연결
      user.googleId = googleId;
      user.lastLoginAt = new Date();
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      if (emailVerified && !user.emailVerifiedAt) {
        user.emailVerifiedAt = new Date();
        user.status = UserStatus.ACTIVE;
      }
      return this.userRepository.save(user);
    }

    // 새 사용자 생성
    const newUser = this.userRepository.create({
      email,
      name: `${firstName} ${lastName}`,
      googleId,
      firstName,
      lastName,
      avatar,
      password: '', // Google 사용자는 비밀번호 불필요
      status: emailVerified ? UserStatus.ACTIVE : UserStatus.PENDING_VERIFICATION,
      emailVerifiedAt: emailVerified ? new Date() : undefined,
      lastLoginAt: new Date(),
      profile: {
        firstName,
        lastName,
        timezone: 'Asia/Seoul',
        language: 'ko',
      },
      preferences: {
        theme: 'system',
        language: 'ko',
        timezone: 'Asia/Seoul',
        notifications: {
          email: true,
          push: true,
          desktop: true,
          taskAssigned: true,
          taskCompleted: true,
          taskDue: true,
          projectUpdates: true,
          mentions: true,
          weeklyDigest: true,
          dailyReminder: false,
        },
        workingHours: {
          enabled: true,
          startTime: '09:00',
          endTime: '18:00',
          timezone: 'Asia/Seoul',
          workingDays: [1, 2, 3, 4, 5],
          breakTime: {
            enabled: true,
            startTime: '12:00',
            endTime: '13:00',
          },
        },
        dashboard: {
          layout: 'grid',
          widgets: {
            myTasks: true,
            recentProjects: true,
            teamActivity: true,
            notifications: true,
            calendar: true,
            quickStats: true,
          },
          defaultView: 'dashboard',
        },
      },
    });

    return this.userRepository.save(newUser);
  }

  // JWT로 사용자 검증
  async validateUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  // 토큰 새로고침
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.authConfig.jwt.secret,
      }) as RefreshTokenPayload;

      const user = await this.validateUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.generateAccessToken(user);
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // 비밀번호 변경
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<AuthResponse> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('새 비밀번호가 일치하지 않습니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'password'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, this.authConfig.bcrypt.saltRounds);
    await this.userRepository.update(userId, {
      password: hashedNewPassword,
    });

    return {
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  }

  // 비밀번호 재설정 요청
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<AuthResponse> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // 보안상 이유로 사용자가 존재하지 않아도 성공 메시지 반환
      return {
        message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
      };
    }

    const resetToken = uuidv4();
    const resetExpiresAt = new Date();
    resetExpiresAt.setHours(resetExpiresAt.getHours() + 1); // 1시간 후 만료

    await this.userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpiresAt: resetExpiresAt,
    });

    // TODO: 비밀번호 재설정 이메일 발송
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
    };
  }

  // 비밀번호 재설정
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<AuthResponse> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('새 비밀번호가 일치하지 않습니다.');
    }

    const user = await this.userRepository.findOne({
      where: { 
        resetPasswordToken: token,
      },
    });

    if (!user || !user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
      throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.authConfig.bcrypt.saltRounds);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpiresAt: undefined,
    });

    return {
      message: '비밀번호가 성공적으로 재설정되었습니다.',
    };
  }

  // 이메일 인증
  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<AuthResponse> {
    const { token } = verifyEmailDto;

    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('유효하지 않은 인증 토큰입니다.');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('이미 인증된 이메일입니다.');
    }

    await this.userRepository.update(user.id, {
      emailVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
      emailVerificationToken: undefined,
    });

    return {
      message: '이메일 인증이 완료되었습니다.',
      user: this.sanitizeUser(user),
    };
  }

  // 인증 이메일 재발송
  async resendVerification(resendVerificationDto: ResendVerificationDto): Promise<AuthResponse> {
    const { email } = resendVerificationDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('이미 인증된 이메일입니다.');
    }

    const emailVerificationToken = uuidv4();
    await this.userRepository.update(user.id, {
      emailVerificationToken,
    });

    // TODO: 인증 이메일 재발송
    // await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);

    return {
      message: '인증 이메일이 재발송되었습니다.',
    };
  }

  // 외부에서 사용할 수 있는 토큰 생성 메서드
  async generateTokensForUser(user: User, rememberMe?: boolean): Promise<{ accessToken: string; refreshToken: string }> {
    return this.generateTokens(user, rememberMe);
  }

  // 토큰 생성
  private async generateTokens(user: User, rememberMe?: boolean): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, rememberMe);

    return {
      accessToken,
      refreshToken,
    };
  }

  // Access Token 생성
  private async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.authConfig.jwt.secret,
      expiresIn: this.authConfig.jwt.expiresIn,
    });
  }

  // Refresh Token 생성
  private async generateRefreshToken(user: User, rememberMe?: boolean): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      tokenId: uuidv4(),
    };

    const expiresIn = rememberMe 
      ? this.authConfig.jwt.refreshExpiresIn 
      : '7d'; // 기본 7일

    return this.jwtService.signAsync(payload, {
      secret: this.authConfig.jwt.secret,
      expiresIn,
    });
  }

  // 사용자 정보 정제 (민감한 정보 제거)
  private sanitizeUser(user: User): any {
    const { password, resetPasswordToken, emailVerificationToken, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}