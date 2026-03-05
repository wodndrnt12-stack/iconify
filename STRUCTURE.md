# ECC (Everything Claude Code) 폴더 구조 가이드

> **이 문서는 `C:\Users\jjw30\Desktop\Reference` 디렉터리의 전체 구조를 설명합니다.**
> 이 저장소는 Claude Code를 위한 프로덕션 수준의 플러그인 모음이며,
> 각 폴더는 `.claude/` 디렉터리에 복사하여 사용하는 것을 전제로 설계되어 있습니다.

---

## 전체 디렉터리 구조

```
Reference/
├── agents/          # 전문 서브에이전트 정의 (13개)
├── commands/        # 슬래시 명령어 정의 (35개)
├── contexts/        # 모드별 동작 지침 (3개)
├── docs/            # 심화 참고 문서
├── examples/        # CLAUDE.md 예시 모음
├── hooks/           # 이벤트 기반 자동화 설정
├── mcp-configs/     # MCP 서버 설정
├── plugins/         # 플러그인 메타데이터 스키마
├── rules/           # 언어·도메인별 영속 규칙
├── schemas/         # JSON 스키마 정의
├── scripts/         # 훅·설정 유틸리티 (Node.js)
├── skills/          # 워크플로우 스킬 정의 (55개)
├── AGENTS.md        # 에이전트 지침 (AGENTS.md 로드용)
├── CLAUDE.md        # 프로젝트 전체 지침
├── CONTRIBUTING.md  # 기여 가이드
├── README.md        # 설치 및 사용 가이드
├── the-longform-guide.md    # Claude Code 심화 가이드
├── the-openclaw-guide.md    # OpenClaw 보안 분석
├── the-security-guide.md    # 에이전트 보안 단문 가이드
└── the-shortform-guide.md   # Claude Code 빠른 시작 가이드
```

---

## 루트 MD 파일

### `CLAUDE.md`
**역할:** Claude Code가 프로젝트 진입 시 자동으로 로드하는 **핵심 지침 파일**

- 프로젝트 개요 및 아키텍처 설명
- 테스트 실행 방법 (`node tests/run-all.js`)
- 주요 슬래시 명령어 목록 (`/tdd`, `/plan`, `/e2e` 등)
- 훅 동작 방식 요약
- 컴포넌트별 역할 설명 (agents, skills, commands, hooks, rules, mcp-configs, scripts)

> **사용법:** `.claude/CLAUDE.md`에 복사하거나, 프로젝트 루트에 배치하면 Claude Code가 세션 시작 시 자동 읽음

---

### `AGENTS.md`
**역할:** Claude Code 및 다른 AI 에이전트(Gemini CLI, Codex 등)를 위한 **에이전트 오케스트레이션 지침**

- 핵심 원칙 5가지 (에이전트 우선, 테스트 주도, 보안 우선, 불변성, 실행 전 계획)
- 13개 전문 에이전트 목록과 각 사용 시점
- 에이전트 자동 활성화 규칙 (복잡한 기능 요청 → planner, 코드 작성 후 → code-reviewer 등)
- 코딩 표준 (타입 안전성, 불변 데이터, 모듈화)
- 훅 자동화 동작 방식

> **사용법:** 루트에 `AGENTS.md`로 배치하면 Claude Code, Gemini CLI, Codex 등이 공통 에이전트 지침으로 읽음

---

### `README.md`
설치 방법, 빠른 시작, 플러그인 구조 개요를 담은 일반 사용자용 문서

### `CONTRIBUTING.md`
새 스킬·에이전트·명령어 추가 시 따라야 할 기여 가이드라인

---

## 폴더별 상세 설명

---

### `agents/` — 전문 서브에이전트 (13개)

**역할:** 도메인별 전문 작업을 수행하는 **서브에이전트 프롬프트 정의**

각 `.md` 파일은 Claude Code의 `Agent` 도구로 호출 가능한 전문 에이전트의 지침서입니다.

