**언어:** English | [繁體中文](docs/zh-TW/README.md)

# Everything Claude Code

[![Stars](https://img.shields.io/github/stars/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/stargazers)
[![Forks](https://img.shields.io/github/forks/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/network/members)
[![Contributors](https://img.shields.io/github/contributors/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/graphs/contributors)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white)
![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white)
![Java](https://img.shields.io/badge/-Java-ED8B00?logo=openjdk&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

> **50K+ 스타** | **6K+ 포크** | **30명 기여자** | **6개 언어 지원** | **Anthropic 해커톤 수상**

---

<div align="center">

**🌐 Language / 语言 / 語言**

[**English**](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](docs/zh-TW/README.md) | [日本語](docs/ja-JP/README.md)

</div>

---

**AI 에이전트 하네스를 위한 성능 최적화 시스템. Anthropic 해커톤 수상작.**

단순한 설정이 아닙니다. 완전한 시스템입니다: skills, instincts, 메모리 최적화, 지속적 학습, 보안 스캔, 리서치 우선 개발. 실제 제품을 구축하면서 10개월 이상 집중적으로 매일 사용하며 발전시킨 프로덕션 준비 에이전트, 훅, 명령어, 규칙, MCP 설정.

**Claude Code**, **Codex**, **Cowork** 및 다른 AI 에이전트 하네스에서 작동합니다.

---

## 가이드

이 저장소는 순수 코드입니다. 가이드에서 모든 것을 설명합니다.

<table>
<tr>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2012378465664745795">
<img src="https://github.com/user-attachments/assets/1a471488-59cc-425b-8345-5245c7efbcef" alt="The Shorthand Guide to Everything Claude Code" />
</a>
</td>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2014040193557471352">
<img src="https://github.com/user-attachments/assets/c9ca43bc-b149-427f-b551-af6840c368f0" alt="The Longform Guide to Everything Claude Code" />
</a>
</td>
</tr>
<tr>
<td align="center"><b>단축 가이드</b><br/>설정, 기초, 철학. <b>먼저 읽으세요.</b></td>
<td align="center"><b>상세 가이드</b><br/>토큰 최적화, 메모리 지속성, 평가, 병렬화.</td>
</tr>
</table>

| 주제 | 학습 내용 |
|------|-----------|
| 토큰 최적화 | 모델 선택, 시스템 프롬프트 슬리밍, 백그라운드 프로세스 |
| 메모리 지속성 | 세션 간 컨텍스트를 자동으로 저장/로드하는 훅 |
| 지속적 학습 | 세션에서 패턴을 자동으로 추출하여 재사용 가능한 skills로 |
| 검증 루프 | 체크포인트 vs 지속적 평가, 채점자 유형, pass@k 지표 |
| 병렬화 | Git worktree, 캐스케이드 방법, 인스턴스 확장 시점 |
| 서브에이전트 오케스트레이션 | 컨텍스트 문제, 반복적 검색 패턴 |

---

## 새로운 기능

### v1.7.0 — 크로스 플랫폼 확장 & 프레젠테이션 빌더 (2026년 2월)

- **Codex 앱 + CLI 지원** — 직접 `AGENTS.md` 기반 Codex 지원, 설치 타깃팅, Codex 문서
- **`frontend-slides` skill** — 의존성 없는 HTML 프레젠테이션 빌더, PPTX 변환 가이드, 엄격한 뷰포트 맞춤 규칙
- **5개 새 비즈니스/콘텐츠 skills** — `article-writing`, `content-engine`, `market-research`, `investor-materials`, `investor-outreach`
- **더 넓은 도구 지원** — Cursor, Codex, OpenCode 지원이 강화되어 동일한 저장소가 모든 주요 하네스에서 깔끔하게 배포됨
- **992개 내부 테스트** — 플러그인, 훅, skills, 패키징 전반의 검증 및 회귀 커버리지 확장

### v1.6.0 — Codex CLI, AgentShield & 마켓플레이스 (2026년 2월)

- **Codex CLI 지원** — 새 `/codex-setup` 명령어로 OpenAI Codex CLI 호환을 위한 `codex.md` 생성
- **7개 새 skills** — `search-first`, `swift-actor-persistence`, `swift-protocol-di-testing`, `regex-vs-llm-structured-text`, `content-hash-cache-pattern`, `cost-aware-llm-pipeline`, `skill-stocktake`
- **AgentShield 통합** — `/security-scan` skill이 Claude Code에서 직접 AgentShield 실행; 1282개 테스트, 102개 규칙
- **GitHub 마켓플레이스** — ECC Tools GitHub App이 [github.com/marketplace/ecc-tools](https://github.com/marketplace/ecc-tools)에서 무료/프로/엔터프라이즈 티어로 제공
- **30개 이상 커뮤니티 PR 병합** — 6개 언어의 30명 기여자 기여
- **978개 내부 테스트** — 에이전트, skills, 명령어, 훅, 규칙 전반의 검증 스위트 확장

### v1.4.1 — 버그 수정 (2026년 2월)

- **Instinct import 콘텐츠 손실 수정** — `/instinct-import` 중 `parse_instinct_file()`이 프론트매터 이후 모든 콘텐츠(액션, 근거, 예시 섹션)를 자동으로 삭제하던 문제. 커뮤니티 기여자 @ericcai0814가 수정 ([#148](https://github.com/affaan-m/everything-claude-code/issues/148), [#161](https://github.com/affaan-m/everything-claude-code/pull/161))

### v1.4.0 — 다국어 규칙, 설치 마법사 & PM2 (2026년 2월)

- **대화형 설치 마법사** — 새 `configure-ecc` skill이 병합/덮어쓰기 감지를 포함한 안내 설치 제공
- **PM2 & 다중 에이전트 오케스트레이션** — 복잡한 다중 서비스 워크플로우 관리를 위한 6개 새 명령어 (`/pm2`, `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend`, `/multi-workflow`)
- **다국어 규칙 아키텍처** — 규칙이 평면 파일에서 `common/` + `typescript/` + `python/` + `golang/` 디렉토리로 재구성. 필요한 언어만 설치
- **중국어 간체 (zh-CN) 번역** — 모든 에이전트, 명령어, skills, 규칙의 완전한 번역 (80개 이상 파일)
- **GitHub Sponsors 지원** — GitHub Sponsors를 통해 프로젝트 후원 가능
- **향상된 CONTRIBUTING.md** — 각 기여 유형별 상세 PR 템플릿

### v1.3.0 — OpenCode 플러그인 지원 (2026년 2월)

- **완전한 OpenCode 통합** — OpenCode의 플러그인 시스템을 통한 훅 지원이 있는 12개 에이전트, 24개 명령어, 16개 skills (20개 이상 이벤트 유형)
- **3개 네이티브 커스텀 도구** — run-tests, check-coverage, security-audit
- **LLM 문서** — 종합적인 OpenCode 문서를 위한 `llms.txt`

### v1.2.0 — 통합 명령어 & Skills (2026년 2월)

- **Python/Django 지원** — Django 패턴, 보안, TDD, 검증 skills
- **Java Spring Boot skills** — Spring Boot를 위한 패턴, 보안, TDD, 검증
- **세션 관리** — 세션 이력을 위한 `/sessions` 명령어
- **지속적 학습 v2** — 신뢰도 점수, 가져오기/내보내기, 진화가 있는 instinct 기반 학습

전체 변경 이력은 [릴리스](https://github.com/affaan-m/everything-claude-code/releases)에서 확인하세요.

---

## 빠른 시작

2분 이내에 시작하세요:

### 1단계: 플러그인 설치

```bash
# 마켓플레이스 추가
/plugin marketplace add affaan-m/everything-claude-code

# 플러그인 설치
/plugin install everything-claude-code@everything-claude-code
```

### 2단계: 규칙 설치 (필수)

> ⚠️ **중요:** Claude Code 플러그인은 `rules`를 자동으로 배포할 수 없습니다. 수동으로 설치하세요:

```bash
# 먼저 저장소 클론
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code

# 권장: 설치 스크립트 사용 (공통 + 언어 규칙을 안전하게 처리)
./install.sh typescript    # 또는 python이나 golang
# 여러 언어를 전달할 수 있습니다:
# ./install.sh typescript python golang
# 또는 cursor를 타깃으로:
# ./install.sh --target cursor typescript
```

수동 설치 지침은 `rules/` 폴더의 README를 참조하세요.

### 3단계: 사용 시작

```bash
# 명령어 시도 (플러그인 설치는 네임스페이스 형식 사용)
/everything-claude-code:plan "사용자 인증 추가"

# 수동 설치 (옵션 2)는 더 짧은 형식 사용:
# /plan "사용자 인증 추가"

# 사용 가능한 명령어 확인
/plugin list everything-claude-code@everything-claude-code
```

✨ **완료!** 이제 13개 에이전트, 56개 skills, 32개 명령어에 접근할 수 있습니다.

---

## 크로스 플랫폼 지원

이 플러그인은 이제 **Windows, macOS, Linux**를 완전히 지원합니다. 모든 훅과 스크립트가 최대 호환성을 위해 Node.js로 재작성되었습니다.

### 패키지 매니저 감지

플러그인은 다음 우선순위로 선호하는 패키지 매니저(npm, pnpm, yarn, bun)를 자동으로 감지합니다:

1. **환경 변수**: `CLAUDE_PACKAGE_MANAGER`
2. **프로젝트 설정**: `.claude/package-manager.json`
3. **package.json**: `packageManager` 필드
4. **잠금 파일**: package-lock.json, yarn.lock, pnpm-lock.yaml, bun.lockb 감지
5. **전역 설정**: `~/.claude/package-manager.json`
6. **폴백**: 사용 가능한 첫 번째 패키지 매니저

선호하는 패키지 매니저 설정:

```bash
# 환경 변수를 통해
export CLAUDE_PACKAGE_MANAGER=pnpm

# 전역 설정을 통해
node scripts/setup-package-manager.js --global pnpm

# 프로젝트 설정을 통해
node scripts/setup-package-manager.js --project bun

# 현재 설정 감지
node scripts/setup-package-manager.js --detect
```

또는 Claude Code에서 `/setup-pm` 명령어 사용.

---

## 포함 내용

이 저장소는 **Claude Code 플러그인**입니다 - 직접 설치하거나 컴포넌트를 수동으로 복사하세요.

```
everything-claude-code/
|-- .claude-plugin/   # 플러그인 및 마켓플레이스 매니페스트
|   |-- plugin.json         # 플러그인 메타데이터 및 컴포넌트 경로
|   |-- marketplace.json    # /plugin marketplace add용 마켓플레이스 카탈로그
|
|-- agents/           # 위임을 위한 전문 서브에이전트
|   |-- planner.md           # 기능 구현 계획
|   |-- architect.md         # 시스템 설계 결정
|   |-- tdd-guide.md         # 테스트 주도 개발
|   |-- code-reviewer.md     # 품질 및 보안 리뷰
|   |-- security-reviewer.md # 취약점 분석
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2E 테스트
|   |-- refactor-cleaner.md  # 데드 코드 정리
|   |-- doc-updater.md       # 문서 동기화
|   |-- go-reviewer.md       # Go 코드 리뷰
|   |-- go-build-resolver.md # Go 빌드 오류 해결
|   |-- python-reviewer.md   # Python 코드 리뷰 (신규)
|   |-- database-reviewer.md # 데이터베이스/Supabase 리뷰 (신규)
|
|-- skills/           # 워크플로우 정의 및 도메인 지식
|   |-- coding-standards/           # 언어 모범 사례
|   |-- clickhouse-io/              # ClickHouse 분석, 쿼리, 데이터 엔지니어링
|   |-- backend-patterns/           # API, 데이터베이스, 캐싱 패턴
|   |-- frontend-patterns/          # React, Next.js 패턴
|   |-- frontend-slides/            # HTML 슬라이드 덱 및 PPTX-웹 프레젠테이션 워크플로우 (신규)
|   |-- article-writing/            # 제공된 목소리로 일반적인 AI 톤 없이 장문 글쓰기 (신규)
|   |-- content-engine/             # 멀티 플랫폼 소셜 콘텐츠 및 재활용 워크플로우 (신규)
|   |-- market-research/            # 출처 표기된 시장, 경쟁사, 투자자 리서치 (신규)
|   |-- investor-materials/         # 피치덱, 원페이저, 메모, 금융 모델 (신규)
|   |-- investor-outreach/          # 개인화된 펀드레이징 아웃리치 및 후속 조치 (신규)
|   |-- continuous-learning/        # 세션에서 패턴 자동 추출 (상세 가이드)
|   |-- continuous-learning-v2/     # 신뢰도 점수가 있는 instinct 기반 학습
|   |-- iterative-retrieval/        # 서브에이전트를 위한 점진적 컨텍스트 정제
|   |-- strategic-compact/          # 수동 압축 제안 (상세 가이드)
|   |-- tdd-workflow/               # TDD 방법론
|   |-- security-review/            # 보안 체크리스트
|   |-- eval-harness/               # 검증 루프 평가 (상세 가이드)
|   |-- verification-loop/          # 지속적 검증 (상세 가이드)
|   |-- golang-patterns/            # Go 관용구 및 모범 사례
|   |-- golang-testing/             # Go 테스트 패턴, TDD, 벤치마크
|   |-- cpp-coding-standards/       # C++ Core Guidelines의 C++ 코딩 표준 (신규)
|   |-- cpp-testing/                # GoogleTest, CMake/CTest를 사용한 C++ 테스트 (신규)
|   |-- django-patterns/            # Django 패턴, 모델, 뷰 (신규)
|   |-- django-security/            # Django 보안 모범 사례 (신규)
|   |-- django-tdd/                 # Django TDD 워크플로우 (신규)
|   |-- django-verification/        # Django 검증 루프 (신규)
|   |-- python-patterns/            # Python 관용구 및 모범 사례 (신규)
|   |-- python-testing/             # pytest를 사용한 Python 테스트 (신규)
|   |-- springboot-patterns/        # Java Spring Boot 패턴 (신규)
|   |-- springboot-security/        # Spring Boot 보안 (신규)
|   |-- springboot-tdd/             # Spring Boot TDD (신규)
|   |-- springboot-verification/    # Spring Boot 검증 (신규)
|   |-- configure-ecc/              # 대화형 설치 마법사 (신규)
|   |-- security-scan/              # AgentShield 보안 감사자 통합 (신규)
|   |-- java-coding-standards/      # Java 코딩 표준 (신규)
|   |-- jpa-patterns/               # JPA/Hibernate 패턴 (신규)
|   |-- postgres-patterns/          # PostgreSQL 최적화 패턴 (신규)
|   |-- nutrient-document-processing/ # Nutrient API를 사용한 문서 처리 (신규)
|   |-- project-guidelines-example/   # 프로젝트별 skills 템플릿
|   |-- database-migrations/         # 마이그레이션 패턴 (Prisma, Drizzle, Django, Go) (신규)
|   |-- api-design/                  # REST API 설계, 페이지네이션, 오류 응답 (신규)
|   |-- deployment-patterns/         # CI/CD, Docker, 헬스 체크, 롤백 (신규)
|   |-- docker-patterns/             # Docker Compose, 네트워킹, 볼륨, 컨테이너 보안 (신규)
|   |-- e2e-testing/                 # Playwright E2E 패턴 및 Page Object Model (신규)
|   |-- content-hash-cache-pattern/  # 파일 처리를 위한 SHA-256 콘텐츠 해시 캐싱 (신규)
|   |-- cost-aware-llm-pipeline/     # LLM 비용 최적화, 모델 라우팅, 예산 추적 (신규)
|   |-- regex-vs-llm-structured-text/ # 텍스트 파싱에서 정규식 vs LLM 결정 프레임워크 (신규)
|   |-- swift-actor-persistence/     # 액터를 사용한 스레드 안전 Swift 데이터 지속성 (신규)
|   |-- swift-protocol-di-testing/   # 테스트 가능한 Swift 코드를 위한 프로토콜 기반 DI (신규)
|   |-- search-first/                # 코딩 전 리서치 워크플로우 (신규)
|   |-- skill-stocktake/             # 품질을 위한 skills 및 명령어 감사 (신규)
|   |-- liquid-glass-design/         # iOS 26 Liquid Glass 디자인 시스템 (신규)
|   |-- foundation-models-on-device/ # FoundationModels를 사용한 Apple 온디바이스 LLM (신규)
|   |-- swift-concurrency-6-2/       # Swift 6.2 접근하기 쉬운 동시성 (신규)
|
|-- commands/         # 빠른 실행을 위한 슬래시 명령어
|   |-- tdd.md              # /tdd - 테스트 주도 개발
|   |-- plan.md             # /plan - 구현 계획
|   |-- e2e.md              # /e2e - E2E 테스트 생성
|   |-- code-review.md      # /code-review - 품질 리뷰
|   |-- build-fix.md        # /build-fix - 빌드 오류 수정
|   |-- refactor-clean.md   # /refactor-clean - 데드 코드 제거
|   |-- learn.md            # /learn - 세션 중간에 패턴 추출 (상세 가이드)
|   |-- learn-eval.md       # /learn-eval - 패턴 추출, 평가, 저장 (신규)
|   |-- checkpoint.md       # /checkpoint - 검증 상태 저장 (상세 가이드)
|   |-- verify.md           # /verify - 검증 루프 실행 (상세 가이드)
|   |-- setup-pm.md         # /setup-pm - 패키지 매니저 설정
|   |-- go-review.md        # /go-review - Go 코드 리뷰 (신규)
|   |-- go-test.md          # /go-test - Go TDD 워크플로우 (신규)
|   |-- go-build.md         # /go-build - Go 빌드 오류 수정 (신규)
|   |-- skill-create.md     # /skill-create - git 이력에서 skills 생성 (신규)
|   |-- instinct-status.md  # /instinct-status - 학습된 instincts 확인 (신규)
|   |-- instinct-import.md  # /instinct-import - instincts 가져오기 (신규)
|   |-- instinct-export.md  # /instinct-export - instincts 내보내기 (신규)
|   |-- evolve.md           # /evolve - instincts를 skills로 클러스터링
|   |-- pm2.md              # /pm2 - PM2 서비스 생명주기 관리 (신규)
|   |-- multi-plan.md       # /multi-plan - 다중 에이전트 작업 분해 (신규)
|   |-- multi-execute.md    # /multi-execute - 오케스트레이션된 다중 에이전트 워크플로우 (신규)
|   |-- multi-backend.md    # /multi-backend - 백엔드 다중 서비스 오케스트레이션 (신규)
|   |-- multi-frontend.md   # /multi-frontend - 프론트엔드 다중 서비스 오케스트레이션 (신규)
|   |-- multi-workflow.md   # /multi-workflow - 일반 다중 서비스 워크플로우 (신규)
|   |-- orchestrate.md      # /orchestrate - 다중 에이전트 조정
|   |-- sessions.md         # /sessions - 세션 이력 관리
|   |-- eval.md             # /eval - 기준에 따른 평가
|   |-- test-coverage.md    # /test-coverage - 테스트 커버리지 분석
|   |-- update-docs.md      # /update-docs - 문서 업데이트
|   |-- update-codemaps.md  # /update-codemaps - 코드맵 업데이트
|   |-- python-review.md    # /python-review - Python 코드 리뷰 (신규)
|
|-- rules/            # 항상 따라야 할 지침 (~/.claude/rules/에 복사)
|   |-- README.md            # 구조 개요 및 설치 가이드
|   |-- common/              # 언어 독립적 원칙
|   |   |-- coding-style.md    # 불변성, 파일 구성
|   |   |-- git-workflow.md    # 커밋 형식, PR 프로세스
|   |   |-- testing.md         # TDD, 80% 커버리지 요구사항
|   |   |-- performance.md     # 모델 선택, 컨텍스트 관리
|   |   |-- patterns.md        # 설계 패턴, 스켈레톤 프로젝트
|   |   |-- hooks.md           # 훅 아키텍처, TodoWrite
|   |   |-- agents.md          # 서브에이전트에 위임할 시점
|   |   |-- security.md        # 필수 보안 검사
|   |-- typescript/          # TypeScript/JavaScript 특화
|   |-- python/              # Python 특화
|   |-- golang/              # Go 특화
|
|-- hooks/            # 트리거 기반 자동화
|   |-- README.md                 # 훅 문서, 레시피, 사용자 정의 가이드
|   |-- hooks.json                # 모든 훅 설정 (PreToolUse, PostToolUse, Stop 등)
|   |-- memory-persistence/       # 세션 생명주기 훅 (상세 가이드)
|   |-- strategic-compact/        # 압축 제안 (상세 가이드)
|
|-- scripts/          # 크로스 플랫폼 Node.js 스크립트 (신규)
|   |-- lib/                     # 공유 유틸리티
|   |   |-- utils.js             # 크로스 플랫폼 파일/경로/시스템 유틸리티
|   |   |-- package-manager.js   # 패키지 매니저 감지 및 선택
|   |-- hooks/                   # 훅 구현
|   |   |-- session-start.js     # 세션 시작 시 컨텍스트 로드
|   |   |-- session-end.js       # 세션 종료 시 상태 저장
|   |   |-- pre-compact.js       # 압축 전 상태 저장
|   |   |-- suggest-compact.js   # 전략적 압축 제안
|   |   |-- evaluate-session.js  # 세션에서 패턴 추출
|   |-- setup-package-manager.js # 대화형 PM 설정
|
|-- tests/            # 테스트 스위트 (신규)
|   |-- lib/                     # 라이브러리 테스트
|   |-- hooks/                   # 훅 테스트
|   |-- run-all.js               # 모든 테스트 실행
|
|-- contexts/         # 동적 시스템 프롬프트 주입 컨텍스트 (상세 가이드)
|   |-- dev.md              # 개발 모드 컨텍스트
|   |-- review.md           # 코드 리뷰 모드 컨텍스트
|   |-- research.md         # 리서치/탐색 모드 컨텍스트
|
|-- examples/         # 예시 설정 및 세션
|   |-- CLAUDE.md             # 예시 프로젝트 수준 설정
|   |-- user-CLAUDE.md        # 예시 사용자 수준 설정
|   |-- saas-nextjs-CLAUDE.md   # 실제 SaaS (Next.js + Supabase + Stripe)
|   |-- go-microservice-CLAUDE.md # 실제 Go 마이크로서비스 (gRPC + PostgreSQL)
|   |-- django-api-CLAUDE.md      # 실제 Django REST API (DRF + Celery)
|   |-- rust-api-CLAUDE.md        # 실제 Rust API (Axum + SQLx + PostgreSQL) (신규)
|
|-- mcp-configs/      # MCP 서버 설정
|   |-- mcp-servers.json    # GitHub, Supabase, Vercel, Railway 등
|
|-- marketplace.json  # 자체 호스팅 마켓플레이스 설정 (/plugin marketplace add용)
```

---

## 생태계 도구

### Skill Creator

저장소에서 Claude Code skills를 생성하는 두 가지 방법:

#### 옵션 A: 로컬 분석 (내장)

외부 서비스 없이 로컬 분석을 위해 `/skill-create` 명령어 사용:

```bash
/skill-create                    # 현재 저장소 분석
/skill-create --instincts        # 지속적 학습을 위한 instincts도 생성
```

이렇게 하면 git 이력을 로컬로 분석하여 SKILL.md 파일을 생성합니다.

#### 옵션 B: GitHub App (고급)

고급 기능 (10,000개+ 커밋, 자동 PR, 팀 공유)을 위해:

[GitHub App 설치](https://github.com/apps/skill-creator) | [ecc.tools](https://ecc.tools)

```bash
# 이슈에 코멘트:
/skill-creator analyze

# 또는 기본 브랜치에 푸시 시 자동 트리거
```

두 옵션 모두 다음을 생성합니다:
- **SKILL.md 파일** - Claude Code를 위한 바로 사용 가능한 skills
- **Instinct 컬렉션** - continuous-learning-v2용
- **패턴 추출** - 커밋 이력에서 학습

### AgentShield — 보안 감사자

> Claude Code 해커톤 (Cerebral Valley x Anthropic, 2026년 2월) 에서 제작. 1282개 테스트, 98% 커버리지, 102개 정적 분석 규칙.

Claude Code 설정의 취약점, 잘못된 설정, 인젝션 위험을 스캔합니다.

```bash
# 빠른 스캔 (설치 불필요)
npx ecc-agentshield scan

# 안전한 이슈 자동 수정
npx ecc-agentshield scan --fix

# 세 Opus 4.6 에이전트를 사용한 심층 분석
npx ecc-agentshield scan --opus --stream

# 처음부터 안전한 설정 생성
npx ecc-agentshield init
```

**스캔 대상:** CLAUDE.md, settings.json, MCP 설정, 훅, 에이전트 정의, 5개 카테고리 전반의 skills — 시크릿 감지 (14개 패턴), 권한 감사, 훅 인젝션 분석, MCP 서버 위험 프로파일링, 에이전트 설정 리뷰.

**`--opus` 플래그**는 레드팀/블루팀/감사자 파이프라인에서 세 Claude Opus 4.6 에이전트를 실행합니다. 공격자는 익스플로잇 체인을 찾고, 방어자는 보호를 평가하며, 감사자는 두 관점을 우선순위가 지정된 위험 평가로 종합합니다. 단순한 패턴 매칭이 아닌 적대적 추론.

**출력 형식:** 터미널 (색상 등급 A-F), JSON (CI 파이프라인), Markdown, HTML. 치명적 발견 시 빌드 게이트를 위한 종료 코드 2.

Claude Code에서 `/security-scan` 사용 또는 [GitHub Action](https://github.com/affaan-m/agentshield)으로 CI에 추가.

[GitHub](https://github.com/affaan-m/agentshield) | [npm](https://www.npmjs.com/package/ecc-agentshield)

### Plankton — 코드 품질 통합

[Plankton](https://github.com/alexfazio/plankton)은 코드 품질 적용을 위한 권장 동반 도구입니다. ECC skill 및 훅 시스템과 잘 어울리는 자동화된 코드 리뷰, 린팅 오케스트레이션, 품질 게이트를 제공합니다. 보안 + 품질 커버리지를 위해 AgentShield와 함께 사용하세요.

### 지속적 학습 v2

instinct 기반 학습 시스템이 자동으로 패턴을 학습합니다:

```bash
/instinct-status        # 신뢰도와 함께 학습된 instincts 표시
/instinct-import <file> # 다른 사람의 instincts 가져오기
/instinct-export        # 공유를 위해 instincts 내보내기
/evolve                 # 관련 instincts를 skills로 클러스터링
```

전체 문서는 `skills/continuous-learning-v2/` 참조.

---

## 요구사항

### Claude Code CLI 버전

**최소 버전: v2.1.0 이상**

이 플러그인은 플러그인 시스템이 훅을 처리하는 방식의 변경으로 인해 Claude Code CLI v2.1.0+ 가 필요합니다.

버전 확인:
```bash
claude --version
```

### 중요: 훅 자동 로드 동작

> ⚠️ **기여자 주의:** `.claude-plugin/plugin.json`에 `"hooks"` 필드를 추가하지 마세요. 이는 회귀 테스트로 강제됩니다.

Claude Code v2.1+는 설치된 플러그인에서 `hooks/hooks.json`을 관례에 따라 **자동으로 로드**합니다. plugin.json에 명시적으로 선언하면 중복 감지 오류가 발생합니다:

```
Duplicate hooks file detected: ./hooks/hooks.json resolves to already-loaded file
```

**이력:** 이로 인해 이 저장소에서 반복적인 수정/되돌리기 사이클이 발생했습니다 ([#29](https://github.com/affaan-m/everything-claude-code/issues/29), [#52](https://github.com/affaan-m/everything-claude-code/issues/52), [#103](https://github.com/affaan-m/everything-claude-code/issues/103)). Claude Code 버전 사이에 동작이 변경되어 혼란을 야기했습니다. 이제 재도입을 방지하는 회귀 테스트가 있습니다.

---

## 설치

### 옵션 1: 플러그인으로 설치 (권장)

이 저장소를 사용하는 가장 쉬운 방법 - Claude Code 플러그인으로 설치:

```bash
# 이 저장소를 마켓플레이스로 추가
/plugin marketplace add affaan-m/everything-claude-code

# 플러그인 설치
/plugin install everything-claude-code@everything-claude-code
```

또는 `~/.claude/settings.json`에 직접 추가:

```json
{
  "extraKnownMarketplaces": {
    "everything-claude-code": {
      "source": {
        "source": "github",
        "repo": "affaan-m/everything-claude-code"
      }
    }
  },
  "enabledPlugins": {
    "everything-claude-code@everything-claude-code": true
  }
}
```

이렇게 하면 모든 명령어, 에이전트, skills, 훅에 즉시 접근할 수 있습니다.

> **참고:** Claude Code 플러그인 시스템은 플러그인을 통한 `rules` 배포를 지원하지 않습니다 ([업스트림 제한](https://code.claude.com/docs/en/plugins-reference)). 규칙은 수동으로 설치해야 합니다:
>
> ```bash
> # 먼저 저장소 클론
> git clone https://github.com/affaan-m/everything-claude-code.git
>
> # 옵션 A: 사용자 수준 규칙 (모든 프로젝트에 적용)
> mkdir -p ~/.claude/rules
> cp -r everything-claude-code/rules/common/* ~/.claude/rules/
> cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/   # 스택 선택
> cp -r everything-claude-code/rules/python/* ~/.claude/rules/
> cp -r everything-claude-code/rules/golang/* ~/.claude/rules/
>
> # 옵션 B: 프로젝트 수준 규칙 (현재 프로젝트에만 적용)
> mkdir -p .claude/rules
> cp -r everything-claude-code/rules/common/* .claude/rules/
> cp -r everything-claude-code/rules/typescript/* .claude/rules/     # 스택 선택
> ```

---

### 옵션 2: 수동 설치

설치되는 내용을 직접 제어하려면:

```bash
# 저장소 클론
git clone https://github.com/affaan-m/everything-claude-code.git

# Claude 설정에 에이전트 복사
cp everything-claude-code/agents/*.md ~/.claude/agents/

# 규칙 복사 (공통 + 언어별)
cp -r everything-claude-code/rules/common/* ~/.claude/rules/
cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/   # 스택 선택
cp -r everything-claude-code/rules/python/* ~/.claude/rules/
cp -r everything-claude-code/rules/golang/* ~/.claude/rules/

# 명령어 복사
cp everything-claude-code/commands/*.md ~/.claude/commands/

# skills 복사 (핵심 vs 틈새)
# 권장 (새 사용자): 핵심/일반 skills만
cp -r everything-claude-code/.agents/skills/* ~/.claude/skills/
cp -r everything-claude-code/skills/search-first ~/.claude/skills/

# 선택사항: 필요할 때만 틈새/프레임워크별 skills 추가
# for s in django-patterns django-tdd springboot-patterns; do
#   cp -r everything-claude-code/skills/$s ~/.claude/skills/
# done
```

#### settings.json에 훅 추가

`hooks/hooks.json`의 훅을 `~/.claude/settings.json`에 복사합니다.

#### MCP 설정

`mcp-configs/mcp-servers.json`에서 원하는 MCP 서버를 `~/.claude.json`에 복사합니다.

**중요:** `YOUR_*_HERE` 자리 표시자를 실제 API 키로 교체하세요.

---

## 핵심 개념

### 에이전트

서브에이전트는 제한된 범위로 위임된 작업을 처리합니다. 예시:

```markdown
---
name: code-reviewer
description: 품질, 보안, 유지보수성을 위한 코드 리뷰
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

당신은 시니어 코드 리뷰어입니다...
```

### Skills

Skills는 명령어나 에이전트에 의해 호출되는 워크플로우 정의입니다:

```markdown
# TDD 워크플로우

1. 먼저 인터페이스 정의
2. 실패하는 테스트 작성 (RED)
3. 최소한의 코드 구현 (GREEN)
4. 리팩토링 (IMPROVE)
5. 80%+ 커버리지 확인
```

### 훅

훅은 도구 이벤트에 트리거됩니다. 예시 - console.log 경고:

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] console.log를 제거하세요' >&2"
  }]
}
```

### 규칙

규칙은 항상 따라야 할 지침으로, `common/` (언어 독립적) + 언어별 디렉토리로 구성됩니다:

```
rules/
  common/          # 범용 원칙 (항상 설치)
  typescript/      # TS/JS 특화 패턴과 도구
  python/          # Python 특화 패턴과 도구
  golang/          # Go 특화 패턴과 도구
```

설치 및 구조 세부사항은 [`rules/README.md`](rules/README.md) 참조.

---

## 어떤 에이전트를 사용해야 하나요?

어디서 시작할지 모르겠으면 이 빠른 참조를 사용하세요:

| 하고 싶은 것 | 사용할 명령어 | 사용되는 에이전트 |
|-------------|--------------|-----------------|
| 새 기능 계획 | `/everything-claude-code:plan "인증 추가"` | planner |
| 시스템 아키텍처 설계 | `/everything-claude-code:plan` + architect 에이전트 | architect |
| 테스트 우선으로 코드 작성 | `/tdd` | tdd-guide |
| 방금 작성한 코드 리뷰 | `/code-review` | code-reviewer |
| 실패하는 빌드 수정 | `/build-fix` | build-error-resolver |
| 엔드투엔드 테스트 실행 | `/e2e` | e2e-runner |
| 보안 취약점 찾기 | `/security-scan` | security-reviewer |
| 데드 코드 제거 | `/refactor-clean` | refactor-cleaner |
| 문서 업데이트 | `/update-docs` | doc-updater |
| Go 코드 리뷰 | `/go-review` | go-reviewer |
| Python 코드 리뷰 | `/python-review` | python-reviewer |
| 데이터베이스 쿼리 감사 | *(자동 위임)* | database-reviewer |

### 일반적인 워크플로우

**새 기능 시작:**
```
/everything-claude-code:plan "OAuth로 사용자 인증 추가"
                                              → planner가 구현 청사진 생성
/tdd                                          → tdd-guide가 테스트 우선 작성 적용
/code-review                                  → code-reviewer가 작업 확인
```

**버그 수정:**
```
/tdd                                          → tdd-guide: 버그를 재현하는 실패 테스트 작성
                                              → 수정 구현, 테스트 통과 확인
/code-review                                  → code-reviewer: 회귀 포착
```

**프로덕션 준비:**
```
/security-scan                                → security-reviewer: OWASP Top 10 감사
/e2e                                          → e2e-runner: 중요 사용자 흐름 테스트
/test-coverage                                → 80%+ 커버리지 확인
```

---

## FAQ

<details>
<summary><b>설치된 에이전트/명령어를 어떻게 확인하나요?</b></summary>

```bash
/plugin list everything-claude-code@everything-claude-code
```

이 명령어는 플러그인에서 사용 가능한 모든 에이전트, 명령어, skills를 표시합니다.
</details>

<details>
<summary><b>훅이 작동하지 않습니다 / "Duplicate hooks file" 오류가 보입니다</b></summary>

가장 흔한 이슈입니다. `.claude-plugin/plugin.json`에 `"hooks"` 필드를 **추가하지 마세요.** Claude Code v2.1+는 설치된 플러그인에서 `hooks/hooks.json`을 자동으로 로드합니다. 명시적으로 선언하면 중복 감지 오류가 발생합니다. [#29](https://github.com/affaan-m/everything-claude-code/issues/29), [#52](https://github.com/affaan-m/everything-claude-code/issues/52), [#103](https://github.com/affaan-m/everything-claude-code/issues/103) 참조.
</details>

<details>
<summary><b>컨텍스트 창이 줄어들고 있습니다 / Claude의 컨텍스트가 소진됩니다</b></summary>

너무 많은 MCP 서버가 컨텍스트를 소비합니다. 각 MCP 도구 설명은 200k 창에서 토큰을 소비하여 ~70k로 줄일 수 있습니다.

**해결:** 프로젝트별로 미사용 MCP 비활성화:
```json
// 프로젝트의 .claude/settings.json에
{
  "disabledMcpServers": ["supabase", "railway", "vercel"]
}
```

활성화된 MCP를 10개 이하, 활성 도구를 80개 이하로 유지하세요.
</details>

<details>
<summary><b>일부 컴포넌트만 사용할 수 있나요 (예: 에이전트만)?</b></summary>

네. 옵션 2 (수동 설치)를 사용하고 필요한 것만 복사하세요:

```bash
# 에이전트만
cp everything-claude-code/agents/*.md ~/.claude/agents/

# 규칙만
cp -r everything-claude-code/rules/common/* ~/.claude/rules/
```

각 컴포넌트는 완전히 독립적입니다.
</details>

<details>
<summary><b>Cursor / OpenCode / Codex에서도 작동하나요?</b></summary>

네. ECC는 크로스 플랫폼입니다:
- **Cursor**: `.cursor/`에 사전 번역된 설정. [Cursor IDE 지원](#cursor-ide-지원) 참조.
- **OpenCode**: `.opencode/`에 완전한 플러그인 지원. [OpenCode 지원](#-opencode-지원) 참조.
- **Codex**: 어댑터 드리프트 가드와 SessionStart 폴백을 포함한 1급 지원. PR [#257](https://github.com/affaan-m/everything-claude-code/pull/257) 참조.
- **Claude Code**: 네이티브 — 주요 타깃입니다.
</details>

<details>
<summary><b>새 skill이나 에이전트를 어떻게 기여하나요?</b></summary>

[CONTRIBUTING.md](CONTRIBUTING.md) 참조. 요약:
1. 저장소 포크
2. `skills/your-skill-name/SKILL.md`에 skill 생성 (YAML 프론트매터 포함)
3. 또는 `agents/your-agent.md`에 에이전트 생성
4. 무엇을 하는지, 언제 사용하는지에 대한 명확한 설명과 함께 PR 제출
</details>

---

## 테스트 실행

플러그인에는 포괄적인 테스트 스위트가 포함되어 있습니다:

```bash
# 모든 테스트 실행
node tests/run-all.js

# 개별 테스트 파일 실행
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

---

## 기여

**기여를 환영하고 장려합니다.**

이 저장소는 커뮤니티 리소스를 목적으로 합니다. 다음이 있다면:
- 유용한 에이전트 또는 skills
- 영리한 훅
- 더 나은 MCP 설정
- 개선된 규칙

기여해 주세요! 지침은 [CONTRIBUTING.md](CONTRIBUTING.md) 참조.

### 기여 아이디어

- 언어별 skills (Rust, C#, Swift, Kotlin) — Go, Python, Java는 이미 포함됨
- 프레임워크별 설정 (Rails, Laravel, FastAPI, NestJS) — Django, Spring Boot는 이미 포함됨
- DevOps 에이전트 (Kubernetes, Terraform, AWS, Docker)
- 테스트 전략 (다양한 프레임워크, 시각적 회귀)
- 도메인별 지식 (ML, 데이터 엔지니어링, 모바일)

---

## Cursor IDE 지원

ECC는 Cursor의 네이티브 형식에 맞게 조정된 훅, 규칙, 에이전트, skills, 명령어, MCP 설정을 포함한 **완전한 Cursor IDE 지원**을 제공합니다.

### 빠른 시작 (Cursor)

```bash
# 언어별로 설치
./install.sh --target cursor typescript
./install.sh --target cursor python golang swift
```

### 포함된 내용

| 컴포넌트 | 수 | 세부사항 |
|---------|---|---------|
| 훅 이벤트 | 15 | sessionStart, beforeShellExecution, afterFileEdit, beforeMCPExecution, beforeSubmitPrompt 등 10개 더 |
| 훅 스크립트 | 16 | 공유 어댑터를 통해 `scripts/hooks/`에 위임하는 얇은 Node.js 스크립트 |
| 규칙 | 29 | 9개 공통 (alwaysApply) + 20개 언어별 (TypeScript, Python, Go, Swift) |
| 에이전트 | 공유 | 루트의 AGENTS.md를 통해 (Cursor가 네이티브로 읽음) |
| Skills | 공유 + 번들 | 루트의 AGENTS.md와 추가 번역을 위한 `.cursor/skills/`를 통해 |
| 명령어 | 공유 | 설치된 경우 `.cursor/commands/` |
| MCP 설정 | 공유 | 설치된 경우 `.cursor/mcp.json` |

### 훅 아키텍처 (DRY 어댑터 패턴)

Cursor는 Claude Code보다 **더 많은 훅 이벤트**를 가집니다 (20 vs 8). `.cursor/hooks/adapter.js` 모듈이 Cursor의 stdin JSON을 Claude Code 형식으로 변환하여 기존 `scripts/hooks/*.js`를 중복 없이 재사용할 수 있게 합니다.

```
Cursor stdin JSON → adapter.js → 변환 → scripts/hooks/*.js
                                              (Claude Code와 공유)
```

주요 훅:
- **beforeShellExecution** — tmux 외부의 개발 서버 차단 (종료 2), git push 리뷰
- **afterFileEdit** — 자동 형식화 + TypeScript 검사 + console.log 경고
- **beforeSubmitPrompt** — 프롬프트에서 시크릿 감지 (sk-, ghp_, AKIA 패턴)
- **beforeTabFileRead** — Tab이 .env, .key, .pem 파일을 읽는 것 차단 (종료 2)
- **beforeMCPExecution / afterMCPExecution** — MCP 감사 로깅

### 규칙 형식

Cursor 규칙은 `description`, `globs`, `alwaysApply`가 있는 YAML 프론트매터를 사용합니다:

```yaml
---
description: "공통 규칙을 확장하는 TypeScript 코딩 스타일"
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: false
---
```

---

## Codex CLI 지원

ECC는 참조 설정, Codex 특화 AGENTS.md 보완, 16개 포팅된 skills를 포함한 **1급 Codex CLI 지원**을 제공합니다.

### 빠른 시작 (Codex)

```bash
# 참조 설정을 홈 디렉토리에 복사
cp .codex/config.toml ~/.codex/config.toml

# 저장소에서 Codex 실행 — AGENTS.md가 자동 감지됨
codex
```

### 포함된 내용

| 컴포넌트 | 수 | 세부사항 |
|---------|---|---------|
| 설정 | 1 | `.codex/config.toml` — 모델, 권한, MCP 서버, 지속적 지침 |
| AGENTS.md | 2 | 루트 (범용) + `.codex/AGENTS.md` (Codex 특화 보완) |
| Skills | 16 | `.agents/skills/` — SKILL.md + skill당 agents/openai.yaml |
| MCP 서버 | 4 | GitHub, Context7, Memory, Sequential Thinking (명령어 기반) |
| 프로필 | 2 | `strict` (읽기 전용 샌드박스)와 `yolo` (완전 자동 승인) |

### Skills

`.agents/skills/`의 Skills는 Codex에 의해 자동으로 로드됩니다:

| Skill | 설명 |
|-------|------|
| tdd-workflow | 80%+ 커버리지를 갖춘 테스트 주도 개발 |
| security-review | 포괄적인 보안 체크리스트 |
| coding-standards | 범용 코딩 표준 |
| frontend-patterns | React/Next.js 패턴 |
| frontend-slides | HTML 프레젠테이션, PPTX 변환, 시각적 스타일 탐색 |
| article-writing | 노트와 목소리 참조에서 장문 글쓰기 |
| content-engine | 플랫폼 네이티브 소셜 콘텐츠 및 재활용 |
| market-research | 출처 표기된 시장 및 경쟁사 리서치 |
| investor-materials | 덱, 메모, 모델, 원페이저 |
| investor-outreach | 개인화된 아웃리치, 후속 조치, 소개 문구 |
| backend-patterns | API 설계, 데이터베이스, 캐싱 |
| e2e-testing | Playwright E2E 테스트 |
| eval-harness | 평가 주도 개발 |
| strategic-compact | 컨텍스트 관리 |
| api-design | REST API 설계 패턴 |
| verification-loop | 빌드, 테스트, 린트, 타입체크, 보안 |

### 주요 제한사항

Codex CLI는 아직 훅을 지원하지 **않습니다** ([GitHub Issue #2109](https://github.com/openai/codex/issues/2109), 430개 이상 추천). 보안 적용은 config.toml의 `persistent_instructions`와 샌드박스 권한 시스템을 통한 지침 기반입니다.

---

## OpenCode 지원

ECC는 플러그인과 훅을 포함한 **완전한 OpenCode 지원**을 제공합니다.

### 빠른 시작

```bash
# OpenCode 설치
npm install -g opencode

# 저장소 루트에서 실행
opencode
```

설정은 `.opencode/opencode.json`에서 자동으로 감지됩니다.

### 기능 동등성

| 기능 | Claude Code | OpenCode | 상태 |
|------|-------------|----------|------|
| 에이전트 | ✅ 13개 | ✅ 12개 | **Claude Code 선두** |
| 명령어 | ✅ 33개 | ✅ 24개 | **Claude Code 선두** |
| Skills | ✅ 50개+ | ✅ 37개 | **Claude Code 선두** |
| 훅 | ✅ 8개 유형 | ✅ 11개 이벤트 | **OpenCode가 더 많음!** |
| 규칙 | ✅ 29개 규칙 | ✅ 13개 지침 | **Claude Code 선두** |
| MCP 서버 | ✅ 14개 | ✅ 완전 | **완전 동등** |
| 커스텀 도구 | ✅ 훅을 통해 | ✅ 6개 네이티브 도구 | **OpenCode가 더 나음** |

### 플러그인을 통한 훅 지원

OpenCode의 플러그인 시스템은 20개 이상 이벤트 유형으로 Claude Code보다 **더 정교합니다**:

| Claude Code 훅 | OpenCode 플러그인 이벤트 |
|----------------|------------------------|
| PreToolUse | `tool.execute.before` |
| PostToolUse | `tool.execute.after` |
| Stop | `session.idle` |
| SessionStart | `session.created` |
| SessionEnd | `session.deleted` |

**추가 OpenCode 이벤트**: `file.edited`, `file.watcher.updated`, `message.updated`, `lsp.client.diagnostics`, `tui.toast.show` 등.

### 사용 가능한 명령어 (32개)

| 명령어 | 설명 |
|--------|------|
| `/plan` | 구현 계획 생성 |
| `/tdd` | TDD 워크플로우 적용 |
| `/code-review` | 코드 변경사항 리뷰 |
| `/build-fix` | 빌드 오류 수정 |
| `/e2e` | E2E 테스트 생성 |
| `/refactor-clean` | 데드 코드 제거 |
| `/orchestrate` | 다중 에이전트 워크플로우 |
| `/learn` | 세션에서 패턴 추출 |
| `/checkpoint` | 검증 상태 저장 |
| `/verify` | 검증 루프 실행 |
| `/eval` | 기준에 따른 평가 |
| `/update-docs` | 문서 업데이트 |
| `/update-codemaps` | 코드맵 업데이트 |
| `/test-coverage` | 커버리지 분석 |
| `/go-review` | Go 코드 리뷰 |
| `/go-test` | Go TDD 워크플로우 |
| `/go-build` | Go 빌드 오류 수정 |
| `/python-review` | Python 코드 리뷰 (PEP 8, 타입 힌트, 보안) |
| `/multi-plan` | 다중 모델 협업 계획 |
| `/multi-execute` | 다중 모델 협업 실행 |
| `/multi-backend` | 백엔드 중심 다중 모델 워크플로우 |
| `/multi-frontend` | 프론트엔드 중심 다중 모델 워크플로우 |
| `/multi-workflow` | 전체 다중 모델 개발 워크플로우 |
| `/pm2` | PM2 서비스 명령어 자동 생성 |
| `/sessions` | 세션 이력 관리 |
| `/skill-create` | git에서 skills 생성 |
| `/instinct-status` | 학습된 instincts 확인 |
| `/instinct-import` | instincts 가져오기 |
| `/instinct-export` | instincts 내보내기 |
| `/evolve` | instincts를 skills로 클러스터링 |
| `/promote` | 프로젝트 instincts를 전역 범위로 승격 |
| `/projects` | 알려진 프로젝트 및 instinct 통계 나열 |
| `/learn-eval` | 저장 전 패턴 추출 및 평가 |
| `/setup-pm` | 패키지 매니저 설정 |

### 플러그인 설치

**옵션 1: 직접 사용**
```bash
cd everything-claude-code
opencode
```

**옵션 2: npm 패키지로 설치**
```bash
npm install ecc-universal
```

그런 다음 `opencode.json`에 추가:
```json
{
  "plugin": ["ecc-universal"]
}
```

### 문서

- **마이그레이션 가이드**: `.opencode/MIGRATION.md`
- **OpenCode 플러그인 README**: `.opencode/README.md`
- **통합 규칙**: `.opencode/instructions/INSTRUCTIONS.md`
- **LLM 문서**: `llms.txt` (LLM을 위한 완전한 OpenCode 문서)

---

## 크로스 도구 기능 동등성

ECC는 **모든 주요 AI 코딩 도구를 최대화하는 첫 번째 플러그인**입니다. 각 하네스의 비교:

| 기능 | Claude Code | Cursor IDE | Codex CLI | OpenCode |
|------|------------|------------|-----------|----------|
| **에이전트** | 13개 | 공유 (AGENTS.md) | 공유 (AGENTS.md) | 12개 |
| **명령어** | 33개 | 공유 | 지침 기반 | 24개 |
| **Skills** | 50개+ | 공유 | 10개 (네이티브 형식) | 37개 |
| **훅 이벤트** | 8개 유형 | 15개 유형 | 없음 | 11개 유형 |
| **훅 스크립트** | 9개 | 16개 (DRY 어댑터) | 해당 없음 | 플러그인 훅 |
| **규칙** | 29개 (공통+언어) | 29개 (YAML 프론트매터) | 지침 기반 | 13개 지침 |
| **커스텀 도구** | 훅을 통해 | 훅을 통해 | 해당 없음 | 6개 네이티브 도구 |
| **MCP 서버** | 14개 | 공유 (mcp.json) | 4개 (명령어 기반) | 완전 |
| **설정 형식** | settings.json | hooks.json + rules/ | config.toml | opencode.json |
| **컨텍스트 파일** | CLAUDE.md + AGENTS.md | AGENTS.md | AGENTS.md | AGENTS.md |
| **시크릿 감지** | 훅 기반 | beforeSubmitPrompt 훅 | 샌드박스 기반 | 훅 기반 |
| **자동 형식화** | PostToolUse 훅 | afterFileEdit 훅 | 해당 없음 | file.edited 훅 |
| **버전** | 플러그인 | 플러그인 | 참조 설정 | 1.6.0 |

**주요 아키텍처 결정:**
- 루트의 **AGENTS.md**는 범용 크로스 도구 파일 (4개 도구 모두에서 읽음)
- **DRY 어댑터 패턴**으로 Cursor가 중복 없이 Claude Code의 훅 스크립트를 재사용
- **Skills 형식** (YAML 프론트매터가 있는 SKILL.md)이 Claude Code, Codex, OpenCode에서 작동
- Codex의 훅 부재는 `persistent_instructions`와 샌드박스 권한으로 보완

---

## 배경

저는 실험적 출시 이후 Claude Code를 사용해 왔습니다. 2025년 9월에 [@DRodriguezFX](https://x.com/DRodriguezFX)와 함께 Claude Code만으로 [zenith.chat](https://zenith.chat)을 구축하여 Anthropic x Forum Ventures 해커톤에서 수상했습니다.

이 설정들은 여러 프로덕션 애플리케이션에서 검증되었습니다.

---

## 토큰 최적화

Claude Code 사용은 토큰 소비를 관리하지 않으면 비용이 많이 들 수 있습니다. 이 설정들은 품질을 희생하지 않고 비용을 크게 줄입니다.

### 권장 설정

`~/.claude/settings.json`에 추가:

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```

| 설정 | 기본값 | 권장값 | 영향 |
|------|--------|--------|------|
| `model` | opus | **sonnet** | ~60% 비용 절감; 80%+ 코딩 작업 처리 |
| `MAX_THINKING_TOKENS` | 31,999 | **10,000** | 요청당 숨겨진 사고 비용 ~70% 절감 |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 95 | **50** | 더 일찍 압축 — 긴 세션에서 더 나은 품질 |

깊은 아키텍처 추론이 필요할 때만 Opus로 전환:
```
/model opus
```

### 일일 워크플로우 명령어

| 명령어 | 사용 시점 |
|--------|-----------|
| `/model sonnet` | 대부분의 작업에서 기본값 |
| `/model opus` | 복잡한 아키텍처, 디버깅, 깊은 추론 |
| `/clear` | 관련 없는 작업 사이 (무료, 즉시 초기화) |
| `/compact` | 논리적 작업 중단점에서 (리서치 완료, 마일스톤 완료) |
| `/cost` | 세션 중 토큰 소비 모니터링 |

### 전략적 압축

(이 플러그인에 포함된) `strategic-compact` skill은 95% 컨텍스트에서 자동 압축에 의존하는 대신 논리적 중단점에서 `/compact`를 제안합니다. 전체 결정 가이드는 `skills/strategic-compact/SKILL.md` 참조.

**압축할 시점:**
- 리서치/탐색 후, 구현 전
- 마일스톤 완료 후, 다음 시작 전
- 디버깅 후, 기능 작업 계속 전
- 실패한 접근 후, 새 방법 시도 전

**압축하지 말아야 할 시점:**
- 구현 중 (변수 이름, 파일 경로, 부분 상태를 잃게 됩니다)

### 컨텍스트 창 관리

**중요:** 모든 MCP를 한 번에 활성화하지 마세요. 각 MCP 도구 설명은 200k 창에서 토큰을 소비하여 ~70k로 줄일 수 있습니다.

- 프로젝트당 10개 이하 MCP 활성화 유지
- 활성 도구 80개 이하 유지
- 미사용 것을 비활성화하려면 프로젝트 설정의 `disabledMcpServers` 사용

### 에이전트 팀 비용 경고

에이전트 팀은 여러 컨텍스트 창을 생성합니다. 각 팀원은 독립적으로 토큰을 소비합니다. 병렬화가 명확한 가치를 제공하는 작업에만 사용하세요 (다중 모듈 작업, 병렬 리뷰). 단순한 순차 작업에는 서브에이전트가 더 토큰 효율적입니다.

---

## 중요 사항

### 토큰 최적화

일일 한도에 도달했나요? 권장 설정과 워크플로우 팁은 **[토큰 최적화 가이드](docs/token-optimization.md)**를 참조하세요.

빠른 개선:

```json
// ~/.claude/settings.json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50",
    "CLAUDE_CODE_SUBAGENT_MODEL": "haiku"
  }
}
```

관련 없는 작업 사이에 `/clear`, 논리적 중단점에서 `/compact`, 소비 모니터링에 `/cost` 사용.

### 사용자 정의

이 설정들은 제 워크플로우에 맞습니다. 다음을 권장합니다:
1. 공감되는 것부터 시작
2. 스택에 맞게 수정
3. 사용하지 않는 것은 제거
4. 자신의 패턴 추가

---

## 후원

이 프로젝트는 무료 오픈소스입니다. 후원자들이 유지 관리와 성장을 지원해 줍니다.

[**후원자 되기**](https://github.com/sponsors/affaan-m) | [후원 티어](SPONSORS.md)

---

## 스타 이력

[![Star History Chart](https://api.star-history.com/svg?repos=affaan-m/everything-claude-code&type=Date)](https://star-history.com/#affaan-m/everything-claude-code&Date)

---

## 링크

- **단축 가이드 (여기서 시작):** [Everything Claude Code 단축 가이드](https://x.com/affaanmustafa/status/2012378465664745795)
- **상세 가이드 (고급):** [Everything Claude Code 상세 가이드](https://x.com/affaanmustafa/status/2014040193557471352)
- **팔로우:** [@affaanmustafa](https://x.com/affaanmustafa)
- **zenith.chat:** [zenith.chat](https://zenith.chat)
- **Skills 디렉토리:** awesome-agent-skills (커뮤니티 유지 에이전트 skills 디렉토리)

---

## 라이선스

MIT - 자유롭게 사용하고, 필요에 따라 수정하고, 가능하면 기여해 주세요.

---

**도움이 된다면 이 저장소에 스타를 주세요. 두 가이드를 모두 읽으세요. 훌륭한 것을 만드세요.**
