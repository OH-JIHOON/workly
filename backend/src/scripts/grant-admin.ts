import { DataSource } from 'typeorm';
import { User } from '../database/entities/user.entity';

enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support'
}

async function grantAdminAccess() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'workly_user',
    password: process.env.DB_PASSWORD || 'workly_password',
    database: process.env.DB_NAME || 'workly_db',
    entities: [User],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('데이터베이스 연결 성공');

    const userRepository = dataSource.getRepository(User);
    
    // abveo5@gmail.com 사용자 찾기
    const user = await userRepository.findOne({
      where: { email: 'abveo5@gmail.com' }
    });

    if (!user) {
      console.log('❌ 사용자를 찾을 수 없습니다: abveo5@gmail.com');
      return;
    }

    console.log('✅ 사용자 찾음:', user.email, user.name);
    console.log('현재 adminRole:', user.adminRole);
    console.log('현재 adminPermissions:', user.adminPermissions);

    // 슈퍼 어드민 권한 부여
    user.adminRole = AdminRole.SUPER_ADMIN;
    user.adminPermissions = ['*']; // 모든 권한
    
    await userRepository.save(user);
    
    console.log('🎉 어드민 권한이 성공적으로 부여되었습니다!');
    console.log('새로운 adminRole:', user.adminRole);
    console.log('새로운 adminPermissions:', user.adminPermissions);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await dataSource.destroy();
    console.log('데이터베이스 연결 종료');
  }
}

// 스크립트 실행
grantAdminAccess();