| 파일 | 에이전트 | 주요 역할 |
|------|--------|---------|
| `planner.md` | planner | 복잡한 기능 구현 계획 수립 |
| `architect.md` | architect | 시스템 설계·확장성 아키텍처 결정 |
| `tdd-guide.md` | tdd-guide | 테스트 주도 개발 가이드 |
| `code-reviewer.md` | code-reviewer | 코드 품질·유지보수성 리뷰 |
| `security-reviewer.md` | security-reviewer | 취약점 탐지 및 보안 감사 |
| `build-error-resolver.md` | build-error-resolver | 빌드·타입 오류 수정 |
| `e2e-runner.md` | e2e-runner | Playwright E2E 테스팅 실행 |
| `refactor-cleaner.md` | refactor-cleaner | 죽은 코드 제거 및 정리 |
| `doc-updater.md` | doc-updater | 문서·코드맵 자동 업데이트 |
| `go-reviewer.md` | go-reviewer | Go 코드 전문 리뷰 |
| `go-build-resolver.md` | go-build-resolver | Go 빌드 오류 전문 수정 |
| `database-reviewer.md` | database-reviewer | PostgreSQL/Supabase 스키마·쿼리 최적화 |
| `python-reviewer.md` | python-reviewer | Python 코드 전문 리뷰 |

**활용 패턴:**
```
복잡한 기능 요청 → planner 에이전트
코드 작성/수정 후 → code-reviewer 에이전트 (자동 또는 수동 호출)
버그 수정·새 기능 → tdd-guide 에이전트
보안 민감 코드 → security-reviewer 에이전트
```

---

### `commands/` — 슬래시 명령어 (35개)

**역할:** `/tdd`, `/plan` 같은 **사용자 호출 슬래시 명령어 정의**

각 `.md` 파일이 하나의 슬래시 명령어가 되며, 명령어 이름은 파일명과 일치합니다.

#### 핵심 개발 명령어

| 명령어 | 파일 | 기능 |
|--------|------|------|
| `/tdd` | `tdd.md` | 테스트 주도 개발 전체 워크플로우 실행 |
| `/plan` | `plan.md` | 구현 계획 수립 (planner 에이전트 호출) |
| `/e2e` | `e2e.md` | E2E 테스트 생성 및 실행 |
| `/code-review` | `code-review.md` | 코드 품질 리뷰 |
| `/build-fix` | `build-fix.md` | 빌드 오류 자동 수정 |
| `/verify` | `verify.md` | 전체 검증 루프 실행 |
| `/refactor-clean` | `refactor-clean.md` | 코드 정리·리팩토링 |
| `/test-coverage` | `test-coverage.md` | 테스트 커버리지 분석 |

#### Go 전용 명령어

| 명령어 | 파일 | 기능 |
|--------|------|------|
| `/go-build` | `go-build.md` | Go 빌드 오류 수정 |
| `/go-review` | `go-review.md` | Go 코드 리뷰 |
| `/go-test` | `go-test.md` | Go 테스트 실행 |

#### 멀티 에이전트 오케스트레이션 명령어

| 명령어 | 파일 | 기능 |
|--------|------|------|
| `/orchestrate` | `orchestrate.md` | 여러 에이전트 병렬 오케스트레이션 |
| `/multi-plan` | `multi-plan.md` | 멀티 에이전트 계획 수립 |
| `/multi-backend` | `multi-backend.md` | 백엔드 멀티 에이전트 작업 |
| `/multi-frontend` | `multi-frontend.md` | 프론트엔드 멀티 에이전트 작업 |
| `/multi-workflow` | `multi-workflow.md` | 전체 워크플로우 멀티 에이전트 실행 |
| `/multi-execute` | `multi-execute.md` | 멀티 에이전트 실행 조정 |

#### 학습·개선 명령어

