import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config({ path: '../../.env' });

async function grantAdminAccess() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'workly',
    password: process.env.DATABASE_PASSWORD || 'workly123',
    database: process.env.DATABASE_NAME || 'workly',
    entities: [],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('데이터베이스 연결 성공');

    // 사용자 정보 확인
    const user = await dataSource.query(
      'SELECT id, email, name, role, "adminRole", "adminPermissions", status FROM users WHERE email = $1',
      ['abveo5@gmail.com']
    );

    if (user.length === 0) {
      console.log('❌ 사용자를 찾을 수 없습니다: abveo5@gmail.com');
      return;
    }

    console.log('✅ 사용자 찾음:', user[0]);

    // 슈퍼 어드민 권한 부여
    await dataSource.query(
      'UPDATE users SET "adminRole" = $1, "adminPermissions" = $2 WHERE email = $3',
      ['super_admin', ['*'], 'abveo5@gmail.com']
    );

    // 결과 확인
    const updatedUser = await dataSource.query(
      'SELECT id, email, name, role, "adminRole", "adminPermissions", status FROM users WHERE email = $1',
      ['abveo5@gmail.com']
    );

    console.log('🎉 어드민 권한이 성공적으로 부여되었습니다!');
    console.log('업데이트된 사용자 정보:', updatedUser[0]);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await dataSource.destroy();
    console.log('데이터베이스 연결 종료');
  }
}

// 스크립트 실행
grantAdminAccess();