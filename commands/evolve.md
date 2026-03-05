---
name: evolve
description: 인스팅트를 분석하고 진화된 구조를 제안하거나 생성합니다
command: true
---

# Evolve 명령

## 구현

플러그인 루트 경로를 사용하여 instinct CLI를 실행합니다:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" evolve [--generate]
```

`CLAUDE_PLUGIN_ROOT`가 설정되지 않은 경우 (수동 설치):

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py evolve [--generate]
```

인스팅트를 분석하고 관련된 것들을 더 높은 수준의 구조로 클러스터링합니다:
- **Commands**: 인스팅트가 사용자가 호출하는 작업을 설명할 때
- **Skills**: 인스팅트가 자동 트리거되는 동작을 설명할 때
- **Agents**: 인스팅트가 복잡한 다단계 프로세스를 설명할 때

## 사용법

```
/evolve                    # 모든 인스팅트를 분석하고 진화 제안
/evolve --generate         # evolved/{skills,commands,agents} 아래에 파일도 생성
```

## 진화 규칙

### → Command (사용자 호출)
인스팅트가 사용자가 명시적으로 요청하는 작업을 설명할 때:
- "사용자가 ...를 요청할 때"에 관한 여러 인스팅트
- "새로운 X를 생성할 때"와 같은 트리거가 있는 인스팅트
- 반복 가능한 시퀀스를 따르는 인스팅트

예시:
- `new-table-step1`: "데이터베이스 테이블을 추가할 때, 마이그레이션 생성"
- `new-table-step2`: "데이터베이스 테이블을 추가할 때, 스키마 업데이트"
- `new-table-step3`: "데이터베이스 테이블을 추가할 때, 타입 재생성"

→ 생성: **new-table** command

### → Skill (자동 트리거)
인스팅트가 자동으로 발생해야 하는 동작을 설명할 때:
- 패턴 매칭 트리거
- 오류 처리 응답
- 코드 스타일 적용

예시:
- `prefer-functional`: "함수 작성 시, 함수형 스타일 선호"
- `use-immutable`: "상태 수정 시, 불변 패턴 사용"
- `avoid-classes`: "모듈 설계 시, 클래스 기반 설계 지양"

→ 생성: `functional-patterns` skill

### → Agent (깊이/격리가 필요)
인스팅트가 격리의 이점이 있는 복잡한 다단계 프로세스를 설명할 때:
- 디버깅 워크플로우
- 리팩터링 시퀀스
- 리서치 작업

예시:
- `debug-step1`: "디버깅 시, 먼저 로그 확인"
- `debug-step2`: "디버깅 시, 실패 컴포넌트 격리"
- `debug-step3`: "디버깅 시, 최소 재현 생성"
- `debug-step4`: "디버깅 시, 테스트로 수정 검증"

→ 생성: **debugger** agent

## 수행할 작업

1. 현재 프로젝트 컨텍스트 감지
2. 프로젝트 + 전역 인스팅트 읽기 (ID 충돌 시 프로젝트 우선)
3. 트리거/도메인 패턴으로 인스팅트 그룹화
4. 식별:
   - 스킬 후보 (2개 이상의 인스팅트를 가진 트리거 클러스터)
   - 명령 후보 (높은 신뢰도의 워크플로우 인스팅트)
   - 에이전트 후보 (더 크고 높은 신뢰도의 클러스터)
5. 해당 시 승격 후보 표시 (프로젝트 -> 전역)
6. `--generate`가 전달된 경우, 파일을 다음 위치에 작성:
   - 프로젝트 범위: `~/.claude/homunculus/projects/<project-id>/evolved/`
   - 전역 폴백: `~/.claude/homunculus/evolved/`

## 출력 형식

```
============================================================
  EVOLVE ANALYSIS - 12 instincts
  Project: my-app (a1b2c3d4e5f6)
  Project-scoped: 8 | Global: 4
============================================================

높은 신뢰도 인스팅트 (>=80%): 5

## 스킬 후보
1. 클러스터: "테스트 추가"
   인스팅트: 3
   평균 신뢰도: 82%
   도메인: testing
   범위: project

## 명령 후보 (2)
  /adding-tests
    출처: test-first-workflow [project]
    신뢰도: 84%

## 에이전트 후보 (1)
  adding-tests-agent
    3개 인스팅트 포함
    평균 신뢰도: 82%
```

## 플래그

- `--generate`: 분석 출력 외에 진화된 파일도 생성

## 생성된 파일 형식

### Command
```markdown
---
name: new-table
description: 마이그레이션, 스키마 업데이트, 타입 생성으로 새 데이터베이스 테이블 생성
command: /new-table
evolved_from:
  - new-table-migration
  - update-schema
  - regenerate-types
---

# New Table Command

[클러스터링된 인스팅트를 기반으로 생성된 내용]

## 단계
1. ...
2. ...
```

### Skill
```markdown
---
name: functional-patterns
description: 함수형 프로그래밍 패턴 적용
evolved_from:
  - prefer-functional
  - use-immutable
  - avoid-classes
---

# Functional Patterns Skill

[클러스터링된 인스팅트를 기반으로 생성된 내용]
```

### Agent
```markdown
---
name: debugger
description: 체계적인 디버깅 에이전트
model: sonnet
evolved_from:
  - debug-check-logs
  - debug-isolate
  - debug-reproduce
---

# Debugger Agent

[클러스터링된 인스팅트를 기반으로 생성된 내용]
```
