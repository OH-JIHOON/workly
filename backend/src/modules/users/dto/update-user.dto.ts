import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  IsUrl,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserProfile, UserPreferences } from '../../../shared/types/api.types';

export class UpdateUserDto {
  @ApiProperty({
    description: '사용자 이름 (성)',
    example: '홍',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '성은 50자를 초과할 수 없습니다.' })
  firstName?: string;

  @ApiProperty({
    description: '사용자 이름 (이름)',
    example: '길동',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '이름은 50자를 초과할 수 없습니다.' })
  lastName?: string;

  @ApiProperty({
    description: '이메일 주소',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email?: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: '올바른 URL 형식이 아닙니다.' })
  avatar?: string;

  @ApiProperty({
    description: '사용자 프로필 정보',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  profile?: Partial<UserProfile>;

  @ApiProperty({
    description: '사용자 환경설정',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  preferences?: Partial<UserPreferences>;
}