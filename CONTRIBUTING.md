# Everything Claude Code에 기여하기

기여해 주셔서 감사합니다! 이 저장소는 Claude Code 사용자를 위한 커뮤니티 리소스입니다.

## 목차

- [찾고 있는 것](#찾고-있는-것)
- [빠른 시작](#빠른-시작)
- [스킬 기여](#스킬-기여)
- [에이전트 기여](#에이전트-기여)
- [훅 기여](#훅-기여)
- [명령어 기여](#명령어-기여)
- [풀 리퀘스트 프로세스](#풀-리퀘스트-프로세스)

---

## 찾고 있는 것

### 에이전트
특정 작업을 잘 처리하는 새 에이전트:
- 언어별 리뷰어 (Python, Go, Rust)
- 프레임워크 전문가 (Django, Rails, Laravel, Spring)
- DevOps 전문가 (Kubernetes, Terraform, CI/CD)
- 도메인 전문가 (ML 파이프라인, 데이터 엔지니어링, 모바일)

### 스킬
워크플로우 정의 및 도메인 지식:
- 언어별 모범 사례
- 프레임워크 패턴
- 테스팅 전략
- 아키텍처 가이드

### 훅
유용한 자동화:
- 린팅/포맷팅 훅
- 보안 검사
- 검증 훅
- 알림 훅

### 명령어
유용한 워크플로우를 호출하는 슬래시 명령어:
- 배포 명령어
- 테스팅 명령어
- 코드 생성 명령어

---

## 빠른 시작

```bash
# 1. 포크 및 클론
gh repo fork affaan-m/everything-claude-code --clone
cd everything-claude-code

# 2. 브랜치 생성
git checkout -b feat/my-contribution

# 3. 기여 추가 (아래 섹션 참조)

# 4. 로컬 테스트
cp -r skills/my-skill ~/.claude/skills/  # 스킬의 경우
# 그 다음 Claude Code로 테스트

# 5. PR 제출
git add . && git commit -m "feat: add my-skill" && git push
```

---

## 스킬 기여

스킬은 컨텍스트에 따라 Claude Code가 로드하는 지식 모듈입니다.

### 디렉토리 구조

```
skills/
└── your-skill-name/
    └── SKILL.md
```

### SKILL.md 템플릿

```markdown
---
name: your-skill-name
description: 스킬 목록에 표시되는 간단한 설명
origin: ECC
---

# 스킬 제목

이 스킬이 다루는 내용의 간단한 개요.

## 핵심 개념

주요 패턴과 지침을 설명합니다.

## 코드 예시

\`\`\`typescript
// 실용적이고 검증된 예시 포함
function example() {
  // 잘 주석 처리된 코드
}
\`\`\`

## 모범 사례

- 실행 가능한 지침
- 해야 할 것과 하지 말아야 할 것
- 피해야 할 일반적인 함정

## 사용 시기

이 스킬이 적용되는 시나리오를 설명합니다.
```

### 스킬 체크리스트

- [ ] 하나의 도메인/기술에 집중
- [ ] 실용적인 코드 예시 포함
- [ ] 500줄 미만
- [ ] 명확한 섹션 헤더 사용
- [ ] Claude Code로 테스트 완료

### 예시 스킬

| 스킬 | 목적 |
|-------|---------|
| `coding-standards/` | TypeScript/JavaScript 패턴 |
| `frontend-patterns/` | React 및 Next.js 모범 사례 |
| `backend-patterns/` | API 및 데이터베이스 패턴 |
| `security-review/` | 보안 체크리스트 |

---

## 에이전트 기여

에이전트는 Task 도구를 통해 호출되는 전문 보조자입니다.

### 파일 위치

```
agents/your-agent-name.md
```

### 에이전트 템플릿

```markdown
---
name: your-agent-name
description: 이 에이전트가 무엇을 하는지, 언제 Claude가 호출해야 하는지. 구체적으로 작성하세요!
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
model: sonnet
---

당신은 [역할] 전문가입니다.

## 역할

- 주요 책임
- 부차적 책임
- 하지 않는 것 (경계)

## 워크플로우

### 1단계: 이해
작업에 접근하는 방식.

### 2단계: 실행
작업을 수행하는 방식.

### 3단계: 검증
결과를 검증하는 방식.

## 출력 형식

사용자에게 반환하는 내용.

## 예시

### 예시: [시나리오]
입력: [사용자가 제공하는 것]
작업: [수행하는 것]
출력: [반환하는 것]
```

### 에이전트 필드

| 필드 | 설명 | 옵션 |
|-------|-------------|---------|
| `name` | 소문자, 하이픈 사용 | `code-reviewer` |
| `description` | 호출 시기 결정에 사용 | 구체적으로! |
| `tools` | 필요한 것만 | `Read, Write, Edit, Bash, Grep, Glob, WebFetch, Task` |
| `model` | 복잡도 수준 | `haiku` (단순), `sonnet` (코딩), `opus` (복잡) |

### 예시 에이전트

| 에이전트 | 목적 |
|-------|---------|
| `tdd-guide.md` | 테스트 주도 개발 |
| `code-reviewer.md` | 코드 리뷰 |
| `security-reviewer.md` | 보안 스캐닝 |
| `build-error-resolver.md` | 빌드 오류 수정 |

---

## 훅 기여

훅은 Claude Code 이벤트에 의해 트리거되는 자동 동작입니다.

### 파일 위치

```
hooks/hooks.json
```

### 훅 타입

| 타입 | 트리거 | 사용 사례 |
|------|---------|----------|
| `PreToolUse` | 도구 실행 전 | 검증, 경고, 차단 |
| `PostToolUse` | 도구 실행 후 | 포맷팅, 검사, 알림 |
| `SessionStart` | 세션 시작 | 컨텍스트 로드 |
| `Stop` | 세션 종료 | 정리, 감사 |

### 훅 형식

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "tool == \"Bash\" && tool_input.command matches \"rm -rf /\"",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Hook] 차단됨: 위험한 명령어' && exit 1"
          }
        ],
        "description": "위험한 rm 명령어 차단"
      }
    ]
  }
}
```

### 매처 구문

```javascript
// 특정 도구 매칭
tool == "Bash"
tool == "Edit"
tool == "Write"

