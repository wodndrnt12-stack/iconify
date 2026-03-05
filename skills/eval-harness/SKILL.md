---
name: eval-harness
description: eval 주도 개발(EDD) 원칙을 구현하는 Claude Code 세션용 공식 평가 프레임워크
origin: ECC
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Eval Harness 스킬

Claude Code 세션을 위한 공식 평가 프레임워크로, eval 주도 개발(EDD) 원칙을 구현합니다.

## 활성화 시점

- AI 보조 워크플로우에 eval 주도 개발(EDD) 설정
- Claude Code 작업 완료를 위한 합격/불합격 기준 정의
- pass@k 지표로 에이전트 신뢰성 측정
- 프롬프트 또는 에이전트 변경을 위한 회귀 테스트 스위트 생성
- 모델 버전에 걸친 에이전트 성능 벤치마킹

## 철학

Eval 주도 개발은 eval을 "AI 개발의 단위 테스트"로 취급합니다:
- 구현 전에 기대 동작을 정의
- 개발 중 지속적으로 eval 실행
- 각 변경사항과 함께 회귀 추적
- 신뢰성 측정을 위해 pass@k 지표 사용

## Eval 유형

### 기능 Eval
Claude가 이전에 할 수 없었던 일을 할 수 있는지 테스트:
```markdown
[기능 EVAL: feature-name]
작업: Claude가 달성해야 할 내용 설명
성공 기준:
  - [ ] 기준 1
  - [ ] 기준 2
  - [ ] 기준 3
예상 출력: 예상 결과 설명
```

### 회귀 Eval
변경사항이 기존 기능을 손상시키지 않도록 보장:
```markdown
[회귀 EVAL: feature-name]
기준선: SHA 또는 체크포인트 이름
테스트:
  - existing-test-1: PASS/FAIL
  - existing-test-2: PASS/FAIL
  - existing-test-3: PASS/FAIL
결과: X/Y 통과 (이전: Y/Y)
```

## 채점자 유형

### 1. 코드 기반 채점자
코드를 사용한 결정론적 확인:
```bash
# 파일에 예상 패턴이 있는지 확인
grep -q "export function handleAuth" src/auth.ts && echo "PASS" || echo "FAIL"

# 테스트 통과 여부 확인
npm test -- --testPathPattern="auth" && echo "PASS" || echo "FAIL"

# 빌드 성공 여부 확인
npm run build && echo "PASS" || echo "FAIL"
```

### 2. 모델 기반 채점자
개방형 출력을 평가하기 위해 Claude 사용:
```markdown
[모델 채점자 프롬프트]
다음 코드 변경을 평가하세요:
1. 명시된 문제를 해결하는가?
2. 잘 구조화되어 있는가?
3. 엣지 케이스가 처리되었는가?
4. 오류 처리가 적절한가?

점수: 1-5 (1=불량, 5=우수)
이유: [설명]
```

### 3. 사람 채점자
수동 검토를 위해 플래그 지정:
```markdown
[사람 검토 필요]
변경사항: 변경된 내용 설명
이유: 사람 검토가 필요한 이유
위험 수준: LOW/MEDIUM/HIGH
```

## 지표

### pass@k
"k번 시도 중 적어도 한 번 성공"
- pass@1: 첫 번째 시도 성공률
- pass@3: 3번 시도 내 성공
- 일반적인 목표: pass@3 > 90%

### pass^k
"k번 시도 모두 성공"
- 신뢰성에 대한 더 높은 기준
- pass^3: 3번 연속 성공
- 중요 경로에 사용

## Eval 워크플로우

### 1. 정의 (코딩 전)
```markdown
## EVAL 정의: feature-xyz

### 기능 Eval
1. 새 사용자 계정 생성 가능
2. 이메일 형식 유효성 검사 가능
3. 비밀번호를 안전하게 해시 가능

### 회귀 Eval
1. 기존 로그인 계속 작동
2. 세션 관리 변경 없음
3. 로그아웃 플로우 유지

### 성공 지표
- 기능 eval에 대해 pass@3 > 90%
- 회귀 eval에 대해 pass^3 = 100%
```

### 2. 구현
정의된 eval을 통과하도록 코드 작성.

### 3. 평가
```bash
# 기능 eval 실행
[각 기능 eval 실행, PASS/FAIL 기록]

# 회귀 eval 실행
npm test -- --testPathPattern="existing"

# 리포트 생성
```

### 4. 리포트
```markdown
EVAL 리포트: feature-xyz
========================

기능 Eval:
  create-user:     PASS (pass@1)
  validate-email:  PASS (pass@2)
  hash-password:   PASS (pass@1)
  전체:            3/3 통과

회귀 Eval:
  login-flow:      PASS
  session-mgmt:    PASS
  logout-flow:     PASS
  전체:            3/3 통과

지표:
  pass@1: 67% (2/3)
  pass@3: 100% (3/3)

상태: 검토 준비 완료
```

## 통합 패턴

### 구현 전
```
/eval define feature-name
```
`.claude/evals/feature-name.md`에 eval 정의 파일 생성

### 구현 중
```
/eval check feature-name
```
현재 eval 실행 및 상태 보고

### 구현 후
```
/eval report feature-name
```
전체 eval 리포트 생성

## Eval 저장소

프로젝트에 eval 저장:
```
.claude/
  evals/
    feature-xyz.md      # Eval 정의
    feature-xyz.log     # Eval 실행 이력
    baseline.json       # 회귀 기준선
```

## 모범 사례

1. **코딩 전 eval 정의** - 성공 기준에 대한 명확한 사고 강제
2. **eval 자주 실행** - 초기에 회귀 포착
3. **시간에 따른 pass@k 추적** - 신뢰성 추세 모니터링
4. **가능한 경우 코드 채점자 사용** - 결정론적 > 확률론적
5. **보안을 위한 사람 검토** - 보안 검사를 완전히 자동화하지 말 것
6. **eval 빠르게 유지** - 느린 eval은 실행되지 않음
7. **코드와 함께 eval 버전 관리** - Eval은 일급 아티팩트

## 예시: 인증 추가

```markdown
## EVAL: add-authentication

### 1단계: 정의 (10분)
기능 Eval:
- [ ] 사용자가 이메일/비밀번호로 등록 가능
- [ ] 사용자가 유효한 자격증명으로 로그인 가능
- [ ] 잘못된 자격증명은 적절한 오류로 거부
- [ ] 페이지 새로고침 후 세션 유지
- [ ] 로그아웃 시 세션 초기화

회귀 Eval:
- [ ] 공개 경로 계속 접근 가능
- [ ] API 응답 변경 없음
- [ ] 데이터베이스 스키마 호환

### 2단계: 구현 (소요 시간 가변)
[코드 작성]

### 3단계: 평가
실행: /eval check add-authentication

### 4단계: 리포트
EVAL 리포트: add-authentication
==============================
기능: 5/5 통과 (pass@3: 100%)
회귀: 3/3 통과 (pass^3: 100%)
상태: 배포 가능
```
