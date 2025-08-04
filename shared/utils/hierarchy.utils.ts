/**
 * 워클리 계층구조 관리 유틸리티
 * 업무-프로젝트-목표 간의 관계를 관리하고 독립성을 지원
 */

import { 
  WorklyTask, 
  HierarchyType, 
  HierarchyChoice, 
  HierarchyValidation, 
  HierarchyAnalytics,
  TodayTasksOptimized,
  CPERStage
} from '../types/workly-core.types'
import { Goal } from '../types/goal.types'
import { Project } from '../types/api.types'

export class HierarchyManager {
  
  /**
   * 계층구조 경로 생성
   * 예: "워클리 플랫폼 완성 > MVP 개발" 또는 "독립적 업무"
   */
  static getHierarchyPath(
    task: WorklyTask, 
    project?: Project, 
    goal?: Goal
  ): string {
    switch (task.hierarchyType) {
      case HierarchyType.INDEPENDENT:
        return '독립적 업무'
        
      case HierarchyType.PROJECT_ONLY:
        return project ? project.title : '프로젝트 미확인'
        
      case HierarchyType.GOAL_DIRECT:
        return goal ? goal.title : '목표 미확인'
        
      case HierarchyType.FULL_HIERARCHY:
        const goalTitle = goal?.title || '목표 미확인'
        const projectTitle = project?.title || '프로젝트 미확인'
        return `${goalTitle} > ${projectTitle}`
        
      default:
        return '알 수 없음'
    }
  }

  /**
   * 계층구조 변경 가능 여부 확인
   */
  static canChangeHierarchy(
    task: WorklyTask, 
    newHierarchy: HierarchyChoice
  ): HierarchyValidation {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // 기본 검증
    if (task.cperWorkflow.stage === CPERStage.EXECUTING) {
      warnings.push('실행 중인 업무의 계층구조 변경은 신중하게 고려하세요.')
    }

    if (task.cperWorkflow.stage === CPERStage.COMPLETED) {
      errors.push('완료된 업무의 계층구조는 변경할 수 없습니다.')
    }

    // 순환 참조 검증 (프로젝트 -> 목표)
    if (newHierarchy.type === HierarchyType.FULL_HIERARCHY) {
      if (newHierarchy.projectId && newHierarchy.goalId) {
        // TODO: 실제로는 프로젝트가 해당 목표에 속하는지 확인 필요
        // if (!this.isProjectBelongsToGoal(newHierarchy.projectId, newHierarchy.goalId)) {
        //   errors.push('선택한 프로젝트가 해당 목표에 속하지 않습니다.')
        // }
      }
    }

    // 독립성 검증
    if (newHierarchy.type === HierarchyType.INDEPENDENT) {
      if (task.cperWorkflow.executionData?.isFocused) {
        warnings.push('집중 업무를 독립적으로 변경하면 프로젝트 진행에 영향을 줄 수 있습니다.')
      }
    }

    // 제안사항
    if (task.hierarchyType === HierarchyType.INDEPENDENT && 
        newHierarchy.type !== HierarchyType.INDEPENDENT) {
      suggestions.push('독립적 업무를 계층구조에 포함시키면 목표 달성을 더 체계적으로 추적할 수 있습니다.')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  /**
   * 계층구조 분석
   */
  static analyzeHierarchy(
    task: WorklyTask,
    project?: Project,
    goal?: Goal
  ): HierarchyAnalytics {
    const analysis: HierarchyAnalytics = {
      taskId: task.id,
      hierarchyType: task.hierarchyType,
      connections: {},
      impact: {
        independence: 0
      },
      recommendations: {}
    }

    // 연결 관계 분석
    if (project && task.projectId) {
      analysis.connections.projectConnection = {
        projectId: project.id,
        projectTitle: project.title,
        projectProgress: project.progress,
        contributionPercentage: this.calculateProjectContribution(task, project)
      }
    }

    if (goal) {
      const isDirectConnection = task.hierarchyType === HierarchyType.GOAL_DIRECT
      analysis.connections.goalConnection = {
        goalId: goal.id,
        goalTitle: goal.title,
        goalProgress: goal.progress,
        contributionPercentage: this.calculateGoalContribution(task, goal),
        isDirectConnection
      }
    }

    // 독립성 점수 계산
    analysis.impact.independence = this.calculateIndependenceScore(task)

    // 프로젝트/목표 영향도 계산
    if (analysis.connections.projectConnection) {
      analysis.impact.onProject = analysis.connections.projectConnection.contributionPercentage
    }
    if (analysis.connections.goalConnection) {
      analysis.impact.onGoal = analysis.connections.goalConnection.contributionPercentage
    }

    // 추천사항 생성
    analysis.recommendations = this.generateRecommendations(task, analysis)

    return analysis
  }

  /**
   * 프로젝트 기여도 계산
   */
  private static calculateProjectContribution(task: WorklyTask, project: Project): number {
    // 간단한 계산: 프로젝트 내 업무 수 대비 이 업무의 가중치
    // 실제로는 업무의 우선순위, 소요시간, 복잡도 등을 고려해야 함
    const baseContribution = 100 / (project.tasksCount || 1)
    
    // 우선순위에 따른 가중치
    const priorityWeight = this.getPriorityWeight(task.priority)
    
    // 예상 소요시간에 따른 가중치  
    const timeWeight = Math.min(task.estimatedMinutes / 480, 2) // 8시간 기준, 최대 2배
    
    return Math.min(baseContribution * priorityWeight * timeWeight, 100)
  }

  /**
   * 목표 기여도 계산
   */
  private static calculateGoalContribution(task: WorklyTask, goal: Goal): number {
    // 목표에 직접 연결된 업무인지, 프로젝트를 통해 간접 연결된 업무인지에 따라 다르게 계산
    const isDirectConnection = task.hierarchyType === HierarchyType.GOAL_DIRECT
    
    let baseContribution: number
    
    if (isDirectConnection) {
      // 직접 연결: 목표 내 직접 업무 수 대비
      baseContribution = 100 / Math.max(goal.projectCount * 3, 1) // 가정: 프로젝트당 평균 3개 업무
    } else {
      // 간접 연결: 프로젝트를 통한 기여
      baseContribution = 100 / Math.max(goal.projectCount * 10, 1) // 가정: 프로젝트당 평균 10개 업무
    }
    
    const priorityWeight = this.getPriorityWeight(task.priority)
    
    return Math.min(baseContribution * priorityWeight, 100)
  }

  /**
   * 독립성 점수 계산
   */
  private static calculateIndependenceScore(task: WorklyTask): number {
    switch (task.hierarchyType) {
      case HierarchyType.INDEPENDENT:
        return 100
      case HierarchyType.PROJECT_ONLY:
        return 30
      case HierarchyType.GOAL_DIRECT:
        return 20
      case HierarchyType.FULL_HIERARCHY:
        return 0
      default:
        return 50
    }
  }

  /**
   * 우선순위 가중치 계산
   */
  private static getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'urgent': return 2.0
      case 'high': return 1.5
      case 'medium': return 1.0
      case 'low': return 0.7
      default: return 1.0
    }
  }