| 명령어 | 파일 | 기능 |
|--------|------|------|
| `/learn` | `learn.md` | 세션에서 패턴 학습 |
| `/learn-eval` | `learn-eval.md` | 학습 결과 평가 |
| `/eval` | `eval.md` | 에이전트 성능 평가 |
| `/evolve` | `evolve.md` | 스킬·명령어 진화 개선 |
| `/skill-create` | `skill-create.md` | 새 스킬 생성 |
| `/update-codemaps` | `update-codemaps.md` | 코드맵 업데이트 |
| `/update-docs` | `update-docs.md` | 문서 업데이트 |

#### 세션·프로젝트 관리 명령어

| 명령어 | 파일 | 기능 |
|--------|------|------|
| `/checkpoint` | `checkpoint.md` | 세션 상태 체크포인트 저장 |
| `/sessions` | `sessions.md` | 세션 관리 |
| `/projects` | `projects.md` | 프로젝트 관리 |
| `/instinct-status` | `instinct-status.md` | 학습된 본능 상태 확인 |
| `/instinct-export` | `instinct-export.md` | 학습 본능 내보내기 |
| `/instinct-import` | `instinct-import.md` | 학습 본능 가져오기 |

#### 기타 유틸리티 명령어

| 명령어 | 파일 | 기능 |
|--------|------|------|
| `/pm2` | `pm2.md` | PM2 프로세스 관리 |
| `/setup-pm` | `setup-pm.md` | 패키지 매니저 설정 |
| `/promote` | `promote.md` | 스테이징→프로덕션 승격 |
| `/claw` | `claw.md` | ECC 플러그인 자체 관련 |
| `/python-review` | `python-review.md` | Python 코드 리뷰 |

---

### `skills/` — 워크플로우 스킬 (55개)

**역할:** 도메인 지식과 워크플로우를 담은 **재사용 가능한 스킬 정의**

각 스킬은 독립 폴더로 구성되며, `SKILL.md` 파일이 핵심입니다.

```
skills/
└── [skill-name]/
    ├── SKILL.md          # 스킬 정의 (500줄 이하 원칙)
    ├── reference.md      # 상세 참조 (선택)
    └── examples.md       # 예시 (선택)
```

#### 언어·프레임워크별 패턴 스킬

| 스킬 | 설명 |
|------|------|
| `python-patterns/` | Python 아키텍처 패턴 및 모범 사례 |
| `python-testing/` | pytest 기반 Python 테스팅 전략 |
| `golang-patterns/` | Go 아키텍처 패턴 |
| `golang-testing/` | Go 테스팅 전략 |
| `django-patterns/` | Django 아키텍처 패턴, DRF REST API |
| `django-tdd/` | pytest-django TDD 방법론 |
| `django-security/` | Django 보안 모범 사례, CSRF, XSS 방지 |
| `django-verification/` | Django 배포 전 검증 루프 |
| `springboot-patterns/` | Spring Boot 아키텍처 패턴 |
| `springboot-tdd/` | Spring Boot TDD |
| `springboot-security/` | Spring Boot 보안 |
| `springboot-verification/` | Spring Boot 검증 루프 |
| `java-coding-standards/` | Java 코딩 표준 |
| `jpa-patterns/` | JPA/Hibernate 패턴 |
| `cpp-coding-standards/` | C++ 코딩 표준 |
| `cpp-testing/` | C++ 테스팅 |
| `swift-concurrency-6-2/` | Swift 6.2 동시성 패턴 |
| `swift-actor-persistence/` | Swift Actor 기반 영속성 |
| `swift-protocol-di-testing/` | Swift 프로토콜·DI·테스팅 |
| `swiftui-patterns/` | SwiftUI 패턴 |
| `frontend-patterns/` | 프론트엔드 아키텍처 패턴 |

#### 인프라·배포 스킬

| 스킬 | 설명 |
|------|------|
| `deployment-patterns/` | 롤링·블루-그린·카나리 배포 전략 |
| `docker-patterns/` | Docker 컨테이너화 패턴 |
| `database-migrations/` | 데이터베이스 마이그레이션 전략 |
| `postgres-patterns/` | PostgreSQL 패턴 및 최적화 |
| `clickhouse-io/` | ClickHouse 분석 쿼리 패턴 |

