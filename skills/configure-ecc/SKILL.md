---
name: configure-ecc
description: Everything Claude Code의 대화형 설치 도우미 — 사용자가 스킬과 규칙을 선택하여 사용자 수준 또는 프로젝트 수준 디렉터리에 설치하도록 안내하고, 경로를 확인하며, 선택적으로 설치된 파일을 최적화합니다.
origin: ECC
---

# Configure Everything Claude Code (ECC)

Everything Claude Code 프로젝트를 위한 대화형 단계별 설치 마법사. `AskUserQuestion`을 사용하여 스킬과 규칙의 선택적 설치를 안내한 후, 정확성을 확인하고 최적화를 제공합니다.

## 활성화 조건

- 사용자가 "configure ecc", "install ecc", "setup everything claude code" 또는 유사한 말을 할 때
- 사용자가 이 프로젝트에서 스킬 또는 규칙을 선택적으로 설치하려 할 때
- 사용자가 기존 ECC 설치를 확인하거나 수정하려 할 때
- 사용자가 설치된 스킬이나 규칙을 프로젝트에 맞게 최적화하려 할 때

## 사전 요구사항

이 스킬은 활성화 전에 Claude Code에서 접근 가능해야 합니다. 부트스트랩 방법 두 가지:
1. **플러그인 방식**: `/plugin install everything-claude-code` — 플러그인이 이 스킬을 자동으로 로드
2. **수동 방식**: 이 스킬만 `~/.claude/skills/configure-ecc/SKILL.md`에 복사한 후 "configure ecc"라고 말해 활성화

---

## 0단계: ECC 저장소 복제

설치 전, 최신 ECC 소스를 `/tmp`에 복제:

```bash
rm -rf /tmp/everything-claude-code
git clone https://github.com/affaan-m/everything-claude-code.git /tmp/everything-claude-code
```

이후 모든 복사 작업의 소스로 `ECC_ROOT=/tmp/everything-claude-code`를 설정.

복제 실패 시 (네트워크 문제 등), `AskUserQuestion`을 사용해 사용자에게 기존 ECC 복제본의 로컬 경로를 요청.

---

## 1단계: 설치 수준 선택

`AskUserQuestion`을 사용해 설치 위치를 사용자에게 질문:

```
질문: "ECC 구성 요소를 어디에 설치하시겠습니까?"
옵션:
  - "사용자 수준 (~/.claude/)" — "모든 Claude Code 프로젝트에 적용됩니다"
  - "프로젝트 수준 (.claude/)" — "현재 프로젝트에만 적용됩니다"
  - "둘 다" — "공통/공유 항목은 사용자 수준, 프로젝트별 항목은 프로젝트 수준"
```

선택을 `INSTALL_LEVEL`로 저장. 대상 디렉터리 설정:
- 사용자 수준: `TARGET=~/.claude`
- 프로젝트 수준: `TARGET=.claude` (현재 프로젝트 루트 기준 상대 경로)
- 둘 다: `TARGET_USER=~/.claude`, `TARGET_PROJECT=.claude`

대상 디렉터리가 없으면 생성:
```bash
mkdir -p $TARGET/skills $TARGET/rules
```

---

## 2단계: 스킬 선택 및 설치

### 2a: 범위 선택 (핵심 vs 틈새)

기본값은 **핵심 (신규 사용자 권장)** — `.agents/skills/*`와 리서치 우선 워크플로우를 위한 `skills/search-first/`를 복사. 이 번들은 엔지니어링, 평가, 검증, 보안, 전략적 압축, 프론트엔드 디자인, Anthropic 크로스 기능 스킬(article-writing, content-engine, market-research, frontend-slides)을 포함합니다.

`AskUserQuestion` (단일 선택):
```
질문: "핵심 스킬만 설치하시겠습니까, 아니면 틈새/프레임워크 팩도 포함하시겠습니까?"
옵션:
  - "핵심만 (권장)" — "tdd, e2e, evals, verification, research-first, security, frontend patterns, compacting, Anthropic 크로스 기능 스킬"
  - "핵심 + 선택한 틈새" — "핵심 이후 프레임워크/도메인별 스킬 추가"
  - "틈새만" — "핵심 건너뛰고 특정 프레임워크/도메인 스킬 설치"
기본값: 핵심만
```

사용자가 틈새 또는 핵심+틈새를 선택하면, 아래의 카테고리 선택으로 계속하고 선택한 틈새 스킬만 포함.

