# Everything Claude Code 롱폼 가이드

![헤더: Everything Claude Code 롱폼 가이드](./assets/images/longform/01-header.png)

---

> **선행 조건**: 이 가이드는 [Everything Claude Code 단기 가이드](./the-shortform-guide.md)를 기반으로 합니다. 스킬, 훅, 서브에이전트, MCP, 플러그인을 아직 설정하지 않았다면 먼저 읽어보세요.

![단기 가이드 참조](./assets/images/longform/02-shortform-reference.png)
*단기 가이드 - 먼저 읽어보세요*

단기 가이드에서는 기초 설정을 다뤘습니다: 스킬과 명령어, 훅, 서브에이전트, MCP, 플러그인, 그리고 효과적인 Claude Code 워크플로우의 근간을 이루는 설정 패턴. 그것이 설정 가이드이자 기본 인프라였습니다.

이 롱폼 가이드는 생산적인 세션과 낭비적인 세션을 구분하는 기법들을 다룹니다. 단기 가이드를 읽지 않았다면, 돌아가서 먼저 설정을 완료하세요. 이하 내용은 스킬, 에이전트, 훅, MCP가 이미 설정되고 작동 중임을 가정합니다.

여기서 다루는 주제: 토큰 경제학, 메모리 지속성, 검증 패턴, 병렬화 전략, 재사용 가능한 워크플로우 구축의 복합 효과. 10개월 이상의 일상 사용을 통해 다듬어온 패턴들로, 첫 시간 내에 컨텍스트 부패에 시달리는 대신 시간 동안 생산적인 세션을 유지하는 차이를 만듭니다.

단기 및 롱폼 가이드에서 다루는 모든 것은 GitHub에서 이용 가능합니다: `github.com/affaan-m/everything-claude-code`

---

## 팁과 트릭

### 일부 MCP는 대체 가능하며 컨텍스트 윈도우를 확보해줍니다

버전 관리(GitHub), 데이터베이스(Supabase), 배포(Vercel, Railway) 등의 MCP — 이 플랫폼들 대부분은 MCP가 본질적으로 감싸고 있는 강력한 CLI를 이미 보유하고 있습니다. MCP는 훌륭한 래퍼지만 비용이 따릅니다.

실제 MCP를 사용하지 않고(그리고 그에 따른 컨텍스트 윈도우 감소 없이) CLI가 MCP처럼 기능하게 하려면, 기능을 스킬과 명령어로 번들링하는 것을 고려하세요. MCP가 노출하는 도구들을 제거하고 명령어로 전환하세요.

예시: GitHub MCP를 항상 로드하는 대신, 선호하는 옵션으로 `gh pr create`를 감싸는 `/gh-pr` 명령어를 만드세요. Supabase MCP가 컨텍스트를 잡아먹는 대신, Supabase CLI를 직접 사용하는 스킬을 만드세요.

지연 로딩으로 컨텍스트 윈도우 문제는 대부분 해결됩니다. 하지만 토큰 사용량과 비용은 같은 방식으로 해결되지 않습니다. CLI + 스킬 접근 방식은 여전히 토큰 최적화 방법입니다.

---

## 중요 사항

### 컨텍스트 및 메모리 관리

세션 간 메모리 공유를 위해, 진행 상황을 요약하고 확인한 다음 `.claude` 폴더의 `.tmp` 파일에 저장하고 세션 종료까지 추가하는 스킬 또는 명령어가 최선입니다. 다음 날에 그것을 컨텍스트로 사용하여 중단한 곳에서 재개하고, 각 세션마다 새 파일을 만들어 이전 컨텍스트가 새 작업으로 오염되지 않게 합니다.

![세션 저장 파일 트리](./assets/images/longform/03-session-storage.png)
*세션 저장 예시 -> https://github.com/affaan-m/everything-claude-code/tree/main/examples/sessions*

Claude가 현재 상태를 요약하는 파일을 만듭니다. 검토하고, 필요하면 편집을 요청한 다음, 새로 시작합니다. 새 대화에서는 파일 경로만 제공하면 됩니다. 컨텍스트 한계에 도달하여 복잡한 작업을 계속해야 할 때 특히 유용합니다. 이 파일들에는 다음이 포함되어야 합니다:
- 효과적이었던 접근 방식 (증거로 검증됨)
- 시도했지만 효과가 없었던 접근 방식
- 시도하지 않은 접근 방식과 남은 작업

**전략적 컨텍스트 지우기:**

계획이 설정되고 컨텍스트가 지워지면 (현재 Claude Code의 계획 모드에서 기본 옵션), 계획에서 작업할 수 있습니다. 이는 더 이상 실행과 관련이 없는 탐색 컨텍스트가 많이 쌓였을 때 유용합니다. 전략적 압축을 위해 자동 압축을 비활성화하세요. 논리적 간격으로 수동 압축하거나 대신 해주는 스킬을 만드세요.