  /**
   * 추천사항 생성
   */
  private static generateRecommendations(
    task: WorklyTask, 
    analysis: HierarchyAnalytics
  ): HierarchyAnalytics['recommendations'] {
    const recommendations: HierarchyAnalytics['recommendations'] = {}

    // 독립적 업무를 프로젝트로 이동 추천
    if (task.hierarchyType === HierarchyType.INDEPENDENT && 
        task.estimatedMinutes > 120) { // 2시간 이상 소요 예상
      recommendations.shouldMoveToProject = 
        '이 업무는 2시간 이상 소요가 예상되므로 프로젝트로 관리하는 것이 좋겠습니다.'
    }

    // 프로젝트 업무를 목표와 연결 추천
    if (task.hierarchyType === HierarchyType.PROJECT_ONLY &&
        task.priority === 'high') {
      recommendations.shouldConnectToGoal = 
        '중요한 업무이므로 상위 목표와 연결하여 목표 달성도를 추적해보세요.'
    }

    // 복잡한 계층을 단순화 추천
    if (task.hierarchyType === HierarchyType.FULL_HIERARCHY &&
        analysis.impact.independence > 80) {
      recommendations.shouldBecomeIndependent = 
        '이 업무는 독립적으로 수행 가능해 보이므로 단순화를 고려해보세요.'
    }

    return recommendations
  }

  /**
   * 오늘 할 일 최적화
   */
  static optimizeTodayTasks(
    tasks: WorklyTask[],
    projects: Project[] = [],
    goals: Goal[] = []
  ): TodayTasksOptimized {
    const todayTasks = tasks.filter(task => 
      task.isToday && 
      task.cperWorkflow.stage === CPERStage.EXECUTING
    )

    // 우선순위별 분류
    const focusedTasks = todayTasks.filter(task => task.isFocused)
    const urgentTasks = todayTasks.filter(task => 
      task.priority === 'urgent' && !task.isFocused
    )
    const readyToStartTasks = todayTasks.filter(task => 
      task.nextAction && task.nextAction.trim().length > 0
    )
    const remainingTasks = todayTasks.filter(task => 
      !task.isFocused && 
      task.priority !== 'urgent' && 
      (!task.nextAction || task.nextAction.trim().length === 0)
    )

    // 계층구조별 그룹화
    const independent = todayTasks.filter(task => 
      task.hierarchyType === HierarchyType.INDEPENDENT
    )

    const byProject = this.groupTasksByProject(todayTasks, projects)
    const byGoal = this.groupTasksByGoal(todayTasks, projects, goals)

    // 시간 분석
    const totalEstimatedMinutes = todayTasks.reduce(
      (sum, task) => sum + task.estimatedMinutes, 0
    )
    const focusedTasksMinutes = focusedTasks.reduce(
      (sum, task) => sum + task.estimatedMinutes, 0
    )

    return {
      focusedTasks,
      urgentTasks,
      todayTasks: remainingTasks,
      readyToStartTasks,
      groupedByHierarchy: {
        independent,
        byProject,
        byGoal
      },
      timeAnalysis: {
        totalEstimatedMinutes,
        focusedTasksMinutes,
        averageTaskMinutes: totalEstimatedMinutes / Math.max(todayTasks.length, 1),
        recommendedDailyLimit: 480 // 8시간
      }
    }
  }