#### AI·LLM 스킬

| 스킬 | 설명 |
|------|------|
| `eval-harness/` | LLM 평가 하네스 구축 |
| `cost-aware-llm-pipeline/` | 비용 인식 LLM 파이프라인 |
| `foundation-models-on-device/` | 온디바이스 파운데이션 모델 |
| `iterative-retrieval/` | 반복적 검색 패턴 (RAG 개선) |
| `regex-vs-llm-structured-text/` | 정규식 vs LLM 구조화 텍스트 판단 기준 |

#### 보안·코드 품질 스킬

| 스킬 | 설명 |
|------|------|
| `security-review/` | 보안 코드 리뷰 체크리스트 |
| `security-scan/` | 자동화 보안 스캔 워크플로우 |
| `coding-standards/` | 범용 코딩 표준 |
| `tdd-workflow/` | TDD 전체 워크플로우 |
| `verification-loop/` | 배포 전 검증 루프 |
| `e2e-testing/` | E2E 테스팅 전략 |
| `backend-patterns/` | 백엔드 아키텍처 패턴 |
| `api-design/` | API 설계 원칙 |

#### 워크플로우·생산성 스킬

| 스킬 | 설명 |
|------|------|
| `continuous-learning/` | Claude Code 지속 학습 워크플로우 |
| `continuous-learning-v2/` | 지속 학습 v2 (개선 버전) |
| `configure-ecc/` | ECC 플러그인 설정 워크플로우 |
| `skill-stocktake/` | 스킬 목록 점검 및 정리 |
| `search-first/` | 검색 우선 개발 패턴 |
| `content-hash-cache-pattern/` | 콘텐츠 해시 캐싱 패턴 |

#### 콘텐츠·문서 스킬

| 스킬 | 설명 |
|------|------|
| `article-writing/` | 기술 아티클 작성 워크플로우 |
| `content-engine/` | 콘텐츠 생성 엔진 |
| `frontend-slides/` | 프론트엔드 슬라이드 생성 |
| `market-research/` | 시장 조사 워크플로우 |
| `investor-materials/` | 투자자 자료 작성 |
| `investor-outreach/` | 투자자 아웃리치 |
| `strategic-compact/` | 전략적 컨텍스트 압축 관리 |
| `visa-doc-translate/` | 비자 서류 번역 워크플로우 |
| `nutrient-document-processing/` | 영양 문서 처리 |
| `project-guidelines-example/` | 프로젝트 가이드라인 예시 |
| `liquid-glass-design/` | Liquid Glass 디자인 패턴 |

---

### `contexts/` — 모드별 동작 지침 (3개)

**역할:** 세션의 **현재 모드**에 따라 Claude의 동작 방식을 조정하는 컨텍스트 지침

| 파일 | 모드 | 핵심 동작 |
|------|------|---------|
| `dev.md` | 개발 모드 | 코드 우선 작성, 빠른 반복, 원자적 커밋 |
| `research.md` | 리서치 모드 | 정보 수집·분석 우선, 판단 보류 |
| `review.md` | 리뷰 모드 | 품질·보안·성능 다각도 검토 |

**활용 방법:**
```
# 개발 중일 때
/read contexts/dev.md

# 코드 리뷰할 때
/read contexts/review.md

# 기술 리서치할 때
/read contexts/research.md
```

> 컨텍스트 파일은 세션 전체 동작 방식을 바꾸는 "모드 전환 스위치" 역할

---

### `hooks/` — 이벤트 기반 자동화

**역할:** 도구 실행 전후에 자동으로 실행되는 **자동화 훅 설정**

```
hooks/
├── hooks.json   # 훅 설정 파일 (Claude Code에서 직접 읽음)
└── README.md    # 훅 작성·커스터마이징 가이드
```

#### `hooks.json` — 핵심 설정 파일