**고급: 동적 시스템 프롬프트 주입**

제가 파악한 패턴: 모든 세션을 로드하는 CLAUDE.md(사용자 범위)나 `.claude/rules/`(프로젝트 범위)에만 모든 것을 넣는 대신, CLI 플래그를 사용하여 컨텍스트를 동적으로 주입합니다.

```bash
claude --system-prompt "$(cat memory.md)"
```

이를 통해 언제 어떤 컨텍스트를 로드할지 더 세밀하게 조절할 수 있습니다. 시스템 프롬프트 콘텐츠는 사용자 메시지보다 높은 권한을 가지며, 사용자 메시지는 도구 결과보다 높은 권한을 가집니다.

**실용적인 설정:**

```bash
# 일상 개발
alias claude-dev='claude --system-prompt "$(cat ~/.claude/contexts/dev.md)"'

# PR 리뷰 모드
alias claude-review='claude --system-prompt "$(cat ~/.claude/contexts/review.md)"'

# 연구/탐색 모드
alias claude-research='claude --system-prompt "$(cat ~/.claude/contexts/research.md)"'
```

**고급: 메모리 지속성 훅**

대부분의 사람들이 모르는 메모리에 도움이 되는 훅들이 있습니다:

- **PreCompact Hook**: 컨텍스트 압축이 일어나기 전에 중요한 상태를 파일로 저장
- **Stop Hook (세션 종료)**: 세션 종료 시 학습 내용을 파일로 지속
- **SessionStart Hook**: 새 세션에서 이전 컨텍스트를 자동으로 로드

이러한 훅을 구축했으며 저장소의 `github.com/affaan-m/everything-claude-code/tree/main/hooks/memory-persistence`에 있습니다.

---

### 지속적 학습 / 메모리

프롬프트를 여러 번 반복해야 하고 Claude가 같은 문제에 부딪히거나 이미 들어본 응답을 받았다면 — 그 패턴들을 스킬에 추가해야 합니다.

**문제점:** 낭비된 토큰, 낭비된 컨텍스트, 낭비된 시간.

**해결책:** Claude Code가 사소하지 않은 것을 발견했을 때 — 디버깅 기법, 해결책, 프로젝트별 패턴 — 그 지식을 새 스킬로 저장합니다. 다음에 비슷한 문제가 발생하면 스킬이 자동으로 로드됩니다.

이를 위한 지속적 학습 스킬을 구축했습니다: `github.com/affaan-m/everything-claude-code/tree/main/skills/continuous-learning`

**Stop Hook을 사용하는 이유 (UserPromptSubmit 대신):**

핵심 설계 결정은 UserPromptSubmit 대신 **Stop hook**을 사용하는 것입니다. UserPromptSubmit은 모든 단일 메시지에서 실행 — 모든 프롬프트에 지연을 추가합니다. Stop은 세션 종료 시 한 번 실행 — 가볍고 세션 중 속도를 저하시키지 않습니다.

---

### 토큰 최적화

**주요 전략: 서브에이전트 아키텍처**

사용하는 도구를 최적화하고, 작업에 충분한 가장 저렴한 모델로 위임하도록 설계된 서브에이전트 아키텍처.

**모델 선택 빠른 참조:**

![모델 선택 표](./assets/images/longform/04-model-selection.png)
*다양한 공통 작업의 서브에이전트 가상 설정과 그 선택 이유*

| 작업 유형 | 모델 | 이유 |
| ------------------------- | ------ | ------------------------------------------ |
| 탐색/검색 | Haiku | 빠르고, 저렴하고, 파일 찾기에 충분 |
| 단순 편집 | Haiku | 단일 파일 변경, 명확한 지시 |
| 멀티 파일 구현 | Sonnet | 코딩에 최적의 균형 |
| 복잡한 아키텍처 | Opus | 깊은 추론 필요 |
| PR 리뷰 | Sonnet | 컨텍스트 이해, 뉘앙스 파악 |
| 보안 분석 | Opus | 취약점을 놓칠 여유 없음 |
| 문서 작성 | Haiku | 구조가 단순 |
| 복잡한 버그 디버깅 | Opus | 전체 시스템을 마음속에 유지해야 함 |

코딩 작업의 90%는 기본적으로 Sonnet을 사용하세요. 첫 번째 시도가 실패했을 때, 작업이 5개 이상의 파일에 걸쳐 있을 때, 아키텍처 결정 시, 또는 보안 핵심 코드일 때 Opus로 업그레이드하세요.

**가격 참조:**

![Claude 모델 가격](./assets/images/longform/05-pricing-table.png)
*출처: https://platform.claude.com/docs/en/about-claude/pricing*

**도구별 최적화:**

