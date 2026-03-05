---
name: continuous-learning-v2
description: 훅을 통해 세션을 관찰하고, 신뢰도 점수를 가진 원자적 본능을 생성하며, 이를 스킬/명령어/에이전트로 발전시키는 본능 기반 학습 시스템. v2.1은 크로스 프로젝트 오염을 방지하기 위한 프로젝트 범위 본능을 추가합니다.
origin: ECC
version: 2.1.0
---

# 지속적 학습 v2.1 - 본능 기반 아키텍처

Claude Code 세션을 원자적 "본능" — 신뢰도 점수를 가진 작고 학습된 동작 — 을 통해 재사용 가능한 지식으로 전환하는 고급 학습 시스템.

**v2.1**은 **프로젝트 범위 본능** 추가 — React 패턴은 React 프로젝트에, Python 관례는 Python 프로젝트에 남고, 범용 패턴(예: "항상 입력을 검증하라")은 전역으로 공유됩니다.

## 활성화 조건

- Claude Code 세션에서 자동 학습 설정 시
- 훅을 통한 본능 기반 동작 추출 구성 시
- 학습된 동작의 신뢰도 임계값 조정 시
- 본능 라이브러리 검토, 내보내기, 또는 가져오기 시
- 본능을 전체 스킬, 명령어, 또는 에이전트로 발전시킬 때
- 프로젝트 범위 vs 전역 본능 관리 시
- 프로젝트에서 전역 범위로 본능 승격 시

## v2.1의 새로운 기능

| 기능 | v2.0 | v2.1 |
|---------|------|------|
| 저장소 | 전역 (~/.claude/homunculus/) | 프로젝트 범위 (projects/<hash>/) |
| 범위 | 모든 본능이 모든 곳에 적용 | 프로젝트 범위 + 전역 |
| 감지 | 없음 | git remote URL / 저장소 경로 |
| 승격 | 해당 없음 | 2개 이상 프로젝트에서 발견 시 프로젝트 → 전역 |
| 명령어 | 4개 (status/evolve/export/import) | 6개 (+promote/projects) |
| 크로스 프로젝트 | 오염 위험 | 기본적으로 격리됨 |

## v2의 새로운 기능 (v1 대비)

| 기능 | v1 | v2 |
|---------|----|----|
| 관찰 | Stop 훅 (세션 종료) | PreToolUse/PostToolUse (100% 신뢰성) |
| 분석 | 메인 컨텍스트 | 백그라운드 에이전트 (Haiku) |
| 세분성 | 전체 스킬 | 원자적 "본능" |
| 신뢰도 | 없음 | 0.3-0.9 가중치 |
| 발전 | 스킬로 직접 | 본능 -> 클러스터 -> 스킬/명령어/에이전트 |
| 공유 | 없음 | 본능 내보내기/가져오기 |

## 본능 모델

본능은 작고 학습된 동작입니다:

```yaml
---
id: prefer-functional-style
trigger: "새 함수 작성 시"
confidence: 0.7
domain: "code-style"
source: "session-observation"
scope: project
project_id: "a1b2c3d4e5f6"
project_name: "my-react-app"
---

# 함수형 스타일 선호

## 동작
적절할 때 클래스 대신 함수형 패턴 사용.

## 근거
- 함수형 패턴 선호 5회 관찰
- 사용자가 2025-01-15에 클래스 기반 접근 방식을 함수형으로 수정
```

**속성:**
- **원자적** -- 하나의 트리거, 하나의 동작
- **신뢰도 가중** -- 0.3 = 잠정적, 0.9 = 거의 확실
- **도메인 태그** -- code-style, testing, git, debugging, workflow 등
- **근거 기반** -- 무엇이 이를 생성했는지 추적
- **범위 인식** -- `project` (기본값) 또는 `global`

## 작동 방식

```
세션 활동 (git 저장소에서)
      |
      | 훅이 프롬프트 + 도구 사용 캡처 (100% 신뢰성)
      | + 프로젝트 컨텍스트 감지 (git remote / 저장소 경로)
      v
+---------------------------------------------+
|  projects/<project-hash>/observations.jsonl  |
|   (프롬프트, 도구 호출, 결과, 프로젝트)   |
+---------------------------------------------+
      |
      | 관찰자 에이전트가 읽음 (백그라운드, Haiku)
      v
+---------------------------------------------+
|          패턴 감지                           |
|   * 사용자 수정 -> 본능                     |
|   * 에러 해결 -> 본능                       |
|   * 반복 워크플로우 -> 본능                 |
|   * 범위 결정: 프로젝트 또는 전역?          |
+---------------------------------------------+
      |
      | 생성/업데이트
      v
+---------------------------------------------+
|  projects/<project-hash>/instincts/personal/ |
|   * prefer-functional.yaml (0.7) [project]   |
|   * use-react-hooks.yaml (0.9) [project]     |
+---------------------------------------------+
|  instincts/personal/  (전역)                 |
|   * always-validate-input.yaml (0.85) [global]|
|   * grep-before-edit.yaml (0.6) [global]     |
+---------------------------------------------+
      |
      | /evolve 클러스터 + /promote
      v
+---------------------------------------------+
|  projects/<hash>/evolved/ (프로젝트 범위)   |
|  evolved/ (전역)                             |
|   * commands/new-feature.md                  |
|   * skills/testing-workflow.md               |
|   * agents/refactor-specialist.md            |
+---------------------------------------------+
```