Claude Code의 훅 이벤트와 실행할 스크립트를 매핑합니다.

| 이벤트 | 훅 종류 | 동작 |
|--------|--------|------|
| `PreToolUse` (Bash) | 개발 서버 차단 | tmux 외부에서 `npm run dev` 실행 시 차단 |
| `PreToolUse` (Bash) | tmux 알림 | 장시간 명령 전 tmux 사용 제안 |
| `PreToolUse` (Bash) | git push 알림 | 푸시 전 변경사항 검토 알림 |
| `PreToolUse` (Write) | 문서 파일 경고 | 비표준 `.md`·`.txt` 파일 생성 시 경고 |
| `PreToolUse` (Edit\|Write) | 전략적 compact | ~50회 도구 호출 시 `/compact` 제안 |
| `PostToolUse` (Bash) | PR 로거 | `gh pr create` 후 PR URL 로깅 |
| `PostToolUse` (Bash) | 빌드 분석 | 빌드 명령 후 백그라운드 분석 |
| `PostToolUse` (Edit) | Prettier 포맷 | JS/TS 파일 편집 후 자동 포맷 |
| `PostToolUse` (Edit) | TypeScript 체크 | `.ts`·`.tsx` 편집 후 `tsc --noEmit` 실행 |
| `PostToolUse` (Edit) | console.log 경고 | 편집 파일의 console.log 사용 감지 |
| `SessionStart` | 세션 시작 | 이전 컨텍스트 로드, 패키지 매니저 감지 |
| `PreCompact` | compact 전처리 | 컨텍스트 압축 전 상태 저장 |
| `Stop` | console.log 감사 | 응답마다 수정된 파일의 console.log 전체 검사 |
| `SessionEnd` | 세션 종료 | 다음 세션을 위한 상태 영속화 |
| `SessionEnd` | 패턴 추출 | 세션에서 학습 가능한 패턴 평가 |

---

### `mcp-configs/` — MCP 서버 설정

**역할:** Claude Code에서 사용할 **MCP(Model Context Protocol) 서버 목록 및 설정**

```
mcp-configs/
└── mcp-servers.json   # MCP 서버 설정 템플릿
```

#### `mcp-servers.json` — 서버 목록

> **사용법:** 필요한 서버를 골라 `~/.claude.json`의 `mcpServers` 섹션에 복사

| 서버 | 기능 | 인증 |
|------|------|------|
| `github` | GitHub PR·이슈·저장소 작업 | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| `firecrawl` | 웹 크롤링·스크래핑 | `FIRECRAWL_API_KEY` |
| `supabase` | Supabase DB 작업 | `--project-ref` 설정 필요 |
| `memory` | 세션 간 영속 메모리 | 없음 |
| `sequential-thinking` | 체인-오브-소트 추론 | 없음 |
| `vercel` | Vercel 배포·프로젝트 관리 | HTTP MCP |
| `railway` | Railway 배포 | 없음 |
| `cloudflare-docs` | Cloudflare 문서 검색 | HTTP MCP |
| `cloudflare-workers-builds` | Cloudflare Workers 빌드 | HTTP MCP |
| `clickhouse` | ClickHouse 분석 쿼리 | HTTP MCP |
| `exa-web-search` | 웹 검색·리서치 | `EXA_API_KEY` |
| `context7` | 라이브 문서 조회 | 없음 |
| `magic` | Magic UI 컴포넌트 | 없음 |
| `filesystem` | 파일시스템 작업 | 경로 설정 필요 |

> ⚠️ **주의:** MCP 서버를 10개 이상 활성화하면 컨텍스트 윈도우가 심각하게 줄어듭니다.
> 실제로 사용하는 서버만 활성화하세요.

---

### `scripts/` — 훅·설정 유틸리티 (Node.js)

**역할:** 훅 스크립트, 코드맵 생성, CI, 설정 유틸리티를 담은 **Node.js 스크립트 모음**

