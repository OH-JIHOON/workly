# ⚡ Workly 빠른 시작 가이드

## 🚀 지금 당장 개발 시작하기

### 1분 빠른 시작
```bash
cd /Users/ohjiihoon/Documents/Workly/frontend
npm run dev
```
→ http://localhost:3000 접속

## 📋 일상 개발 루틴

### 🌅 개발 시작할 때
```bash
# 1. 프로젝트 폴더로 이동
cd /Users/ohjiihoon/Documents/Workly/frontend

# 2. 최신 코드 받기
git pull origin main

# 3. 개발 서버 시작
npm run dev

# 4. 브라우저에서 http://localhost:3000 확인
```

### 💻 개발 중
- VS Code로 `/frontend/src/` 폴더 열기
- 파일 수정하면 자동 리로드
- Chrome DevTools 활용해서 디버깅

### 🌙 개발 마무리할 때
```bash
# 1. 변경사항 저장
git add .
git commit -m "작업 내용 요약"
git push origin main

# 2. 수동 배포 (자동 배포 현재 미설정)
vercel --prod

# 3. 배포 확인
# → https://workly-silk.vercel.app
```

## 🔧 자주 사용하는 명령어

### 개발 환경
```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run lint         # 코드 검사
```

### Git 작업
```bash
git status           # 변경사항 확인
git add .            # 모든 변경사항 스테이징
git commit -m "메시지"  # 커밋
git push origin main # 배포 (자동)
```

### 문제 해결
```bash
rm -rf node_modules package-lock.json  # 의존성 초기화
npm install                            # 재설치
npm run dev                            # 다시 시작
```

## 📱 효율적인 개발 팁

### VS Code 설정
- **폴더**: `/Users/ohjiihoon/Documents/Workly/frontend` 열기
- **확장프로그램**: ES7+ React/Redux/React-Native snippets
- **설정**: Auto Save 켜기

### 브라우저 설정
- **Chrome DevTools** 항상 열기
- **React DevTools** 확장프로그램 설치
- **localhost:3000** 북마크 추가

### 개발 중 확인사항
1. **콘솔 에러** 없는지 확인
2. **모바일 반응형** 테스트 (DevTools Device Mode)
3. **로그인/로그아웃** 기능 테스트

## 🌐 접속 URL 정리

- **로컬 개발**: http://localhost:3000
- **프로덕션**: https://workly-silk.vercel.app
- **Supabase 대시보드**: https://supabase.com/dashboard/project/wryixncvydcnalvepbox
- **Vercel 대시보드**: https://vercel.com/worklys-projects/workly

---

## 💡 핵심 포인트

✅ **단순함**: 프론트엔드만 신경쓰면 됨  
✅ **자동화**: Git Push = 자동 배포  
✅ **실시간**: 로컬 변경사항 즉시 반영  
✅ **클라우드**: DB/인증 모두 Supabase에서 처리

**🎯 결론**: 이제 백엔드 걱정 없이 프론트엔드 개발에만 100% 집중!