import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Task } from '../../database/entities/task.entity';
import { TaskLabel } from '../../database/entities/task-label.entity';
import { TaskDependency } from '../../database/entities/task-dependency.entity';
import { User } from '../../database/entities/user.entity';
import { Project } from '../../database/entities/project.entity';
// import { WebSocketGateway as WSGateway } from '../websocket/websocket.gateway';
import { 
  CreateTaskDto, 
  UpdateTaskDto, 
  TaskQueryDto,
  CreateTaskLabelDto,
  UpdateTaskLabelDto,
  UpdateTaskDetailDto
} from './dto/task.dto';
import { 
  TaskStatus, 
  Priority, 
  TaskType,
  PaginatedResponse 
} from '@workly/shared';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskLabel)
    private taskLabelRepository: Repository<TaskLabel>,
    @InjectRepository(TaskDependency)
    private taskDependencyRepository: Repository<TaskDependency>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    // @Inject(forwardRef(() => WSGateway))
    // private webSocketGateway: WSGateway,
  ) {}

  // 태스크 생성
  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const {
      title,
      description,
      projectId,
      goalId,
      assigneeId,
      parentTaskId,
      priority = 'medium',
      type = 'task',
      dueDate,
      startDate,
      estimatedHours,
      tags = [],
      labelIds = [],
      customFields = {},
    } = createTaskDto;

    // 프로젝트 존재 및 권한 확인
    if (projectId) {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['members'],
      });

      if (!project) {
        throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
      }

      // 프로젝트 멤버인지 확인
      const isMember = project.members.some(member => member.userId === userId);
      if (!isMember && project.ownerId !== userId) {
        throw new ForbiddenException('해당 프로젝트에 태스크를 생성할 권한이 없습니다.');
      }
    }

    // 부모 태스크 확인
    let parentTask: Task | null = null;
    if (parentTaskId) {
      parentTask = await this.taskRepository.findOne({
        where: { id: parentTaskId },
        relations: ['project'],
      });

      if (!parentTask) {
        throw new NotFoundException('부모 태스크를 찾을 수 없습니다.');
      }

      // 부모 태스크와 같은 프로젝트인지 확인
      if (projectId && parentTask.projectId !== projectId) {
        throw new BadRequestException('부모 태스크와 같은 프로젝트에 속해야 합니다.');
      }
    }

    // 레이블 확인
    let labels: TaskLabel[] = [];
    if (labelIds.length > 0) {
      labels = await this.taskLabelRepository.findBy({
        id: In(labelIds),
      });

      if (labels.length !== labelIds.length) {
        throw new BadRequestException('존재하지 않는 레이블이 포함되어 있습니다.');
      }
    }

    // 태스크 생성
    const task = this.taskRepository.create({
      title,
      description,
      status: 'todo',
      priority,
      type,
      dueDate: dueDate ? new Date(dueDate) : null,
      startDate: startDate ? new Date(startDate) : null,
      projectId,
      goalId,
      assigneeId: assigneeId || userId,
      reporterId: userId,
      parentTaskId,
      estimatedHours,
      tags,
      customFields,
      labels,
    } as any);

    const savedTask = await this.taskRepository.save(task) as unknown as Task;

    // 관계 포함하여 반환
    const newTask = await this.taskRepository.findOne({
      where: { id: savedTask.id },
      relations: [
        'project',
        'assignee',
        'reporter',
        'parentTask',
        'subtasks',
        'labels',
        'comments',
        'dependencies',
        'dependents',
        'watchers',
        'timeEntries'
      ],
    });

    // 실시간 알림 전송
    if (newTask && newTask.projectId) {
      // this.webSocketGateway.broadcastProjectUpdate(
      //   newTask.projectId,
      //   { type: 'task:created', task: newTask },
      //   userId
      // );
    }

    return newTask!;
  }

  // 태스크 목록 조회 (필터링, 정렬, 페이징)
  async findAll(queryDto: TaskQueryDto, userId: string): Promise<PaginatedResponse<Task>> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        type,
        projectId,
        goalId,
        assigneeId,
        reporterId,
        dueDate,
        search,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        includeSubtasks = false,
        labelIds,
        tags,
      } = queryDto;

      const queryBuilder = this.taskRepository.createQueryBuilder('task')
        .leftJoinAndSelect('task.assignee', 'assignee')
        .leftJoinAndSelect('task.reporter', 'reporter');

      // 간소화된 권한 필터링: 할당된 태스크 또는 생성한 태스크만
      queryBuilder.where(`(
        task.assigneeId = :userId OR 
        task.reporterId = :userId
      )`, { userId });

      // 상태 필터
      if (status) {
        queryBuilder.andWhere('task.status = :status', { status });
      }

      // 우선순위 필터
      if (priority) {
        queryBuilder.andWhere('task.priority = :priority', { priority });
      }

      // 타입 필터
      if (type) {
        queryBuilder.andWhere('task.type = :type', { type });
      }

      // 프로젝트 필터
      if (projectId) {
        queryBuilder.andWhere('task.projectId = :projectId', { projectId });
      }

      // 목표 필터
      if (goalId) {
        queryBuilder.andWhere('task.goalId = :goalId', { goalId });
      }

      // 담당자 필터
      if (assigneeId) {
        queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId });
      }

      // 생성자 필터
      if (reporterId) {
        queryBuilder.andWhere('task.reporterId = :reporterId', { reporterId });
      }

      // 마감일 필터
      if (dueDate) {
        const targetDate = new Date(dueDate);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        queryBuilder.andWhere('task.dueDate >= :startDate AND task.dueDate < :endDate', {
          startDate: targetDate,
          endDate: nextDay,
        });
      }

      // 검색 필터
      if (search) {
        queryBuilder.andWhere(`(
          task.title ILIKE :search OR 
          task.description ILIKE :search
        )`, { search: `%${search}%` });
      }

      // 태그 필터 (간소화)
      if (tags && tags.length > 0) {
        queryBuilder.andWhere('task.tags && :tags', { tags });
      }

      // 서브태스크 제외 (기본값)
      if (!includeSubtasks) {
        queryBuilder.andWhere('task.parentTaskId IS NULL');
      }

      // 정렬
      const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'priority', 'dueDate', 'status'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
      queryBuilder.orderBy(`task.${sortField}`, sortOrder as 'ASC' | 'DESC');

      // 페이징
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);

      // 실행
      const [items, total] = await queryBuilder.getManyAndCount();

      return {
        success: true,
        data: items,
        items,
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
    } catch (error) {
      console.error('Tasks findAll error:', error);
      throw error;
    }
  }

  // 특정 태스크 조회
  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: [
        'project',
        'assignee',
        'reporter',
        'parentTask',
        'subtasks',
        'labels',
        'comments',
        'comments.author',
        'dependencies',
        'dependencies.dependsOnTask',
        'dependents',
        'dependents.dependentTask',
        'watchers',
        'timeEntries',
        'timeEntries.user'
      ],
    });

    if (!task) {
      throw new NotFoundException('태스크를 찾을 수 없습니다.');
    }

    // 권한 확인
    await this.checkTaskAccess(task, userId);

    return task;
  }

  // 태스크 수정
  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    // 수정 권한 확인 (담당자, 생성자, 프로젝트 소유자만 수정 가능)
    if (task.assigneeId !== userId && task.reporterId !== userId && 
        task.project?.ownerId !== userId) {
      throw new ForbiddenException('태스크를 수정할 권한이 없습니다.');
    }

    const {
      title,
      description,
      status,
      priority,
      type,
      dueDate,
      startDate,
      estimatedHours,
      progress,
      tags,
      customFields,
      labelIds,
    } = updateTaskDto;

    // 업데이트할 필드들
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) {
      task.status = status;
      // 완료 상태 변경 시 완료 시간 설정
      if (status === TaskStatus.COMPLETED && !task.completedAt) {
        task.completedAt = new Date();
      } else if (status !== TaskStatus.COMPLETED) {
        task.completedAt = undefined;
      }
    }
    if (priority !== undefined) task.priority = priority;
    if (type !== undefined) task.type = type;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (startDate !== undefined) task.startDate = startDate ? new Date(startDate) : undefined;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (progress !== undefined) task.progress = Math.max(0, Math.min(100, progress));
    if (tags !== undefined) task.tags = tags;
    if (customFields !== undefined) task.customFields = { ...task.customFields, ...customFields };

    // 레이블 업데이트
    if (labelIds !== undefined) {
      const labels = await this.taskLabelRepository.findBy({
        id: In(labelIds),
      });
      task.labels = labels;
    }

    const updatedTask = await this.taskRepository.save(task);
    const finalTask = await this.findOne(updatedTask.id, userId);

    // 실시간 업데이트 알림
    // this.webSocketGateway.broadcastTaskUpdate(
    //   finalTask.id,
    //   { type: 'task:updated', task: finalTask },
    //   userId
    // );

    // 프로젝트 룸에도 알림
    // if (finalTask.projectId) {
    //   this.webSocketGateway.broadcastProjectUpdate(
    //     finalTask.projectId,
    //     { type: 'task:updated', task: finalTask },
    //     userId
    //   );
    // }

    return finalTask;
  }

  // 태스크 상세 정보 업데이트 (마크다운, 체크리스트, 관계, 위키 레퍼런스, 시간 관리)
  async updateTaskDetail(id: string, updateTaskDetailDto: UpdateTaskDetailDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    // 수정 권한 확인
    if (task.assigneeId !== userId && task.reporterId !== userId && 
        task.project?.ownerId !== userId) {
      throw new ForbiddenException('태스크를 수정할 권한이 없습니다.');
    }

    const {
      descriptionMarkdown,
      checklist,
      relationships,
      wikiReferences,
      estimatedTimeMinutes,
      loggedTimeMinutes,
      ...basicFields
    } = updateTaskDetailDto;

    // 기본 필드 업데이트 (기존 update 메서드 로직 재사용)
    Object.assign(task, basicFields);

    // 새로운 상세 필드들 업데이트
    if (descriptionMarkdown !== undefined) {
      task.descriptionMarkdown = descriptionMarkdown;
    }

    if (checklist !== undefined) {
      // 체크리스트 아이템들의 ID가 없으면 생성
      task.checklist = checklist.map((item, index) => ({
        id: item.id || `checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: item.text,
        completed: item.completed,
        order: item.order !== undefined ? item.order : index
      }));
    }

    if (relationships !== undefined) {
      // 관계들의 ID가 없으면 생성
      task.relationships = relationships.map(rel => ({
        id: rel.id || `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        targetTaskId: rel.targetTaskId,
        type: rel.type
      }));
    }

    if (wikiReferences !== undefined) {
      // 위키 레퍼런스들의 ID가 없으면 생성
      task.wikiReferences = wikiReferences.map(wiki => ({
        id: wiki.id || `wiki-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: wiki.title,
        url: wiki.url,
        description: wiki.description
      }));
    }

    if (estimatedTimeMinutes !== undefined) {
      task.estimatedTimeMinutes = estimatedTimeMinutes;
    }

    if (loggedTimeMinutes !== undefined) {
      task.loggedTimeMinutes = loggedTimeMinutes;
    }

    // 상태 관련 로직 (기존과 동일)
    if (updateTaskDetailDto.status !== undefined) {
      task.status = updateTaskDetailDto.status;
      if (updateTaskDetailDto.status === TaskStatus.COMPLETED && !task.completedAt) {
        task.completedAt = new Date();
      } else if (updateTaskDetailDto.status !== TaskStatus.COMPLETED) {
        task.completedAt = undefined;
      }
    }

    // 레이블 업데이트 (기존과 동일)
    if (updateTaskDetailDto.labelIds !== undefined) {
      const labels = await this.taskLabelRepository.findBy({
        id: In(updateTaskDetailDto.labelIds),
      });
      task.labels = labels;
    }

    const updatedTask = await this.taskRepository.save(task);
    const finalTask = await this.findOne(updatedTask.id, userId);

    return finalTask;
  }

  // 태스크 삭제
  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);

    // 삭제 권한 확인 (생성자, 프로젝트 소유자만 삭제 가능)
    if (task.reporterId !== userId && task.project?.ownerId !== userId) {
      throw new ForbiddenException('태스크를 삭제할 권한이 없습니다.');
    }

    // 의존성이 있는 태스크는 삭제 불가
    if (task.dependents && task.dependents.length > 0) {
      throw new BadRequestException('다른 태스크가 의존하고 있는 태스크는 삭제할 수 없습니다.');
    }

    await this.taskRepository.remove(task);
  }

  // 태스크 상태 변경
  async updateStatus(id: string, status: TaskStatus, userId: string): Promise<Task> {
    return this.update(id, { status }, userId);
  }

  // 태스크 우선순위 변경
  async updatePriority(id: string, priority: Priority, userId: string): Promise<Task> {
    return this.update(id, { priority }, userId);
  }

  // 태스크 진행률 업데이트
  async updateProgress(id: string, progress: number, userId: string): Promise<Task> {
    return this.update(id, { progress }, userId);
  }

  // 내 태스크 조회 (GTD 방식)
  async getMyTasks(userId: string, context?: 'inbox' | 'next' | 'waiting' | 'someday'): Promise<Task[]> {
    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.labels', 'labels')
      .where('task.assigneeId = :userId', { userId })
      .andWhere('task.status != :doneStatus', { doneStatus: 'done' });

    switch (context) {
      case 'inbox':
        // 아직 분류되지 않은 태스크들
        queryBuilder.andWhere('task.status = :todoStatus', { todoStatus: 'todo' })
          .andWhere('task.startDate IS NULL OR task.startDate <= :now', { now: new Date() });
        break;
      
      case 'next':
        // 다음에 처리할 액션 아이템들
        queryBuilder.andWhere('task.status IN (:...nextStatuses)', { 
          nextStatuses: ['todo', 'in_progress'] 
        })
          .andWhere('(task.startDate IS NULL OR task.startDate <= :now)', { now: new Date() })
          .andWhere('task.priority IN (:...priorities)', { priorities: ['high', 'medium'] });
        break;
      
      case 'waiting':
        // 다른 사람이나 외부 요인을 기다리는 태스크들
        queryBuilder.andWhere('task.status = :waitingStatus', { waitingStatus: 'blocked' });
        break;
      
      case 'someday':
        // 언젠가 할 일들 (낮은 우선순위)
        queryBuilder.andWhere('task.priority = :lowPriority', { lowPriority: 'low' })
          .andWhere('(task.dueDate IS NULL OR task.dueDate > :futureDate)', { 
            futureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30일 후
          });
        break;
    }

    return queryBuilder
      .orderBy('task.priority', 'DESC')
      .addOrderBy('task.dueDate', 'ASC')
      .addOrderBy('task.createdAt', 'ASC')
      .getMany();
  }

  // GTD 스마트 필터 기반 태스크 조회
  async getSmartFilteredTasks(userId: string, filter: 'today' | 'completed' | 'all'): Promise<Task[]> {
    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.reporter', 'reporter')
      .leftJoinAndSelect('task.labels', 'labels')
      .where(`(
        task.assigneeId = :userId OR 
        task.reporterId = :userId OR 
        project.ownerId = :userId OR
        EXISTS (
          SELECT 1 FROM project_members pm 
          WHERE pm.projectId = task.projectId AND pm.userId = :userId
        )
      )`, { userId });

    switch (filter) {
      case 'today':
        // 오늘 할 일: 오늘 마감이거나 연체된 미완료 태스크들
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        
        queryBuilder.andWhere('task.status != :completedStatus', { completedStatus: 'done' })
          .andWhere(`(
            (task.dueDate IS NOT NULL AND task.dueDate <= :today) OR
            (task.dueDate IS NULL AND task.status = :inProgressStatus) OR
            (task.priority = :highPriority AND task.status = :todoStatus)
          )`, { 
            today, 
            inProgressStatus: 'in_progress',
            highPriority: 'high',
            todoStatus: 'todo'
          });
        break;
      
      case 'completed':
        // 완료된 태스크들
        queryBuilder.andWhere('task.status = :completedStatus', { completedStatus: 'done' })
          .orderBy('task.completedAt', 'DESC');
        break;
      
      case 'all':
        // 모든 태스크들 (기본 정렬)
        break;
    }

    // 기본 정렬: 우선순위 > 마감일 > 생성일
    if (filter !== 'completed') {
      queryBuilder
        .orderBy('task.priority', 'DESC')
        .addOrderBy('task.dueDate', 'ASC')
        .addOrderBy('task.createdAt', 'ASC');
    }

    return queryBuilder.getMany();
  }

  // 권한 확인 헬퍼 메서드
  private async checkTaskAccess(task: Task, userId: string): Promise<void> {
    const hasAccess = (
      task.assigneeId === userId ||
      task.reporterId === userId ||
      task.project?.ownerId === userId ||
      (task.project && task.projectId && await this.isProjectMember(task.projectId, userId))
    );

    if (!hasAccess) {
      throw new ForbiddenException('태스크에 접근할 권한이 없습니다.');
    }
  }

  // 프로젝트 멤버인지 확인
  private async isProjectMember(projectId: string, userId: string): Promise<boolean> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['members'],
    });

    return project?.members.some(member => member.userId === userId) || false;
  }
}