```
scripts/
├── hooks/                  # 훅 구현 스크립트
│   ├── check-console-log.js
│   ├── doc-file-warning.js
│   ├── evaluate-session.js
│   ├── post-edit-console-warn.js
│   ├── post-edit-format.js
│   ├── post-edit-typecheck.js
│   ├── pre-compact.js
│   ├── pre-write-doc-warn.js
│   ├── session-end.js
│   └── session-start.js
├── codemaps/               # 코드맵 생성 스크립트
│   └── generate.ts
├── lib/                    # 공유 유틸리티 라이브러리
│   ├── package-manager.js  # 패키지 매니저 감지 (npm/yarn/pnpm/bun)
│   ├── session-manager.js  # 세션 상태 관리
│   ├── session-aliases.js  # 세션 별칭 처리
│   └── utils.js            # 공통 유틸리티 함수
├── ci/                     # CI 검증 스크립트
│   ├── validate-agents.js
│   ├── validate-commands.js
│   ├── validate-hooks.js
│   ├── validate-rules.js
│   └── validate-skills.js
├── claw.js                 # ECC 플러그인 CLI 도구
├── release.sh              # 릴리스 자동화 스크립트
├── setup-package-manager.js  # 패키지 매니저 초기화
└── skill-create-output.js  # 스킬 생성 출력 처리
```

#### 주요 스크립트 설명

**`scripts/hooks/`** — `hooks.json`에서 참조하는 실제 훅 구현체
- `session-start.js` — 세션 시작 시 이전 상태 로드
- `session-end.js` — 세션 종료 시 상태 저장
- `post-edit-format.js` — 편집 후 Prettier 자동 포맷
- `post-edit-typecheck.js` — TypeScript 타입 체크
- `check-console-log.js` — console.log 사용 감지

**`scripts/lib/`** — 재사용 유틸리티
- `package-manager.js` — npm/yarn/pnpm/bun 자동 감지
- `session-manager.js` — 세션 상태 읽기/쓰기

**`scripts/ci/`** — CI 파이프라인에서 구조 검증
- `validate-skills.js` — 스킬 YAML frontmatter 및 구조 검증
- `validate-agents.js` — 에이전트 파일 구조 검증
- `validate-commands.js` — 명령어 파일 구조 검증

---

### `rules/` — 언어·도메인별 영속 규칙

**역할:** 모든 세션에 걸쳐 **항상 적용되어야 하는 규칙과 표준**

```
rules/
├── common/          # 언어 무관 공통 규칙 (9개)
│   ├── agents.md
│   ├── coding-style.md
│   ├── development-workflow.md
│   ├── git-workflow.md
│   ├── hooks.md
│   ├── patterns.md
│   ├── performance.md
│   ├── security.md
│   └── testing.md
├── golang/          # Go 전용 규칙 (5개)
│   ├── coding-style.md
│   ├── hooks.md
│   ├── patterns.md
│   ├── security.md
│   └── testing.md
├── python/          # Python 전용 규칙 (5개)
├── swift/           # Swift 전용 규칙 (5개)
├── typescript/      # TypeScript 전용 규칙 (5개)
└── README.md
```

| 규칙 파일 | 내용 |
|----------|------|
| `common/security.md` | 입력값 검증, SQL 인젝션 방지, 시크릿 관리 |
| `common/testing.md` | 80%+ 커버리지, TDD 사이클, 테스트 구조 |
| `common/coding-style.md` | 네이밍 컨벤션, 파일 크기 제한, 모듈화 |
| `common/git-workflow.md` | 커밋 메시지 형식, 브랜치 전략 |
| `common/performance.md` | N+1 쿼리 방지, 캐싱 전략, 메모리 관리 |
| `common/agents.md` | 에이전트 사용 시점 및 오케스트레이션 규칙 |
| `common/hooks.md` | 훅 아키텍처 가이드라인 |
| `common/patterns.md` | 설계 패턴 및 아키텍처 원칙 |
| `common/development-workflow.md` | 개발 프로세스 및 릴리스 워크플로우 |