## 프로젝트 감지

시스템이 현재 프로젝트를 자동으로 감지합니다:

1. **`CLAUDE_PROJECT_DIR` 환경 변수** (최우선 순위)
2. **`git remote get-url origin`** -- 포터블한 프로젝트 ID 생성을 위해 해시화 (다른 머신의 동일 저장소가 같은 ID를 얻음)
3. **`git rev-parse --show-toplevel`** -- 저장소 경로를 사용하는 폴백 (머신별)
4. **전역 폴백** -- 프로젝트가 감지되지 않으면 본능이 전역 범위로

각 프로젝트는 12자리 해시 ID를 얻습니다 (예: `a1b2c3d4e5f6`). `~/.claude/homunculus/projects.json`의 레지스트리 파일이 ID를 사람이 읽을 수 있는 이름으로 매핑합니다.

## 빠른 시작

### 1. 관찰 훅 활성화

`~/.claude/settings.json`에 추가.

**플러그인으로 설치된 경우** (권장):

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/hooks/observe.sh"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/hooks/observe.sh"
      }]
    }]
  }
}
```

**`~/.claude/skills`에 수동으로 설치된 경우**:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh"
      }]
    }]
  }
}
```

### 2. 디렉터리 구조 초기화

시스템은 첫 사용 시 자동으로 디렉터리를 생성하지만, 수동으로 생성할 수도 있습니다:

```bash
# 전역 디렉터리
mkdir -p ~/.claude/homunculus/{instincts/{personal,inherited},evolved/{agents,skills,commands},projects}

# 프로젝트 디렉터리는 훅이 git 저장소에서 처음 실행될 때 자동 생성
```

### 3. 본능 명령어 사용

```bash
/instinct-status     # 학습된 본능 표시 (프로젝트 + 전역)
/evolve              # 관련 본능을 스킬/명령어로 클러스터링
/instinct-export     # 본능 내보내기
/instinct-import     # 다른 사람의 본능 가져오기
/promote             # 프로젝트 본능을 전역 범위로 승격
/projects            # 알려진 모든 프로젝트와 본능 수 나열
```

## 명령어

| 명령어 | 설명 |
|---------|-------------|
| `/instinct-status` | 신뢰도와 함께 모든 본능 표시 (프로젝트 범위 + 전역) |
| `/evolve` | 관련 본능을 스킬/명령어로 클러스터링, 승격 제안 |
| `/instinct-export` | 본능 내보내기 (범위/도메인으로 필터링 가능) |
| `/instinct-import <file>` | 범위 제어와 함께 본능 가져오기 |
| `/promote [id]` | 프로젝트 본능을 전역 범위로 승격 |
| `/projects` | 알려진 모든 프로젝트와 본능 수 나열 |

## 설정

백그라운드 관찰자를 제어하려면 `config.json` 편집:

```json
{
  "version": "2.1",
  "observer": {
    "enabled": false,
    "run_interval_minutes": 5,
    "min_observations_to_analyze": 20
  }
}
```

| 키 | 기본값 | 설명 |
|-----|---------|-------------|
| `observer.enabled` | `false` | 백그라운드 관찰자 에이전트 활성화 |
| `observer.run_interval_minutes` | `5` | 관찰자가 관찰을 분석하는 빈도 |
| `observer.min_observations_to_analyze` | `20` | 분석 실행 전 최소 관찰 수 |

기타 동작 (관찰 캡처, 본능 임계값, 프로젝트 범위 지정, 승격 기준)은 `instinct-cli.py`와 `observe.sh`의 코드 기본값으로 설정됩니다.

## 파일 구조

