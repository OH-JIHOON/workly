import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('files')
@Index(['filename'])
@Index(['mimetype'])
@Index(['uploaderId'])
@Index(['createdAt'])
@Index(['entityType', 'entityId'])
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimetype: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column()
  path: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column()
  uploaderId: string;

  @Column({ nullable: true })
  entityType?: string; // 'task', 'project', 'user', 'post' 등

  @Column({ nullable: true })
  entityId?: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  isProcessed: boolean;

  @Column('simple-array', { default: [] })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 관계 설정
  @ManyToOne(() => User, { eager: true })
  uploader: User;

  // 파일 타입 확인 메서드들
  isImage(): boolean {
    return this.mimetype.startsWith('image/');
  }

  isVideo(): boolean {
    return this.mimetype.startsWith('video/');
  }

  isAudio(): boolean {
    return this.mimetype.startsWith('audio/');
  }

  isDocument(): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
    ];
    return documentTypes.includes(this.mimetype);
  }

  isArchive(): boolean {
    const archiveTypes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
    ];
    return archiveTypes.includes(this.mimetype);
  }

  isCode(): boolean {
    const codeTypes = [
      'text/javascript',
      'text/typescript',
      'text/html',
      'text/css',
      'application/json',
      'text/xml',
      'application/xml',
    ];
    return codeTypes.includes(this.mimetype) || 
           this.filename.match(/\.(js|ts|jsx|tsx|html|css|scss|sass|less|json|xml|yaml|yml|md|py|java|c|cpp|h|hpp|cs|php|rb|go|rs|swift|kt)$/i);
  }

  // 파일 크기를 읽기 쉬운 형태로 반환
  getSizeFormatted(): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = this.size;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // 파일 확장자 반환
  getExtension(): string {
    const lastDotIndex = this.filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? this.filename.substring(lastDotIndex + 1).toLowerCase() : '';
  }

  // 파일 타입 카테고리 반환
  getCategory(): string {
    if (this.isImage()) return 'image';
    if (this.isVideo()) return 'video';
    if (this.isAudio()) return 'audio';
    if (this.isDocument()) return 'document';
    if (this.isArchive()) return 'archive';
    if (this.isCode()) return 'code';
    return 'other';
  }

  // 썸네일이 필요한지 확인
  needsThumbnail(): boolean {
    return this.isImage() || this.isVideo() || this.isDocument();
  }

  // 미리보기 가능한지 확인
  isPreviewable(): boolean {
    return this.isImage() || 
           this.isCode() || 
           this.mimetype === 'text/plain' ||
           this.mimetype === 'application/pdf';
  }

  // 브라우저에서 직접 열 수 있는지 확인
  isViewableInBrowser(): boolean {
    const viewableTypes = [
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
    ];
    return viewableTypes.includes(this.mimetype);
  }

  // 다운로드 권한 확인
  canDownload(userId: string): boolean {
    if (this.isPublic) return true;
    return this.uploaderId === userId;
  }

  // 삭제 권한 확인
  canDelete(userId: string): boolean {
    return this.uploaderId === userId;
  }

  // 편집 권한 확인 (메타데이터만)
  canEdit(userId: string): boolean {
    return this.uploaderId === userId;
  }

  // 파일을 공개로 설정
  makePublic(): void {
    this.isPublic = true;
  }

  // 파일을 비공개로 설정
  makePrivate(): void {
    this.isPublic = false;
  }

  // 처리 완료 표시 (썸네일 생성 등)
  markAsProcessed(): void {
    this.isProcessed = true;
  }

  // 태그 추가
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  // 태그 제거
  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  // 엔티티에 연결
  attachTo(entityType: string, entityId: string): void {
    this.entityType = entityType;
    this.entityId = entityId;
  }

  // 엔티티에서 분리
  detach(): void {
    this.entityType = null;
    this.entityId = null;
  }

  // 연결된 엔티티 확인
  isAttachedTo(entityType: string, entityId: string): boolean {
    return this.entityType === entityType && this.entityId === entityId;
  }

  // 파일 유효성 검증
  validate(): string[] {
    const errors: string[] = [];

    if (!this.filename) {
      errors.push('Filename is required');
    }

    if (!this.originalName) {
      errors.push('Original name is required');
    }

    if (!this.mimetype) {
      errors.push('MIME type is required');
    }

    if (this.size <= 0) {
      errors.push('File size must be greater than 0');
    }

    // 파일 크기 제한 (예: 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (this.size > maxSize) {
      errors.push(`File size cannot exceed ${maxSize / (1024 * 1024)}MB`);
    }

    return errors;
  }
}