### 2b: 스킬 카테고리 선택

27개의 스킬이 4개 카테고리로 구성됩니다. `multiSelect: true`로 `AskUserQuestion` 사용:

```
질문: "어떤 스킬 카테고리를 설치하시겠습니까?"
옵션:
  - "프레임워크 및 언어" — "Django, Spring Boot, Go, Python, Java, Frontend, Backend 패턴"
  - "데이터베이스" — "PostgreSQL, ClickHouse, JPA/Hibernate 패턴"
  - "워크플로우 및 품질" — "TDD, verification, learning, security review, compaction"
  - "모든 스킬" — "사용 가능한 모든 스킬 설치"
```

### 2c: 개별 스킬 확인

선택한 각 카테고리에 대해 아래의 전체 스킬 목록을 출력하고 특정 항목을 확인하거나 선택 해제하도록 요청. 목록이 4개를 초과하면 텍스트로 목록을 출력하고 "나열된 모든 항목 설치" 옵션과 사용자가 특정 이름을 붙여넣을 수 있는 "기타" 옵션으로 `AskUserQuestion` 사용.

**카테고리: 프레임워크 및 언어 (17개 스킬)**

| 스킬 | 설명 |
|-------|-------------|
| `backend-patterns` | Node.js/Express/Next.js를 위한 백엔드 아키텍처, API 설계, 서버 측 모범 사례 |
| `coding-standards` | TypeScript, JavaScript, React, Node.js 범용 코딩 표준 |
| `django-patterns` | Django 아키텍처, DRF REST API, ORM, 캐싱, 시그널, 미들웨어 |
| `django-security` | Django 보안: 인증, CSRF, SQL 인젝션, XSS 방지 |
| `django-tdd` | pytest-django, factory_boy, 모킹, 커버리지로 Django 테스팅 |
| `django-verification` | Django 검증 루프: 마이그레이션, 린팅, 테스트, 보안 스캔 |
| `frontend-patterns` | React, Next.js, 상태 관리, 성능, UI 패턴 |
| `frontend-slides` | 의존성 없는 HTML 프레젠테이션, 스타일 미리보기, PPTX-to-web 변환 |
| `golang-patterns` | 견고한 Go 애플리케이션을 위한 관용적 Go 패턴 및 관례 |
| `golang-testing` | Go 테스팅: 테이블 기반 테스트, 서브테스트, 벤치마크, 퍼징 |
| `java-coding-standards` | Spring Boot용 Java 코딩 표준: 네이밍, 불변성, Optional, 스트림 |
| `python-patterns` | Python적 관용구, PEP 8, 타입 힌트, 모범 사례 |
| `python-testing` | pytest, TDD, 픽스처, 모킹, 파라미터화를 사용한 Python 테스팅 |
| `springboot-patterns` | Spring Boot 아키텍처, REST API, 계층화 서비스, 캐싱, 비동기 |
| `springboot-security` | Spring Security: 인증/인가, 유효성 검사, CSRF, 시크릿, 레이트 리미팅 |
| `springboot-tdd` | JUnit 5, Mockito, MockMvc, Testcontainers를 사용한 Spring Boot TDD |
| `springboot-verification` | Spring Boot 검증: 빌드, 정적 분석, 테스트, 보안 스캔 |

**카테고리: 데이터베이스 (3개 스킬)**

| 스킬 | 설명 |
|-------|-------------|
| `clickhouse-io` | ClickHouse 패턴, 쿼리 최적화, 분석, 데이터 엔지니어링 |
| `jpa-patterns` | JPA/Hibernate 엔티티 설계, 관계, 쿼리 최적화, 트랜잭션 |
| `postgres-patterns` | PostgreSQL 쿼리 최적화, 스키마 설계, 인덱싱, 보안 |

**카테고리: 워크플로우 및 품질 (8개 스킬)**

| 스킬 | 설명 |
|-------|-------------|
| `continuous-learning` | 세션에서 재사용 가능한 패턴을 자동으로 추출하여 학습된 스킬로 저장 |
| `continuous-learning-v2` | 신뢰도 점수 기반의 본능적 학습으로 스킬/명령어/에이전트로 발전 |
| `eval-harness` | 평가 기반 개발(EDD)을 위한 공식 평가 프레임워크 |
| `iterative-retrieval` | 서브에이전트 컨텍스트 문제를 위한 점진적 컨텍스트 세밀화 |
| `security-review` | 보안 체크리스트: 인증, 입력, 시크릿, API, 결제 기능 |
| `strategic-compact` | 논리적 간격에서 수동 컨텍스트 압축을 제안 |
| `tdd-workflow` | 80%+ 커버리지로 TDD 적용: 단위, 통합, E2E |
| `verification-loop` | 검증 및 품질 루프 패턴 |

