import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { Project } from '../../../database/entities/project.entity';
import { Task } from '../../../database/entities/task.entity';
import { AdminRole } from '../../../../shared/types/admin.types';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  // Dashboard Statistics
  async getDashboardStats() {
    const [
      totalUsers,
      totalProjects,
      totalTasks,
      activeUsersCount,
      completedTasksCount,
    ] = await Promise.all([
      this.userRepository.count(),
      this.projectRepository.count(),
      this.taskRepository.count(),
      this.userRepository.count({
        where: {
          lastActiveAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) as any, // 7일 이내
        },
      }),
      this.taskRepository.count({
        where: { status: 'COMPLETED' },
      }),
    ]);

    return {
      totalUsers,
      totalProjects,
      totalTasks,
      activeUsersCount,
      completedTasksCount,
      completionRate: totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0,
    };
  }

  // User Management
  async getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: AdminRole;
  }) {
    const { page = 1, limit = 20, search, role } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (role) {
      queryBuilder.andWhere('user.adminRole = :role', { role });
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['projects', 'tasks'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return user;
  }

  async updateUserAdminRole(userId: string, role: AdminRole, permissions: string[]) {
    const user = await this.getUserById(userId);

    user.adminRole = role;
    user.adminPermissions = permissions;

    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    
    if (user.isSuperAdmin()) {
      throw new BadRequestException('슈퍼 관리자는 삭제할 수 없습니다');
    }

    await this.userRepository.remove(user);
  }

  // Project Management
  async getAllProjects(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const { page = 1, limit = 20, search, status } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.members', 'members');

    if (search) {
      queryBuilder.andWhere(
        '(project.name ILIKE :search OR project.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    queryBuilder
      .orderBy('project.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [projects, total] = await queryBuilder.getManyAndCount();

    return {
      data: projects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProjectById(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'tasks'],
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다');
    }

    return project;
  }

  async deleteProject(id: string): Promise<void> {
    const project = await this.getProjectById(id);
    await this.projectRepository.remove(project);
  }

  // System Settings
  async getSystemSettings() {
    // 시스템 설정은 추후 별도 엔티티로 관리할 예정
    return {
      maintenanceMode: false,
      registrationEnabled: true,
      maxUsersPerProject: 50,
      maxProjectsPerUser: 10,
      emailNotifications: true,
    };
  }

  async updateSystemSettings(settings: Record<string, any>) {
    // 시스템 설정 업데이트 로직
    return settings;
  }
}