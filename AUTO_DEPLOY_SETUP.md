# 🔧 Git Push 자동 배포 설정 가이드

## 🔍 현재 상황
- ✅ **수동 배포**: `vercel --prod` 정상 작동
- ❌ **자동 배포**: `git push` → Vercel 자동 배포 안됨

## 🎯 자동 배포 설정 방법

### 방법 1: Vercel 대시보드 설정 (추천)

1. **Vercel 대시보드 접속**
   - https://vercel.com/worklys-projects/workly

2. **Settings → Git 메뉴 이동**
   - 프로젝트 설정에서 Git 탭 클릭

3. **Git Repository 연결**
   - "Connect Git Repository" 또는 "Import Git Repository" 클릭
   - GitHub 계정 연동 후 `OH-JIHOON/workly` 선택

4. **자동 배포 확인**
   - `main` 브랜치 푸시 시 자동 배포 활성화됨

### 방법 2: 프로젝트 재생성 (확실한 방법)

1. **새 Vercel 프로젝트 생성**
   - https://vercel.com/new
   - "Import Git Repository" 선택
   - `OH-JIHOON/workly` 저장소 선택

2. **프로젝트 설정**
   - Framework: Next.js 자동 감지됨
   - Build Command: `npm run build:frontend`
   - Output Directory: `frontend/.next`

3. **도메인 이전**
   - 기존 `workly-silk.vercel.app` 도메인을 새 프로젝트로 연결
   - 기존 프로젝트는 삭제

### 방법 3: 현재 상태 유지 (현실적)

자동 배포가 중요하지 않다면 현재 워크플로우 유지:

```bash
# 개발 → 커밋 → 배포
git add .
git commit -m "변경사항"
git push origin main  # 코드 백업
vercel --prod          # 수동 배포 (2-3초 소요)
```

## 🔧 자동 배포 테스트

설정 완료 후 다음으로 테스트:

```bash
# 1. 간단한 파일 수정
echo "console.log('자동 배포 테스트');" >> frontend/src/test-auto-deploy.js

# 2. 커밋 & 푸시
git add .
git commit -m "test: 자동 배포 테스트"
git push origin main

# 3. Vercel에서 자동 배포 시작되는지 확인
vercel ls  # 새로운 배포가 생성되었는지 확인
```

## 📊 배포 모니터링

### Vercel 배포 상태 확인
```bash
vercel ls              # 배포 목록
vercel logs            # 배포 로그 확인
vercel --prod          # 수동 배포 (fallback)
```

### GitHub Actions (선택사항)
자동 배포 + 추가 CI/CD가 필요하다면 GitHub Actions 설정 고려

---

## 💡 권장사항

1. **단기**: 현재 수동 배포로 개발 진행 (`vercel --prod`)
2. **중기**: Vercel 대시보드에서 Git 연동 설정
3. **장기**: 필요시 GitHub Actions로 고급 CI/CD 파이프라인 구축