grep을 mgrep으로 교체 — 기존 grep 또는 ripgrep 대비 평균 약 50% 토큰 절감:

![mgrep 벤치마크](./assets/images/longform/06-mgrep-benchmark.png)
*50개 작업 벤치마크에서 mgrep + Claude Code는 비슷하거나 더 나은 품질로 grep 기반 워크플로우보다 약 2배 적은 토큰을 사용했습니다. 출처: https://github.com/mixedbread-ai/mgrep*

**모듈식 코드베이스의 이점:**

수천 줄이 아닌 수백 줄의 기본 파일을 갖춘 더 모듈화된 코드베이스는 토큰 최적화 비용과 첫 번째 시도에 작업을 완료하는 데 모두 도움이 됩니다.

---

### 검증 루프 및 평가

**벤치마킹 워크플로우:**

스킬 있는 경우와 없는 경우에 같은 것을 요청하고 출력 차이를 확인:

대화를 포크하고, 스킬 없이 그 중 하나에서 새 워크트리를 시작하고, 마지막에 diff를 확인하고, 무엇이 기록되었는지 확인합니다.

**평가 패턴 유형:**

- **체크포인트 기반 평가**: 명시적 체크포인트 설정, 정의된 기준에 대해 검증, 진행 전 수정
- **지속적 평가**: N분마다 또는 주요 변경 후 실행, 전체 테스트 스위트 + 린트

**핵심 지표:**

```
pass@k: k번의 시도 중 적어도 하나가 성공
        k=1: 70%  k=3: 91%  k=5: 97%

pass^k: k번의 시도 모두 성공해야 함
        k=1: 70%  k=3: 34%  k=5: 17%
```

그냥 작동하기만 하면 될 때는 **pass@k**를 사용하고, 일관성이 필수적일 때는 **pass^k**를 사용하세요.

---

## 병렬화

멀티 Claude 터미널 설정에서 대화를 포크할 때, 포크와 원본 대화의 액션 범위가 잘 정의되어 있는지 확인하세요. 코드 변경 시 최소한의 겹침을 목표로 합니다.

**선호하는 패턴:**

메인 채팅은 코드 변경, 포크는 코드베이스와 현재 상태에 대한 질문, 또는 외부 서비스 연구.

**임의 터미널 수에 대하여:**

![병렬 터미널에 대한 Boris](./assets/images/longform/07-boris-parallel.png)
*여러 Claude 인스턴스 실행에 관한 Boris (Anthropic)*

Boris는 병렬화에 대한 팁을 가지고 있습니다. 로컬에서 5개, 업스트림에서 5개의 Claude 인스턴스를 실행하는 것과 같은 것들을 제안했습니다. 임의의 터미널 수를 설정하는 것은 권장하지 않습니다. 터미널 추가는 진정한 필요에 의해서만 이루어져야 합니다.

목표는 이것이어야 합니다: **최소한의 병렬화로 얼마나 많은 것을 달성할 수 있는가.**

**병렬 인스턴스를 위한 Git 워크트리:**

```bash
# 병렬 작업을 위한 워크트리 생성
git worktree add ../project-feature-a feature-a
git worktree add ../project-feature-b feature-b
git worktree add ../project-refactor refactor-branch

# 각 워크트리에 자체 Claude 인스턴스
cd ../project-feature-a && claude
```

인스턴스를 확장하기 시작하고 서로 겹치는 코드 작업 중인 여러 Claude 인스턴스가 있다면, git 워크트리를 사용하고 각각에 대해 매우 잘 정의된 계획이 있어야 합니다. `/rename <이름>`을 사용하여 모든 채팅에 이름을 붙이세요.

![두 터미널 설정](./assets/images/longform/08-two-terminals.png)
*시작 설정: 왼쪽 터미널은 코딩, 오른쪽 터미널은 질문 - /rename과 /fork 사용*

**캐스케이드 방법:**

여러 Claude Code 인스턴스를 실행할 때 "캐스케이드" 패턴으로 구성:

- 새 작업은 오른쪽의 새 탭으로 열기
- 왼쪽에서 오른쪽으로, 가장 오래된 것에서 최신 것 순으로 스위프
- 한 번에 최대 3~4개 작업에 집중

---

## 기반 작업

**두 인스턴스 킥오프 패턴:**

저 자신의 워크플로우 관리를 위해 2개의 열린 Claude 인스턴스로 빈 저장소를 시작하는 것을 좋아합니다.

**인스턴스 1: 스캐폴딩 에이전트**
- 스캐폴드와 기반 작업 수행
- 프로젝트 구조 생성
- 설정 파일 생성 (CLAUDE.md, 규칙, 에이전트)

**인스턴스 2: 심층 연구 에이전트**
- 모든 서비스, 웹 검색에 연결
- 상세한 PRD 생성
- 아키텍처 머메이드 다이어그램 생성
- 실제 문서 클립이 있는 참고자료 컴파일

