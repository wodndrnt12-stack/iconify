# 토큰 최적화 가이드

토큰 소비를 줄이고, 세션 품질을 연장하며, 일일 한도 내에서 더 많은 작업을 수행하기 위한 실용적인 설정과 습관.

> 참조: 모델 선택 전략은 `rules/common/performance.md`, 자동화된 압축 제안은 `skills/strategic-compact/` 참조.

---

## 권장 설정

대부분의 사용자에게 권장되는 기본값입니다. 파워 유저는 워크로드에 따라 추가 조정 가능합니다 — 예를 들어, 단순한 작업에는 `MAX_THINKING_TOKENS`을 낮추고 복잡한 아키텍처 작업에는 높게 설정.

`~/.claude/settings.json`에 추가:

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50",
    "CLAUDE_CODE_SUBAGENT_MODEL": "haiku"
  }
}
```

### 각 설정의 효과

| 설정 | 기본값 | 권장값 | 효과 |
|------|--------|--------|------|
| `model` | opus | **sonnet** | Sonnet은 ~80%의 코딩 작업을 잘 처리합니다. 복잡한 추론에는 `/model opus`로 전환. ~60% 비용 절감. |
| `MAX_THINKING_TOKENS` | 31,999 | **10,000** | 확장된 사고는 요청당 최대 31,999 출력 토큰을 내부 추론에 예약합니다. 이를 줄이면 숨겨진 비용을 ~70% 절감. 사소한 작업에는 `0`으로 설정하여 비활성화. |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 95 | **50** | 컨텍스트가 이 % 용량에 도달하면 자동 압축이 트리거됩니다. 기본값 95%는 너무 늦습니다 — 그 전에 품질이 저하됩니다. 50%에서 압축하면 세션 품질이 더 좋습니다. |
| `CLAUDE_CODE_SUBAGENT_MODEL` | _(메인 상속)_ | **haiku** | 서브에이전트(Task 도구)가 이 모델로 실행됩니다. Haiku는 ~80% 저렴하고 탐색, 파일 읽기, 테스트 실행에 충분합니다. |

### 확장된 사고 전환

- **Alt+T** (Windows/Linux) 또는 **Option+T** (macOS) — 켜기/끄기 전환
- **Ctrl+O** — 사고 출력 확인 (상세 모드)

---

## 모델 선택

작업에 맞는 모델 사용:

| 모델 | 최적 용도 | 비용 |
|------|-----------|------|
| **Haiku** | 서브에이전트 탐색, 파일 읽기, 단순 조회 | 최저 |
| **Sonnet** | 일상적인 코딩, 리뷰, 테스트 작성, 구현 | 중간 |
| **Opus** | 복잡한 아키텍처, 다단계 추론, 미묘한 문제 디버깅 | 최고 |

세션 중간에 모델 전환:

```
/model sonnet     # 대부분의 작업에서 기본값
/model opus       # 복잡한 추론
/model haiku      # 빠른 조회
```

---

## 컨텍스트 관리

### 명령어

| 명령어 | 사용 시점 |
|--------|-----------|
| `/clear` | 관련 없는 작업 사이. 오래된 컨텍스트는 이후 모든 메시지에서 토큰을 낭비합니다. |
| `/compact` | 논리적 작업 중단점에서 (계획 후, 디버깅 후, 초점 전환 전). |
| `/cost` | 현재 세션의 토큰 소비 확인. |

### 전략적 압축

`strategic-compact` skill (`skills/strategic-compact/`에 있음)은 자동 압축 대신 논리적 간격으로 `/compact`를 제안합니다. 훅 설정 지침은 skill의 README를 참조하세요.

**압축할 시점:**
- 탐색 후, 구현 전
- 마일스톤 완료 후
- 디버깅 후, 새 작업으로 계속하기 전
- 주요 컨텍스트 전환 전

**압축하지 말아야 할 시점:**
- 관련 변경사항을 구현하는 중
- 활성 이슈를 디버깅하는 중
- 다중 파일 리팩토링 중

### 서브에이전트가 컨텍스트를 보호합니다

메인 세션에서 많은 파일을 읽는 대신, 탐색에 서브에이전트(Task 도구)를 사용하세요. 서브에이전트는 20개 파일을 읽지만 요약만 반환합니다 — 메인 컨텍스트는 깔끔하게 유지됩니다.

---

## MCP 서버 관리

활성화된 각 MCP 서버는 컨텍스트 창에 도구 정의를 추가합니다. README에서 경고: **프로젝트당 10개 이하로 유지**.

팁:
- `/mcp`를 실행하여 활성 서버와 컨텍스트 비용 확인
- 가능하면 CLI 도구 선호 (GitHub MCP 대신 `gh`, AWS MCP 대신 `aws`)
- 프로젝트 설정의 `disabledMcpServers`를 사용하여 프로젝트별로 서버 비활성화
- `memory` MCP 서버는 기본으로 설정되어 있지만 어떤 skill, agent, hook에서도 사용하지 않습니다 — 비활성화 고려

---

## 에이전트 팀 비용 경고

[에이전트 팀](https://code.claude.com/docs/en/agent-teams) (실험적)은 여러 독립 컨텍스트 창을 생성합니다. 각 팀원은 토큰을 별도로 소비합니다.

- 병렬화가 명확한 가치를 더하는 작업에만 사용 (다중 모듈 작업, 병렬 리뷰)
- 단순한 순차 작업에는 서브에이전트(Task 도구)가 더 토큰 효율적
- 활성화: 설정에서 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

---

## 미래: configure-ecc 통합

`configure-ecc` 설치 마법사는 설정 중 비용 트레이드오프 설명과 함께 이 환경 변수를 설정하도록 제공할 수 있습니다. 이렇게 하면 새 사용자가 한계에 부딪히고 나서야 설정을 발견하는 대신, 처음부터 최적화할 수 있습니다.

---

## 빠른 참조

```bash
# 일일 워크플로우
/model sonnet              # 여기서 시작
/model opus                # 복잡한 추론에만
/clear                     # 관련 없는 작업 사이
/compact                   # 논리적 중단점에서
/cost                      # 소비 확인

# 환경 변수 (~/.claude/settings.json "env" 블록에 추가)
MAX_THINKING_TOKENS=10000
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50
CLAUDE_CODE_SUBAGENT_MODEL=haiku
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```