// 입력 패턴 매칭
tool_input.command matches "npm install"
tool_input.file_path matches "\\.tsx?$"

// 조건 결합
tool == "Bash" && tool_input.command matches "git push"
```

### 훅 예시

```json
// tmux 외부에서 개발 서버 차단
{
  "matcher": "tool == \"Bash\" && tool_input.command matches \"npm run dev\"",
  "hooks": [{"type": "command", "command": "echo '개발 서버는 tmux에서 실행하세요' && exit 1"}],
  "description": "개발 서버가 tmux에서 실행되도록 보장"
}

// TypeScript 편집 후 자동 포맷팅
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\.tsx?$\"",
  "hooks": [{"type": "command", "command": "npx prettier --write \"$file_path\""}],
  "description": "편집 후 TypeScript 파일 포맷팅"
}

// git push 전 경고
{
  "matcher": "tool == \"Bash\" && tool_input.command matches \"git push\"",
  "hooks": [{"type": "command", "command": "echo '[Hook] 푸시 전 변경사항을 검토하세요'"}],
  "description": "푸시 전 검토 리마인더"
}
```

### 훅 체크리스트

- [ ] 매처가 구체적임 (지나치게 광범위하지 않음)
- [ ] 명확한 오류/정보 메시지 포함
- [ ] 올바른 종료 코드 사용 (`exit 1`은 차단, `exit 0`은 허용)
- [ ] 철저히 테스트됨
- [ ] 설명 있음

---

## 명령어 기여

명령어는 `/command-name`으로 사용자가 호출하는 액션입니다.

### 파일 위치

```
commands/your-command.md
```

### 명령어 템플릿

```markdown
---
description: /help에 표시되는 간단한 설명
---

# 명령어 이름

## 목적

이 명령어가 하는 일.

## 사용법

\`\`\`
/your-command [args]
\`\`\`

## 워크플로우

1. 첫 번째 단계
2. 두 번째 단계
3. 마지막 단계

## 출력

사용자가 받는 내용.
```

### 예시 명령어

| 명령어 | 목적 |
|---------|---------|
| `commit.md` | git 커밋 생성 |
| `code-review.md` | 코드 변경 리뷰 |
| `tdd.md` | TDD 워크플로우 |
| `e2e.md` | E2E 테스팅 |

---

## 풀 리퀘스트 프로세스

### 1. PR 제목 형식

```
feat(skills): add rust-patterns skill
feat(agents): add api-designer agent
feat(hooks): add auto-format hook
fix(skills): update React patterns
docs: improve contributing guide
```

### 2. PR 설명

```markdown
## 요약
추가하는 것과 이유.

## 타입
- [ ] 스킬
- [ ] 에이전트
- [ ] 훅
- [ ] 명령어

## 테스팅
테스트한 방법.

## 체크리스트
- [ ] 형식 지침 준수
- [ ] Claude Code로 테스트 완료
- [ ] 민감 정보 없음 (API 키, 경로)
- [ ] 명확한 설명
```

### 3. 리뷰 프로세스

1. 메인테이너가 48시간 이내에 리뷰
2. 요청된 경우 피드백 반영
3. 승인 후 main에 병합

---

## 지침

### 해야 할 것
- 기여는 집중적이고 모듈화되게
- 명확한 설명 포함
- 제출 전 테스트
- 기존 패턴 따르기
- 의존성 문서화

### 하지 말아야 할 것
- 민감한 데이터 포함 (API 키, 토큰, 경로)
- 지나치게 복잡하거나 틈새 설정 추가
- 테스트되지 않은 기여 제출
- 기존 기능의 중복 생성

---

## 파일 이름

- 소문자와 하이픈 사용: `python-reviewer.md`
- 설명적으로: `workflow.md`가 아닌 `tdd-workflow.md`
- 이름과 파일명 일치

---

## 질문?

- **이슈:** [github.com/affaan-m/everything-claude-code/issues](https://github.com/affaan-m/everything-claude-code/issues)
- **X/Twitter:** [@affaanmustafa](https://x.com/affaanmustafa)

---

기여해 주셔서 감사합니다! 함께 훌륭한 리소스를 만들어 봅시다.