**카테고리: 비즈니스 및 콘텐츠 (5개 스킬)**

| 스킬 | 설명 |
|-------|-------------|
| `article-writing` | 노트, 예시, 소스 문서를 사용하여 제공된 문체로 장문 작성 |
| `content-engine` | 멀티 플랫폼 소셜 콘텐츠, 스크립트, 재활용 워크플로우 |
| `market-research` | 소스 인용 방식의 시장, 경쟁사, 펀드, 기술 리서치 |
| `investor-materials` | 피치덱, 원페이저, 투자자 메모, 재무 모델 |
| `investor-outreach` | 개인화된 투자자 콜드 이메일, 따뜻한 소개, 팔로업 |

**단독 스킬**

| 스킬 | 설명 |
|-------|-------------|
| `project-guidelines-example` | 프로젝트별 스킬 생성을 위한 템플릿 |

### 2d: 설치 실행

선택한 각 스킬에 대해 전체 스킬 디렉터리를 복사:
```bash
cp -r $ECC_ROOT/skills/<skill-name> $TARGET/skills/
```

참고: `continuous-learning`과 `continuous-learning-v2`에는 추가 파일(config.json, hooks, scripts)이 있으므로 SKILL.md만이 아닌 전체 디렉터리를 복사해야 합니다.

---

## 3단계: 규칙 선택 및 설치

`multiSelect: true`로 `AskUserQuestion` 사용:

```
질문: "어떤 규칙 세트를 설치하시겠습니까?"
옵션:
  - "공통 규칙 (권장)" — "언어 독립적 원칙: 코딩 스타일, git 워크플로우, 테스팅, 보안 등 (8개 파일)"
  - "TypeScript/JavaScript" — "TS/JS 패턴, 훅, Playwright 테스팅 (5개 파일)"
  - "Python" — "Python 패턴, pytest, black/ruff 포매팅 (5개 파일)"
  - "Go" — "Go 패턴, 테이블 기반 테스트, gofmt/staticcheck (5개 파일)"
```

설치 실행:
```bash
# 공통 규칙 (rules/에 단순 복사)
cp -r $ECC_ROOT/rules/common/* $TARGET/rules/

# 언어별 규칙 (rules/에 단순 복사)
cp -r $ECC_ROOT/rules/typescript/* $TARGET/rules/   # 선택 시
cp -r $ECC_ROOT/rules/python/* $TARGET/rules/        # 선택 시
cp -r $ECC_ROOT/rules/golang/* $TARGET/rules/        # 선택 시
```

**중요**: 사용자가 공통 규칙은 선택하지 않고 언어별 규칙을 선택한 경우, 다음과 같이 경고:
> "언어별 규칙은 공통 규칙을 확장합니다. 공통 규칙 없이 설치하면 불완전한 커버리지가 발생할 수 있습니다. 공통 규칙도 설치하시겠습니까?"

---

## 4단계: 설치 후 확인

설치 후 다음 자동 검사 수행:

### 4a: 파일 존재 확인

설치된 모든 파일을 나열하고 대상 위치에 존재하는지 확인:
```bash
ls -la $TARGET/skills/
ls -la $TARGET/rules/
```

### 4b: 경로 참조 확인

설치된 `.md` 파일의 경로 참조를 스캔:
```bash
grep -rn "~/.claude/" $TARGET/skills/ $TARGET/rules/
grep -rn "../common/" $TARGET/rules/
grep -rn "skills/" $TARGET/skills/
```

**프로젝트 수준 설치의 경우**, `~/.claude/` 경로 참조에 플래그:
- 스킬이 `~/.claude/settings.json`을 참조하는 경우 — 설정은 항상 사용자 수준이므로 일반적으로 괜찮음
- 스킬이 `~/.claude/skills/` 또는 `~/.claude/rules/`를 참조하는 경우 — 프로젝트 수준만 설치된 경우 손상될 수 있음
- 스킬이 다른 스킬을 이름으로 참조하는 경우 — 참조된 스킬도 설치됐는지 확인

### 4c: 스킬 간 상호 참조 확인

