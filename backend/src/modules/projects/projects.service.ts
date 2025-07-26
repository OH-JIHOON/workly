import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Project } from '../../database/entities/project.entity';
import { ProjectMember } from '../../database/entities/project-member.entity';
import { User } from '../../database/entities/user.entity';
import { 
  CreateProjectDto, 
  UpdateProjectDto, 
  ProjectQueryDto,
  AddProjectMemberDto 
} from './dto/project.dto';
import { 
  ProjectStatus, 
  ProjectPriority, 
  ProjectVisibility,
  ProjectMemberRole,
  PaginatedResponse,
  TaskStatus,
  ProjectPermission
} from '@workly/shared';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 프로젝트 생성
  async create(createProjectDto: CreateProjectDto, ownerId: string): Promise<Project> {
    const {
      title,
      description,
      priority = 'medium',
      startDate,
      endDate,
      budget,
      currency,
      tags = [],
      color,
      icon,
      visibility = 'private',
      settings = {},
    } = createProjectDto;

    // 시작일과 종료일 유효성 검사
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        throw new BadRequestException('종료일은 시작일보다 늦어야 합니다.');
      }
    }

    // 프로젝트 생성
    const project = this.projectRepository.create({
      title,
      description,
      ownerId,
      status: ProjectStatus.ACTIVE,
      priority: priority as ProjectPriority,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      budget,
      currency,
      tags,
      color,
      icon,
      visibility: visibility as ProjectVisibility,
      settings: {
        enableTimeTracking: true,
        enableComments: true,
        enableFileAttachments: true,
        workflowStages: ['planning', 'in_progress', 'review', 'done'],
        ...settings,
      },
    } as any);

    const savedProject = await this.projectRepository.save(project) as unknown as Project;

    // 프로젝트 소유자를 관리자 멤버로 추가
    const ownerMember = this.projectMemberRepository.create({
      projectId: savedProject.id,
      userId: ownerId,
      role: ProjectMemberRole.OWNER,
      permissions: [
        'read', 'write', 'delete', 
        'manage_members', 'manage_settings', 
        'manage_tasks', 'manage_files'
      ],
    } as any);

    await this.projectMemberRepository.save(ownerMember);

    // 관계 포함하여 반환
    return this.projectRepository.findOne({
      where: { id: savedProject.id },
      relations: ['members', 'members.user', 'tasks'],
    }) as Promise<Project>;
  }

  // 프로젝트 목록 조회
  async findAll(queryDto: ProjectQueryDto, userId: string): Promise<PaginatedResponse<Project>> {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      visibility,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      includeArchived = false,
      tags,
    } = queryDto;

    const queryBuilder = this.projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('members.user', 'user')
      .leftJoinAndSelect('project.tasks', 'tasks');

    // 권한 필터링: 소유자이거나 멤버인 프로젝트만
    queryBuilder.where(`(
      project.ownerId = :userId OR 
      EXISTS (
        SELECT 1 FROM project_members pm 
        WHERE pm.projectId = project.id AND pm.userId = :userId
      )
    )`, { userId });

    // 상태 필터
    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    // 우선순위 필터
    if (priority) {
      queryBuilder.andWhere('project.priority = :priority', { priority });
    }

    // 가시성 필터
    if (visibility) {
      queryBuilder.andWhere('project.visibility = :visibility', { visibility });
    }

    // 아카이브 필터
    if (!includeArchived) {
      queryBuilder.andWhere('project.isArchived = false');
    }

    // 검색 필터
    if (search) {
      queryBuilder.andWhere(`(
        project.title ILIKE :search OR 
        project.description ILIKE :search OR
        array_to_string(project.tags, ' ') ILIKE :search
      )`, { search: `%${search}%` });
    }

    // 태그 필터
    if (tags && tags.length > 0) {
      queryBuilder.andWhere('project.tags && :tags', { tags });
    }

    // 정렬
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'priority', 'startDate', 'endDate'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`project.${sortField}`, sortOrder as 'ASC' | 'DESC');

    // 페이징
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // 실행
    const [items, total] = await queryBuilder.getManyAndCount();

    // 각 프로젝트의 진행률 계산
    const itemsWithProgress = items.map(project => {
      const progress = this.calculateProjectProgress(project);
      return { ...project, progress };
    });

    return {
      success: true,
      data: itemsWithProgress as any,
      items: itemsWithProgress as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 특정 프로젝트 조회
  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: [
        'members', 
        'members.user', 
        'tasks', 
        'tasks.assignee',
        'tasks.labels'
      ],
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    // 권한 확인
    await this.checkProjectAccess(project, userId);

    // 진행률 계산
    const progress = this.calculateProjectProgress(project);
    
    return { ...project, progress } as any;
  }

  // 프로젝트 수정
  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.findOne(id, userId);

    // 수정 권한 확인 (소유자 또는 관리자만)
    await this.checkProjectManagePermission(project, userId);

    const {
      title,
      description,
      status,
      priority,
      startDate,
      endDate,
      budget,
      currency,
      tags,
      color,
      icon,
      visibility,
      settings,
    } = updateProjectDto;

    // 시작일과 종료일 유효성 검사
    const newStartDate = startDate ? new Date(startDate) : project.startDate;
    const newEndDate = endDate ? new Date(endDate) : project.endDate;

    if (newStartDate && newEndDate && newStartDate >= newEndDate) {
      throw new BadRequestException('종료일은 시작일보다 늦어야 합니다.');
    }

    // 업데이트할 필드들
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (priority !== undefined) project.priority = priority;
    if (startDate !== undefined) project.startDate = newStartDate;
    if (endDate !== undefined) project.endDate = newEndDate;
    if (budget !== undefined) project.budget = budget;
    if (currency !== undefined) project.currency = currency;
    if (tags !== undefined) project.tags = tags;
    if (color !== undefined) project.color = color;
    if (icon !== undefined) project.icon = icon;
    if (visibility !== undefined) project.visibility = visibility;
    if (settings !== undefined) {
      project.settings = { ...project.settings, ...settings };
    }

    const updatedProject = await this.projectRepository.save(project);
    return this.findOne(updatedProject.id, userId);
  }

  // 프로젝트 삭제 (아카이브)
  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id, userId);

    // 삭제 권한 확인 (소유자만)
    if (project.ownerId !== userId) {
      throw new ForbiddenException('프로젝트를 삭제할 권한이 없습니다.');
    }

    // 소프트 삭제 (아카이브)
    project.isArchived = true;
    await this.projectRepository.save(project);
  }

  // 프로젝트 멤버 추가
  async addMember(projectId: string, addMemberDto: AddProjectMemberDto, userId: string): Promise<ProjectMember> {
    const { userId: newMemberId, role = 'member', permissions = [] } = addMemberDto;

    const project = await this.findOne(projectId, userId);

    // 멤버 관리 권한 확인
    await this.checkProjectManagePermission(project, userId);

    // 새 멤버 사용자 확인
    const newMember = await this.userRepository.findOne({
      where: { id: newMemberId },
    });

    if (!newMember) {
      throw new NotFoundException('추가할 사용자를 찾을 수 없습니다.');
    }

    // 이미 멤버인지 확인
    const existingMember = await this.projectMemberRepository.findOne({
      where: { projectId, userId: newMemberId },
    });

    if (existingMember) {
      throw new BadRequestException('이미 프로젝트 멤버입니다.');
    }

    // 기본 권한 설정
    const defaultPermissions = this.getDefaultPermissions(role as ProjectMemberRole);
    const finalPermissions = permissions.length > 0 ? permissions : defaultPermissions;

    // 멤버 추가
    const projectMember = this.projectMemberRepository.create({
      projectId,
      userId: newMemberId,
      role,
      permissions: finalPermissions,
    } as any);

    return this.projectMemberRepository.save(projectMember) as unknown as Promise<ProjectMember>;
  }

  // 프로젝트 멤버 목록 조회
  async getMembers(projectId: string, userId: string): Promise<ProjectMember[]> {
    const project = await this.findOne(projectId, userId);

    // 프로젝트 접근 권한 확인
    await this.checkProjectAccess(project, userId);

    const members = await this.projectMemberRepository.find({
      where: { projectId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });

    return members;
  }

  // 프로젝트 멤버 제거
  async removeMember(projectId: string, memberId: string, userId: string): Promise<void> {
    const project = await this.findOne(projectId, userId);

    // 멤버 관리 권한 확인
    await this.checkProjectManagePermission(project, userId);

    // 프로젝트 소유자는 제거할 수 없음
    if (project.ownerId === memberId) {
      throw new BadRequestException('프로젝트 소유자는 제거할 수 없습니다.');
    }

    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId: memberId },
    });

    if (!member) {
      throw new NotFoundException('프로젝트 멤버를 찾을 수 없습니다.');
    }

    await this.projectMemberRepository.remove(member);
  }

  // 프로젝트 상태 변경
  async updateStatus(id: string, status: ProjectStatus, userId: string): Promise<Project> {
    return this.update(id, { status }, userId);
  }

  // 내 프로젝트 조회
  async getMyProjects(userId: string): Promise<Project[]> {
    const projects = await this.projectRepository.find({
      where: [
        { ownerId: userId },
        { members: { userId } }
      ],
      relations: ['members', 'members.user', 'tasks'],
      order: { updatedAt: 'DESC' },
    });

    return projects.map(project => ({
      ...project,
      progress: this.calculateProjectProgress(project),
    })) as any;
  }

  // 프로젝트 진행률 계산
  private calculateProjectProgress(project: Project): number {
    if (!project.tasks || project.tasks.length === 0) {
      return 0;
    }

    const completedTasks = project.tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  }

  // 프로젝트 접근 권한 확인
  private async checkProjectAccess(project: Project, userId: string): Promise<void> {
    const hasAccess = (
      project.ownerId === userId ||
      project.members?.some(member => member.userId === userId) ||
      project.visibility === 'public'
    );

    if (!hasAccess) {
      throw new ForbiddenException('프로젝트에 접근할 권한이 없습니다.');
    }
  }

  // 프로젝트 관리 권한 확인
  private async checkProjectManagePermission(project: Project, userId: string): Promise<void> {
    if (project.ownerId === userId) {
      return; // 소유자는 모든 권한
    }

    const member = project.members?.find(m => m.userId === userId);
    if (!member || (member.role !== 'admin' && !member.permissions.includes(ProjectPermission.MANAGE_MEMBERS))) {
      throw new ForbiddenException('프로젝트 관리 권한이 없습니다.');
    }
  }

  // 역할별 기본 권한 반환
  private getDefaultPermissions(role: ProjectMemberRole): string[] {
    switch (role) {
      case 'admin':
        return [
          'read', 'write', 'delete', 
          'manage_members', 'manage_settings', 
          'manage_tasks', 'manage_files'
        ];
      case 'member':
        return ['read', 'write', 'manage_tasks'];
      case 'viewer':
        return ['read'];
      default:
        return ['read'];
    }
  }
}