```
~/.claude/homunculus/
+-- identity.json           # 프로필, 기술 수준
+-- projects.json           # 레지스트리: 프로젝트 해시 -> 이름/경로/remote
+-- observations.jsonl      # 전역 관찰 (폴백)
+-- instincts/
|   +-- personal/           # 전역 자동 학습 본능
|   +-- inherited/          # 전역 가져온 본능
+-- evolved/
|   +-- agents/             # 전역 생성된 에이전트
|   +-- skills/             # 전역 생성된 스킬
|   +-- commands/           # 전역 생성된 명령어
+-- projects/
    +-- a1b2c3d4e5f6/       # 프로젝트 해시 (git remote URL 기반)
    |   +-- observations.jsonl
    |   +-- observations.archive/
    |   +-- instincts/
    |   |   +-- personal/   # 프로젝트별 자동 학습
    |   |   +-- inherited/  # 프로젝트별 가져온 본능
    |   +-- evolved/
    |       +-- skills/
    |       +-- commands/
    |       +-- agents/
    +-- f6e5d4c3b2a1/       # 다른 프로젝트
        +-- ...
```

## 범위 결정 가이드

| 패턴 유형 | 범위 | 예시 |
|-------------|-------|---------|
| 언어/프레임워크 관례 | **project** | "React 훅 사용", "Django REST 패턴 따름" |
| 파일 구조 선호도 | **project** | "`__tests__`/에 테스트", "src/components/에 컴포넌트" |
| 코드 스타일 | **project** | "함수형 스타일 사용", "데이터클래스 선호" |
| 에러 처리 전략 | **project** | "에러에 Result 타입 사용" |
| 보안 사례 | **global** | "사용자 입력 검증", "SQL 살균" |
| 일반 모범 사례 | **global** | "테스트 먼저 작성", "항상 에러 처리" |
| 도구 워크플로우 선호 | **global** | "편집 전 Grep", "쓰기 전 읽기" |
| Git 사례 | **global** | "관례적 커밋", "작고 집중된 커밋" |

## 본능 승격 (프로젝트 -> 전역)

동일한 본능이 높은 신뢰도로 여러 프로젝트에 나타날 때, 전역 범위로 승격하는 후보가 됩니다.

**자동 승격 기준:**
- 동일한 본능 ID가 2개 이상 프로젝트에 존재
- 평균 신뢰도 >= 0.8

**승격 방법:**

```bash
# 특정 본능 승격
python3 instinct-cli.py promote prefer-explicit-errors

# 자격이 있는 모든 본능 자동 승격
python3 instinct-cli.py promote

# 변경 없이 미리보기
python3 instinct-cli.py promote --dry-run
```

`/evolve` 명령어도 승격 후보를 제안합니다.

## 신뢰도 점수

신뢰도는 시간에 따라 발전합니다:

| 점수 | 의미 | 동작 |
|-------|---------|----------|
| 0.3 | 잠정적 | 제안되지만 강제되지 않음 |
| 0.5 | 보통 | 관련 시 적용 |
| 0.7 | 강함 | 적용에 자동 승인 |
| 0.9 | 거의 확실 | 핵심 동작 |

**신뢰도 증가** 시:
- 패턴이 반복적으로 관찰될 때
- 사용자가 제안된 동작을 수정하지 않을 때
- 다른 소스의 유사한 본능이 동의할 때

**신뢰도 감소** 시:
- 사용자가 동작을 명시적으로 수정할 때
- 패턴이 오랜 기간 관찰되지 않을 때
- 모순되는 증거가 나타날 때

## 관찰을 위해 스킬 대신 훅을 사용하는 이유?

> "v1은 관찰에 스킬을 사용했습니다. 스킬은 확률적 — Claude의 판단에 따라 ~50-80% 시간만 실행됩니다."

훅은 **100% 신뢰성**으로 실행됩니다. 이것이 의미하는 바:
- 모든 도구 호출이 관찰됨
- 패턴이 누락되지 않음
- 학습이 포괄적임

## 하위 호환성

v2.1은 v2.0 및 v1과 완전히 호환됩니다:
- `~/.claude/homunculus/instincts/`의 기존 전역 본능은 전역 본능으로 계속 작동
- v1의 `~/.claude/skills/learned/` 스킬은 계속 작동
- Stop 훅은 여전히 실행됨 (이제 v2에도 피드)
- 점진적 마이그레이션: 둘 다 병렬로 실행

## 개인 정보 보호

- 관찰은 내 머신에 **로컬**로 유지
- 프로젝트 범위 본능은 프로젝트별로 격리
- **본능**(패턴)만 내보낼 수 있음 — 원시 관찰은 불가
- 실제 코드나 대화 내용은 공유되지 않음
- 무엇이 내보내지고 승격되는지 직접 제어

## 관련 항목

- [Skill Creator](https://skill-creator.app) - 저장소 히스토리에서 본능 생성
- Homunculus - v2 본능 기반 아키텍처에 영감을 준 커뮤니티 프로젝트 (원자적 관찰, 신뢰도 점수, 본능 발전 파이프라인)
- [롱폼 가이드](https://x.com/affaanmustafa/status/2014040193557471352) - 지속적 학습 섹션

---

*본능 기반 학습: 한 번에 하나의 프로젝트씩 Claude에게 당신의 패턴을 가르칩니다.*
