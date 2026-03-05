# Orchestrate 명령어

복잡한 작업을 위한 순차적 에이전트 워크플로우.

## 사용법

`/orchestrate [workflow-type] [task-description]`

## 워크플로우 유형

### feature
전체 기능 구현 워크플로우:
```
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

### bugfix
버그 조사 및 수정 워크플로우:
```
planner -> tdd-guide -> code-reviewer
```

### refactor
안전한 리팩토링 워크플로우:
```
architect -> code-reviewer -> tdd-guide
```

### security
보안 중심 리뷰:
```
security-reviewer -> code-reviewer -> architect
```

## 실행 패턴

워크플로우의 각 에이전트에 대해:

1. **에이전트 호출** — 이전 에이전트의 컨텍스트와 함께
2. **출력 수집** — 구조화된 인계 문서로
3. **다음 에이전트에 전달** — 체인의 다음 에이전트로
4. **결과 집계** — 최종 보고서로 통합

## 인계 문서 형식

에이전트 간 인계 문서 생성:

```markdown
## HANDOFF: [previous-agent] -> [next-agent]

### 컨텍스트
[수행한 작업 요약]

### 발견 사항
[주요 발견 내용 또는 결정 사항]

### 수정된 파일
[변경된 파일 목록]

### 미결 질문
[다음 에이전트를 위한 미해결 항목]

### 권고사항
[제안된 다음 단계]
```

## 예시: Feature 워크플로우

```
/orchestrate feature "사용자 인증 추가"
```

실행 순서:

1. **Planner 에이전트**
   - 요구사항 분석
   - 구현 계획 수립
   - 의존성 파악
   - 출력: `HANDOFF: planner -> tdd-guide`

2. **TDD Guide 에이전트**
   - planner 인계 문서 읽기
   - 테스트 먼저 작성
   - 테스트 통과를 위한 구현
   - 출력: `HANDOFF: tdd-guide -> code-reviewer`

3. **Code Reviewer 에이전트**
   - 구현 검토
   - 문제점 확인
   - 개선 사항 제안
   - 출력: `HANDOFF: code-reviewer -> security-reviewer`

4. **Security Reviewer 에이전트**
   - 보안 감사
   - 취약점 확인
   - 최종 승인
   - 출력: 최종 보고서

## 최종 보고서 형식

```
ORCHESTRATION REPORT
====================
워크플로우: feature
작업: 사용자 인증 추가
에이전트: planner -> tdd-guide -> code-reviewer -> security-reviewer

요약
-------
[한 단락 요약]

에이전트 출력
-------------
Planner: [요약]
TDD Guide: [요약]
Code Reviewer: [요약]
Security Reviewer: [요약]

변경된 파일
-------------
[수정된 모든 파일 목록]

테스트 결과
------------
[테스트 통과/실패 요약]

보안 상태
---------------
[보안 발견 사항]

권고 사항
--------------
[SHIP / NEEDS WORK / BLOCKED]
```

## 병렬 실행

독립적인 검사의 경우 에이전트를 병렬로 실행:

```markdown
### 병렬 단계
동시 실행:
- code-reviewer (품질)
- security-reviewer (보안)
- architect (설계)

### 결과 병합
출력을 단일 보고서로 통합
```

## 인수

$ARGUMENTS:
- `feature <description>` - 전체 기능 워크플로우
- `bugfix <description>` - 버그 수정 워크플로우
- `refactor <description>` - 리팩토링 워크플로우
- `security <description>` - 보안 리뷰 워크플로우
- `custom <agents> <description>` - 사용자 정의 에이전트 순서

## 커스텀 워크플로우 예시

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "캐싱 레이어 재설계"
```

## 팁

1. **복잡한 기능은 planner로 시작**
2. **병합 전 반드시 code-reviewer 포함**
3. **인증/결제/개인정보 처리 시 security-reviewer 사용**
4. **인계 문서는 간결하게** — 다음 에이전트에 필요한 내용 중심
5. **필요 시 에이전트 사이에 검증 실행**