**llms.txt 패턴:**

사용 가능한 경우, 문서 페이지에서 `/llms.txt`를 실행하면 많은 문서 참고자료에서 `llms.txt`를 찾을 수 있습니다. 이는 문서의 깔끔하고 LLM에 최적화된 버전을 제공합니다.

**철학: 재사용 가능한 패턴 구축**

@omarsar0로부터: "초기에 재사용 가능한 워크플로우/패턴을 구축하는 데 시간을 투자했습니다. 구축하기 번거로웠지만, 모델과 에이전트 하니스가 개선됨에 따라 엄청난 복합 효과가 있었습니다."

**투자할 것:**

- 서브에이전트
- 스킬
- 명령어
- 계획 패턴
- MCP 도구
- 컨텍스트 엔지니어링 패턴

---

## 에이전트 및 서브에이전트 모범 사례

**서브에이전트 컨텍스트 문제:**

서브에이전트는 모든 것을 덤프하는 대신 요약을 반환하여 컨텍스트를 절약하기 위해 존재합니다. 하지만 오케스트레이터는 서브에이전트가 부족한 의미적 컨텍스트를 가지고 있습니다. 서브에이전트는 요청 뒤의 목적이 아닌 리터럴 쿼리만 압니다.

**반복적 검색 패턴:**

1. 오케스트레이터가 모든 서브에이전트 반환을 평가
2. 수락하기 전에 후속 질문
3. 서브에이전트가 소스로 돌아가 답변을 가져와 반환
4. 충분할 때까지 반복 (최대 3 사이클)

**핵심:** 쿼리뿐만 아니라 목적 컨텍스트를 전달하세요.

**순차적 단계가 있는 오케스트레이터:**

```markdown
1단계: 연구 (Explore 에이전트 사용) → research-summary.md
2단계: 계획 (planner 에이전트 사용) → plan.md
3단계: 구현 (tdd-guide 에이전트 사용) → 코드 변경
4단계: 리뷰 (code-reviewer 에이전트 사용) → review-comments.md
5단계: 검증 (필요 시 build-error-resolver 사용) → 완료 또는 루프 백
```

**핵심 규칙:**

1. 각 에이전트는 하나의 명확한 입력을 받고 하나의 명확한 출력을 생성
2. 출력은 다음 단계의 입력이 됨
3. 단계 건너뛰기 금지
4. 에이전트 사이에 `/clear` 사용
5. 중간 출력을 파일에 저장

---

## 재미있는 것 / 필수는 아닌 재미있는 팁

### 커스텀 상태표시줄

`/statusline`을 사용하여 설정할 수 있습니다 — Claude가 없다고 하지만 설정해줄 수 있고 원하는 것을 물어볼 것입니다.

참조: ccstatusline (커스텀 Claude Code 상태표시줄을 위한 커뮤니티 프로젝트)

### 음성 전사

목소리로 Claude Code와 대화하세요. 많은 사람들에게 타이핑보다 빠릅니다.

- Mac에서는 superwhisper, MacWhisper
- 전사 실수가 있어도 Claude는 의도를 이해

### 터미널 별칭

```bash
alias c='claude'
alias gb='github'
alias co='code'
alias q='cd ~/Desktop/projects'
```

---

## 마일스톤

![25k+ GitHub Stars](./assets/images/longform/09-25k-stars.png)
*일주일 만에 25,000개 이상의 GitHub 스타*

---

## 리소스

**에이전트 오케스트레이션:**

- claude-flow — 54개 이상의 전문 에이전트가 있는 커뮤니티 빌드 엔터프라이즈 오케스트레이션 플랫폼

**자기 개선 메모리:**

- 이 저장소의 `skills/continuous-learning/` 참조
- rlancemartin.github.io/2025/12/01/claude_diary/ - 세션 반성 패턴

**시스템 프롬프트 참조:**

- system-prompts-and-models-of-ai-tools — AI 시스템 프롬프트의 커뮤니티 모음 (110k+ 스타)

**공식:**

- Anthropic Academy: anthropic.skilljar.com

---

## 참고문헌

- [Anthropic: AI 에이전트 평가의 이해](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [YK: 32개의 Claude Code 팁](https://agenticcoding.substack.com/p/32-claude-code-tips-from-basics-to)
- [RLanceMartin: 세션 반성 패턴](https://rlancemartin.github.io/2025/12/01/claude_diary/)
- @PerceptualPeak: 서브에이전트 컨텍스트 협상
- @menhguin: 에이전트 추상화 티어리스트
- @omarsar0: 복합 효과 철학

---

*두 가이드에서 다루는 모든 것은 GitHub의 [everything-claude-code](https://github.com/affaan-m/everything-claude-code)에서 이용 가능합니다*
