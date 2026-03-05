---
name: verification-loop
description: "Claude Code 세션을 위한 포괄적인 검증 시스템."
origin: ECC
---

# 검증 루프 Skill

Claude Code 세션을 위한 포괄적인 검증 시스템.

## 사용 시점

이 skill 호출:
- 기능 또는 중요한 코드 변경 완료 후
- PR 생성 전
- 품질 게이트 통과를 확인하고 싶을 때
- 리팩토링 후

## 검증 단계

### Phase 1: 빌드 확인
```bash
# 프로젝트 빌드 확인
npm run build 2>&1 | tail -20
# 또는
pnpm build 2>&1 | tail -20
```

빌드가 실패하면 계속하기 전에 STOP하고 수정합니다.

### Phase 2: 타입 검사
```bash
# TypeScript 프로젝트
npx tsc --noEmit 2>&1 | head -30

# Python 프로젝트
pyright . 2>&1 | head -30
```

모든 타입 오류를 보고합니다. 계속하기 전에 치명적인 오류를 수정합니다.

### Phase 3: 린트 검사
```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30
```

### Phase 4: 테스트 스위트
```bash
# 커버리지로 테스트 실행
npm run test -- --coverage 2>&1 | tail -50

# 커버리지 임계값 확인
# 목표: 최소 80%
```

보고:
- 총 테스트 수: X
- 통과: X
- 실패: X
- 커버리지: X%

### Phase 5: 보안 스캔
```bash
# 시크릿 확인
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null | head -10

# console.log 확인
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

### Phase 6: Diff 리뷰
```bash
# 변경된 내용 표시
git diff --stat
git diff HEAD~1 --name-only
```

변경된 각 파일 검토:
- 의도하지 않은 변경 사항
- 누락된 오류 처리
- 잠재적 엣지 케이스

## 출력 형식

모든 단계 실행 후 검증 보고서 생성:

```
검증 보고서
==================

빌드:   [통과/실패]
타입:   [통과/실패] (X개 오류)
린트:   [통과/실패] (X개 경고)
테스트: [통과/실패] (X/Y 통과, Z% 커버리지)
보안:   [통과/실패] (X개 이슈)
Diff:   [X개 파일 변경]

전체: PR을 위해 [준비됨/준비 안 됨]

수정할 이슈:
1. ...
2. ...
```

## 연속 모드

긴 세션의 경우 15분마다 또는 주요 변경 후 검증 실행:

```markdown
정신적 체크포인트 설정:
- 각 함수 완료 후
- 컴포넌트 완료 후
- 다음 작업으로 이동 전

실행: /verify
```

## 훅과 통합

이 skill은 PostToolUse 훅을 보완하지만 더 깊은 검증을 제공합니다.
훅은 즉시 문제를 포착하고; 이 skill은 포괄적인 리뷰를 제공합니다.
