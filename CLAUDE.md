# CLAUDE.md

이 파일은 이 저장소의 코드를 다룰 때 Claude Code (claude.ai/code)에 대한 지침을 제공합니다.

## 프로젝트 개요

이것은 **Claude Code 플러그인**입니다 — 프로덕션 수준의 에이전트, 스킬, 훅, 명령어, 규칙, MCP 설정의 모음입니다. 이 프로젝트는 Claude Code를 사용한 소프트웨어 개발을 위한 검증된 워크플로우를 제공합니다.

## 테스트 실행

```bash
# 모든 테스트 실행
node tests/run-all.js

# 개별 테스트 파일 실행
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

## 아키텍처

프로젝트는 여러 핵심 컴포넌트로 구성됩니다:

- **agents/** - 위임을 위한 전문 서브에이전트 (planner, code-reviewer, tdd-guide 등)
- **skills/** - 워크플로우 정의 및 도메인 지식 (코딩 표준, 패턴, 테스팅)
- **commands/** - 사용자가 호출하는 슬래시 명령어 (/tdd, /plan, /e2e 등)
- **hooks/** - 트리거 기반 자동화 (세션 지속성, 도구 사용 전/후 훅)
- **rules/** - 항상 따라야 할 지침 (보안, 코딩 스타일, 테스트 요구사항)
- **mcp-configs/** - 외부 통합을 위한 MCP 서버 설정
- **scripts/** - 훅 및 설정을 위한 크로스 플랫폼 Node.js 유틸리티
- **tests/** - 스크립트 및 유틸리티 테스트 스위트

## 주요 명령어

- `/tdd` - 테스트 주도 개발 워크플로우
- `/plan` - 구현 계획 수립
- `/e2e` - E2E 테스트 생성 및 실행
- `/code-review` - 품질 리뷰
- `/build-fix` - 빌드 오류 수정
- `/learn` - 세션에서 패턴 추출
- `/skill-create` - git 이력에서 스킬 생성

## 개발 참고사항

- 패키지 매니저 감지: npm, pnpm, yarn, bun (`CLAUDE_PACKAGE_MANAGER` 환경 변수 또는 프로젝트 설정으로 구성 가능)
- 크로스 플랫폼: Node.js 스크립트를 통한 Windows, macOS, Linux 지원
- 에이전트 형식: YAML 프론트매터가 있는 Markdown (name, description, tools, model)
- 스킬 형식: 명확한 섹션이 있는 Markdown (사용 시기, 작동 방식, 예시)
- 훅 형식: 매처 조건과 커맨드/알림 훅이 있는 JSON

## 기여

CONTRIBUTING.md의 형식을 따르세요:
- 에이전트: 프론트매터가 있는 Markdown (name, description, tools, model)
- 스킬: 명확한 섹션 (사용 시기, 작동 방식, 예시)
- 명령어: description 프론트매터가 있는 Markdown
- 훅: matcher와 hooks 배열이 있는 JSON

파일 이름: 소문자와 하이픈 사용 (예: `python-reviewer.md`, `tdd-workflow.md`)
