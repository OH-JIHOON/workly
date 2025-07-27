# 워클리 스크롤바 시스템

## 개요

워클리는 간결한 UI를 위해 모든 스크롤바를 기본적으로 숨기고, 필요할 때만 표시하는 시스템을 구현했습니다.

## 동작 방식

### 1. 글로벌 스크롤바 숨김
- 모든 요소의 스크롤바가 기본적으로 숨겨집니다
- 브라우저 호환성: Chrome, Safari, Firefox, Edge

### 2. 선택적 표시
- 마우스 호버 시
- 포커스 시 (키보드 네비게이션)
- 실제 스크롤 중일 때 (1.5초 후 자동 숨김)

## 사용법

### 기본 사용
```tsx
<div className="overflow-y-auto scrollbar-on-hover">
  {/* 스크롤 가능한 콘텐츠 */}
</div>
```

### 고급 사용 (React Hook)
```tsx
import { useScrollVisibility } from '@/hooks/useScrollVisibility'

function MyComponent() {
  const { elementRef } = useScrollVisibility({
    hideDelay: 1500,
    showOnHover: true
  })

  return (
    <div ref={elementRef} className="overflow-y-auto scrollbar-on-hover">
      {/* 콘텐츠 */}
    </div>
  )
}
```

## 적용된 컴포넌트

- 채팅 메시지 영역
- 프로젝트 상세 사이드바
- 프로젝트 목록 모달
- 업무 생성 위저드
- 상태 선택 드롭다운

## 브라우저 지원

| 브라우저 | 버전 | 지원 상태 |
|---------|------|----------|
| Chrome  | 80+  | ✅ 완전 지원 |
| Safari  | 14+  | ✅ 완전 지원 |
| Firefox | 64+  | ✅ 완전 지원 |
| Edge    | 80+  | ✅ 완전 지원 |

## 커스터마이징

### CSS 변수로 스타일 조정
```css
.scrollbar-on-hover {
  --scrollbar-width: 6px;
  --scrollbar-color: rgba(156, 163, 175, 0.5);
  --scrollbar-hover-color: rgba(107, 114, 128, 0.7);
}
```

### 숨김 딜레이 조정
```tsx
const { elementRef } = useScrollVisibility({
  hideDelay: 2000, // 2초 후 숨김
  showOnHover: false // 호버 시 표시 비활성화
})
```

## 접근성

- 키보드 네비게이션 시 자동 표시
- 스크린 리더 호환성 유지
- 터치 디바이스에서 자연스러운 스크롤 경험

## 성능

- CSS transition을 통한 GPU 가속
- 불필요한 DOM 조작 최소화
- 메모리 누수 방지를 위한 이벤트 리스너 정리