  /**
   * 프로젝트별 업무 그룹화
   */
  private static groupTasksByProject(
    tasks: WorklyTask[], 
    projects: Project[]
  ): TodayTasksOptimized['groupedByHierarchy']['byProject'] {
    const projectGroups: { [projectId: string]: WorklyTask[] } = {}

    tasks.forEach(task => {
      if (task.projectId && 
          (task.hierarchyType === HierarchyType.PROJECT_ONLY || 
           task.hierarchyType === HierarchyType.FULL_HIERARCHY)) {
        if (!projectGroups[task.projectId]) {
          projectGroups[task.projectId] = []
        }
        projectGroups[task.projectId].push(task)
      }
    })

    return Object.entries(projectGroups).map(([projectId, tasks]) => {
      const project = projects.find(p => p.id === projectId)
      return {
        projectId,
        projectTitle: project?.title || '프로젝트 미확인',
        tasks
      }
    })
  }

  /**
   * 목표별 업무 그룹화
   */
  private static groupTasksByGoal(
    tasks: WorklyTask[], 
    projects: Project[], 
    goals: Goal[]
  ): TodayTasksOptimized['groupedByHierarchy']['byGoal'] {
    const goalGroups: { [goalId: string]: {
      directTasks: WorklyTask[]
      projectTasks: { [projectId: string]: WorklyTask[] }
    }} = {}

    tasks.forEach(task => {
      let goalId: string | undefined

      // 목표 ID 확인
      if (task.hierarchyType === HierarchyType.GOAL_DIRECT) {
        goalId = task.goalId
      } else if (task.hierarchyType === HierarchyType.FULL_HIERARCHY) {
        goalId = task.goalId
      }

      if (goalId) {
        if (!goalGroups[goalId]) {
          goalGroups[goalId] = {
            directTasks: [],
            projectTasks: {}
          }
        }

        if (task.hierarchyType === HierarchyType.GOAL_DIRECT) {
          goalGroups[goalId].directTasks.push(task)
        } else if (task.projectId) {
          if (!goalGroups[goalId].projectTasks[task.projectId]) {
            goalGroups[goalId].projectTasks[task.projectId] = []
          }
          goalGroups[goalId].projectTasks[task.projectId].push(task)
        }
      }
    })

    return Object.entries(goalGroups).map(([goalId, groupData]) => {
      const goal = goals.find(g => g.id === goalId)
      
      const projectTasks = Object.entries(groupData.projectTasks).map(([projectId, tasks]) => {
        const project = projects.find(p => p.id === projectId)
        return {
          projectId,
          projectTitle: project?.title || '프로젝트 미확인',
          tasks
        }
      })

      return {
        goalId,
        goalTitle: goal?.title || '목표 미확인',
        directTasks: groupData.directTasks,
        projectTasks
      }
    })
  }

  /**
   * 계층구조 변경 실행
   */
  static async changeHierarchy(
    taskId: string,
    newHierarchy: HierarchyChoice,
    currentTask: WorklyTask
  ): Promise<WorklyTask> {
    // 검증
    const validation = this.canChangeHierarchy(currentTask, newHierarchy)
    if (!validation.isValid) {
      throw new Error(`계층구조 변경 불가: ${validation.errors.join(', ')}`)
    }

    // 새로운 계층구조로 업무 업데이트
    const updatedTask: WorklyTask = {
      ...currentTask,
      hierarchyType: newHierarchy.type,
      projectId: newHierarchy.projectId,
      goalId: newHierarchy.goalId,
      updatedAt: new Date().toISOString()
    }

    // TODO: 실제 구현에서는 여기서 API 호출
    // await taskApi.updateTask(taskId, updatedTask)

    return updatedTask
  }

  /**
   * 독립적 업무 여부 확인
   */
  static isIndependentTask(task: WorklyTask): boolean {
    return task.hierarchyType === HierarchyType.INDEPENDENT
  }

  /**
   * 프로젝트를 통한 목표 연결 확인
   */
  static isGoalConnectedThroughProject(task: WorklyTask): boolean {
    return task.hierarchyType === HierarchyType.FULL_HIERARCHY
  }

  /**
   * 직접 목표 연결 확인
   */
  static isDirectlyConnectedToGoal(task: WorklyTask): boolean {
    return task.hierarchyType === HierarchyType.GOAL_DIRECT
  }
}