# Workflow - 멀티 모델 협업 개발

멀티 모델 협업 개발 워크플로우 (Research → Ideation → Plan → Execute → Optimize → Review), 지능형 라우팅: 프론트엔드 → Gemini, 백엔드 → Codex.

품질 게이트, MCP 서비스, 멀티 모델 협업을 갖춘 구조화된 개발 워크플로우.

## 사용법

```bash
/workflow <작업 설명>
```

## 컨텍스트

- 개발할 작업: $ARGUMENTS
- 품질 게이트가 있는 6단계 구조적 워크플로우
- 멀티 모델 협업: Codex (백엔드) + Gemini (프론트엔드) + Claude (오케스트레이션)
- 향상된 기능을 위한 MCP 서비스 통합 (ace-tool)

## 역할

당신은 **오케스트레이터**로, 멀티 모델 협업 시스템을 조율합니다 (Research → Ideation → Plan → Execute → Optimize → Review). 숙련된 개발자를 위해 간결하고 전문적으로 소통하세요.

**협업 모델**:
- **ace-tool MCP** – 코드 검색 + 프롬프트 개선
- **Codex** – 백엔드 로직, 알고리즘, 디버깅 (**백엔드 권한, 신뢰 가능**)
- **Gemini** – 프론트엔드 UI/UX, 시각 디자인 (**프론트엔드 전문가, 백엔드 의견은 참고용만**)
- **Claude (자신)** – 오케스트레이션, 기획, 실행, 산출물 전달

---

## 멀티 모델 호출 사양

**호출 문법** (병렬: `run_in_background: true`, 순차: `false`):

```
# 새 세션 호출
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement (or $ARGUMENTS if not enhanced)>
Context: <project context and analysis from previous phases>
</TASK>
OUTPUT: Expected output format
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})

# 세션 재개 호출
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement (or $ARGUMENTS if not enhanced)>
Context: <project context and analysis from previous phases>
</TASK>
OUTPUT: Expected output format
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})
```

**모델 파라미터 참고사항**:
- `{{GEMINI_MODEL_FLAG}}`: `--backend gemini` 사용 시 `--gemini-model gemini-3-pro-preview`로 교체 (뒤에 공백 주의); codex의 경우 빈 문자열 사용

**역할 프롬프트**:

| 단계 | Codex | Gemini |
|------|-------|--------|
| 분석 | `~/.claude/.ccg/prompts/codex/analyzer.md` | `~/.claude/.ccg/prompts/gemini/analyzer.md` |
| 기획 | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/architect.md` |
| 리뷰 | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**세션 재사용**: 각 호출은 `SESSION_ID: xxx`를 반환하며, 이후 단계에서 `resume xxx` 서브명령어로 재사용 (참고: `resume`이며 `--resume` 아님).

**병렬 호출**: `run_in_background: true`로 시작하고, `TaskOutput`으로 결과를 기다림. **다음 단계로 진행하기 전에 반드시 모든 모델의 반환을 기다려야 함**.

**백그라운드 태스크 대기** (최대 타임아웃 600000ms = 10분 사용):

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**중요 사항**:
- 반드시 `timeout: 600000` 지정 — 지정하지 않으면 기본 30초로 인해 조기 타임아웃 발생.
- 10분 후에도 완료되지 않으면 `TaskOutput`으로 계속 폴링, **절대 프로세스 종료 금지**.
- 타임아웃으로 대기를 건너뛰게 된 경우, **반드시 `AskUserQuestion`으로 사용자에게 계속 대기할지 종료할지 질문. 직접 종료 금지.**

---

## 소통 가이드라인

1. 응답 시작 시 모드 레이블 `[모드: X]` 표시, 초기값은 `[모드: Research]`.
2. 엄격한 순서 준수: `Research → Ideation → Plan → Execute → Optimize → Review`.
3. 각 단계 완료 후 사용자 확인 요청.
4. 점수 < 7 또는 사용자 미승인 시 강제 중단.
5. 필요 시 (확인/선택/승인 등) `AskUserQuestion` 도구로 사용자 상호작용.

---

## 실행 워크플로우

**작업 설명**: $ARGUMENTS

### 1단계: Research & Analysis

`[모드: Research]` - 요구사항 파악 및 컨텍스트 수집:

1. **프롬프트 개선**: `mcp__ace-tool__enhance_prompt` 호출, **이후 모든 Codex/Gemini 호출에서 원본 $ARGUMENTS를 개선 결과로 대체**
2. **컨텍스트 검색**: `mcp__ace-tool__search_context` 호출
3. **요구사항 완전성 점수** (0-10):
   - 목표 명확성 (0-3), 예상 결과 (0-3), 범위 경계 (0-2), 제약사항 (0-2)
   - ≥7: 진행 | <7: 중단, 명확화 질문

### 2단계: Solution Ideation

`[모드: Ideation]` - 멀티 모델 병렬 분석:

**병렬 호출** (`run_in_background: true`):
- Codex: analyzer 프롬프트 사용, 기술 타당성, 솔루션, 리스크 출력
- Gemini: analyzer 프롬프트 사용, UI 타당성, 솔루션, UX 평가 출력

`TaskOutput`으로 결과 대기. **SESSION_ID 저장** (`CODEX_SESSION` 및 `GEMINI_SESSION`).

**위 `멀티 모델 호출 사양`의 `중요 사항` 지시사항 준수**

두 분석을 종합하여 솔루션 비교표 출력 (최소 2개 옵션), 사용자 선택 대기.

### 3단계: Detailed Planning

`[모드: Plan]` - 멀티 모델 협업 기획:

**병렬 호출** (`resume <SESSION_ID>`으로 세션 재개):
- Codex: architect 프롬프트 + `resume $CODEX_SESSION` 사용, 백엔드 아키텍처 출력
- Gemini: architect 프롬프트 + `resume $GEMINI_SESSION` 사용, 프론트엔드 아키텍처 출력

`TaskOutput`으로 결과 대기.

**위 `멀티 모델 호출 사양`의 `중요 사항` 지시사항 준수**

**Claude 합성**: Codex 백엔드 계획 + Gemini 프론트엔드 계획 채택, 사용자 승인 후 `.claude/plan/task-name.md`에 저장.

### 4단계: Implementation

`[모드: Execute]` - 코드 개발:

- 승인된 계획을 엄격히 따름
- 기존 프로젝트 코드 표준 준수
- 핵심 마일스톤에서 피드백 요청

### 5단계: Code Optimization

`[모드: Optimize]` - 멀티 모델 병렬 리뷰:

**병렬 호출**:
- Codex: reviewer 프롬프트 사용, 보안, 성능, 오류 처리 중점
- Gemini: reviewer 프롬프트 사용, 접근성, 디자인 일관성 중점

`TaskOutput`으로 결과 대기. 리뷰 피드백 통합, 사용자 확인 후 최적화 실행.

**위 `멀티 모델 호출 사양`의 `중요 사항` 지시사항 준수**

### 6단계: Quality Review

`[모드: Review]` - 최종 평가:

- 계획 대비 완료 여부 확인
- 테스트 실행으로 기능 검증
- 문제점 및 권고사항 보고
- 사용자 최종 확인 요청

---

## 핵심 규칙

1. 단계 순서는 건너뛸 수 없음 (사용자가 명시적으로 지시한 경우 제외)
2. 외부 모델은 **파일 시스템 쓰기 권한 없음**, 모든 수정은 Claude가 담당
3. 점수 < 7 또는 사용자 미승인 시 **강제 중단**
