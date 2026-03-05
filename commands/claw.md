---
description: NanoClaw 에이전트 REPL을 시작합니다 — claude CLI로 구동되는 지속적이고 세션 인식 AI 어시스턴트입니다.
---

# Claw 명령

대화 기록을 디스크에 저장하고 선택적으로 ECC 스킬 컨텍스트를 로드하는 대화형 AI 에이전트 세션을 시작합니다.

## 사용법

```bash
node scripts/claw.js
```

또는 npm을 통해:

```bash
npm run claw
```

## 환경 변수

| 변수 | 기본값 | 설명 |
|----------|---------|-------------|
| `CLAW_SESSION` | `default` | 세션 이름 (영숫자 + 하이픈) |
| `CLAW_SKILLS` | *(비어 있음)* | 시스템 컨텍스트로 로드할 스킬 이름 (쉼표로 구분) |

## REPL 명령어

REPL 내에서 프롬프트에 직접 다음 명령을 입력합니다:

```
/clear      현재 세션 기록 지우기
/history    전체 대화 기록 출력
/sessions   저장된 모든 세션 목록 표시
/help       사용 가능한 명령 표시
exit        REPL 종료
```

## 동작 방식

1. `CLAW_SESSION` 환경 변수를 읽어 이름이 지정된 세션을 선택합니다 (기본값: `default`)
2. `~/.claude/claw/{session}.md`에서 대화 기록을 로드합니다
3. 선택적으로 `CLAW_SKILLS` 환경 변수에서 ECC 스킬 컨텍스트를 로드합니다
4. 차단 프롬프트 루프에 진입합니다 — 각 사용자 메시지는 전체 기록과 함께 `claude -p`로 전송됩니다
5. 응답은 재시작 간에도 지속되도록 세션 파일에 추가됩니다

## 세션 저장

세션은 `~/.claude/claw/`에 마크다운 파일로 저장됩니다:

```
~/.claude/claw/default.md
~/.claude/claw/my-project.md
```

각 대화는 다음 형식으로 저장됩니다:

```markdown
### [2025-01-15T10:30:00.000Z] User
이 함수는 무엇을 하나요?
---
### [2025-01-15T10:30:05.000Z] Assistant
이 함수는 ...를 계산합니다
---
```

## 예시

```bash
# 기본 세션 시작
node scripts/claw.js

# 이름이 지정된 세션
CLAW_SESSION=my-project node scripts/claw.js

# 스킬 컨텍스트와 함께
CLAW_SKILLS=tdd-workflow,security-review node scripts/claw.js
```