일부 스킬은 다른 스킬을 참조합니다. 다음 의존성을 확인:
- `django-tdd`는 `django-patterns`를 참조할 수 있음
- `springboot-tdd`는 `springboot-patterns`를 참조할 수 있음
- `continuous-learning-v2`는 `~/.claude/homunculus/` 디렉터리를 참조
- `python-testing`은 `python-patterns`를 참조할 수 있음
- `golang-testing`은 `golang-patterns`를 참조할 수 있음
- 언어별 규칙은 `common/` 대응 규칙을 참조

### 4d: 문제 보고

발견된 각 문제에 대해 보고:
1. **파일**: 문제가 있는 참조를 포함한 파일
2. **줄**: 줄 번호
3. **문제**: 잘못된 내용 (예: "~/.claude/skills/python-patterns를 참조하지만 python-patterns가 설치되지 않음")
4. **제안된 수정**: 해야 할 일 (예: "python-patterns 스킬 설치" 또는 ".claude/skills/로 경로 업데이트")

---

## 5단계: 설치된 파일 최적화 (선택 사항)

`AskUserQuestion` 사용:

```
질문: "설치된 파일을 프로젝트에 맞게 최적화하시겠습니까?"
옵션:
  - "스킬 최적화" — "관련 없는 섹션 제거, 경로 조정, 기술 스택에 맞게 조정"
  - "규칙 최적화" — "커버리지 목표 조정, 프로젝트별 패턴 추가, 도구 설정 커스터마이징"
  - "둘 다 최적화" — "설치된 모든 파일 전체 최적화"
  - "건너뜀" — "모든 것을 그대로 유지"
```

### 스킬 최적화 시:
1. 설치된 각 SKILL.md 읽기
2. 아직 알려지지 않았다면 사용자의 프로젝트 기술 스택 질문
3. 각 스킬에 대해 관련 없는 섹션 제거 제안
4. 소스 저장소가 아닌 설치 대상에서 SKILL.md 파일 직접 편집
5. 4단계에서 발견된 경로 문제 수정

### 규칙 최적화 시:
1. 설치된 각 규칙 .md 파일 읽기
2. 사용자 선호도 질문:
   - 테스트 커버리지 목표 (기본값 80%)
   - 선호하는 포매팅 도구
   - Git 워크플로우 관례
   - 보안 요구사항
3. 설치 대상에서 규칙 파일 직접 편집

**중요**: 설치 대상(`$TARGET/`)의 파일만 수정하고, ECC 소스 저장소(`$ECC_ROOT/`)의 파일은 절대 수정하지 않습니다.

---

## 6단계: 설치 요약

`/tmp`에서 복제된 저장소를 정리:

```bash
rm -rf /tmp/everything-claude-code
```

그런 다음 요약 보고서 출력:

```
## ECC 설치 완료

### 설치 대상
- 수준: [사용자 수준 / 프로젝트 수준 / 둘 다]
- 경로: [대상 경로]

### 설치된 스킬 ([수])
- skill-1, skill-2, skill-3, ...

### 설치된 규칙 ([수])
- common (8개 파일)
- typescript (5개 파일)
- ...

### 확인 결과
- [수]개의 문제 발견, [수]개 수정됨
- [남은 문제 나열]

### 적용된 최적화
- [변경 사항 나열, 또는 "없음"]
```

---

## 문제 해결

### "스킬이 Claude Code에서 인식되지 않음"
- 스킬 디렉터리에 `SKILL.md` 파일이 있는지 확인 (단순 .md 파일이 아닌)
- 사용자 수준: `~/.claude/skills/<skill-name>/SKILL.md` 존재 확인
- 프로젝트 수준: `.claude/skills/<skill-name>/SKILL.md` 존재 확인

### "규칙이 작동하지 않음"
- 규칙은 하위 디렉터리가 아닌 단순 파일: `$TARGET/rules/coding-style.md` (올바름) vs `$TARGET/rules/common/coding-style.md` (단순 설치에서는 잘못됨)
- 규칙 설치 후 Claude Code 재시작

### "프로젝트 수준 설치 후 경로 참조 오류"
- 일부 스킬은 `~/.claude/` 경로를 가정합니다. 4단계 확인을 실행하여 찾아 수정하세요.
- `continuous-learning-v2`의 경우, `~/.claude/homunculus/` 디렉터리는 항상 사용자 수준입니다 — 이는 정상이며 오류가 아닙니다.