---

### `docs/` — 심화 참고 문서

```
docs/
└── token-optimization.md   # 컨텍스트 및 토큰 비용 최적화 전략
```

**`token-optimization.md`:** 긴 세션에서 토큰 사용 비용을 줄이는 전략
- 컨텍스트 윈도우 관리 방법
- `/compact` 활용 시점
- 효율적인 프롬프트 작성 패턴

---

### `examples/` — CLAUDE.md 예시 모음

**역할:** 다양한 프로젝트 유형에 맞게 `CLAUDE.md`를 작성하는 **참조 예시**

| 파일 | 대상 프로젝트 |
|------|-------------|
| `CLAUDE.md` | 범용 CLAUDE.md 예시 |
| `django-api-CLAUDE.md` | Django REST API 프로젝트 |
| `go-microservice-CLAUDE.md` | Go 마이크로서비스 |
| `rust-api-CLAUDE.md` | Rust API 서버 |
| `saas-nextjs-CLAUDE.md` | Next.js SaaS 애플리케이션 |
| `user-CLAUDE.md` | 사용자 글로벌 CLAUDE.md 예시 |

---

### `schemas/` — JSON 스키마 정의

```
schemas/
├── hooks.schema.json          # hooks.json 유효성 검증 스키마
├── package-manager.schema.json  # 패키지 매니저 설정 스키마
└── plugin.schema.json         # 플러그인 메타데이터 스키마
```

새 훅이나 플러그인 작성 시 이 스키마를 참조해 올바른 구조로 작성합니다.

---

### `plugins/` — 플러그인 메타데이터

```
plugins/
└── README.md   # 플러그인 시스템 설명 및 등록 방법
```

ECC 자체를 Claude Code 플러그인으로 등록하거나, 서드파티 플러그인을 추가하는 방법을 안내합니다.

---

## 가이드 문서 (루트 MD)

| 파일 | 내용 |
|------|------|
| `the-shortform-guide.md` | Claude Code 빠른 시작 — 설치, 기본 설정, 핵심 명령어 |
| `the-longform-guide.md` | Claude Code 심화 — 고급 패턴, 멀티 에이전트, 워크플로우 |
| `the-security-guide.md` | 에이전트 보안 단문 가이드 — 공격 벡터, 샌드박싱, OWASP Top 10 |
| `the-openclaw-guide.md` | OpenClaw 보안 분석 — 다중 채널 에이전트의 위험성과 대안 |

---

## 폴더 간 의존 관계

```
CLAUDE.md ──────────────────────────── 프로젝트 진입점
    │
    ├── agents/ ←── AGENTS.md          에이전트 호출 지침
    │     └── commands/ 에서 호출       슬래시 명령어가 에이전트 위임
    │
    ├── skills/ ←── commands/ 에서 로드  명령어가 스킬 워크플로우 실행
    │
    ├── hooks/
    │     └── scripts/hooks/ ←── 실제 구현체
    │
    ├── rules/ ────────────────────────  항상 적용 (언어별 자동 로드)
    │
    ├── contexts/ ──────────────────────  세션 모드 전환 (수동 로드)
    │
    └── mcp-configs/ ───────────────────  외부 도구 연결 (설정 시 1회)
```

---

## 설치 및 적용 방법

### 전체 적용 (권장)
```bash
# install.sh 실행 — .claude/ 디렉터리에 자동 설치
bash install.sh
```

### 수동 선택 적용
필요한 폴더만 골라 `~/.claude/` 또는 프로젝트 `.claude/`에 복사:

```bash
# 예: 에이전트와 명령어만 적용
cp -r agents/ ~/.claude/agents/
cp -r commands/ ~/.claude/commands/

# 예: 스킬 하나만 적용
cp -r skills/tdd-workflow/ ~/.claude/skills/tdd-workflow/
```

---

*이 문서는 `C:\Users\jjw30\Desktop\Reference` 디렉터리 분석을 기반으로 생성되었습니다.*
