# 프론트엔드 - 프론트엔드 중심 개발

프론트엔드 중심 워크플로우 (리서치 → 아이디어 → 계획 → 실행 → 최적화 → 검토), Gemini 주도.

## 사용법

```bash
/frontend <UI 작업 설명>
```

## 컨텍스트

- 프론트엔드 작업: $ARGUMENTS
- Gemini 주도, Codex는 보조 참조용
- 적용 대상: 컴포넌트 설계, 반응형 레이아웃, UI 애니메이션, 스타일 최적화

## 역할

**프론트엔드 오케스트레이터**로서 UI/UX 작업을 위한 멀티 모델 협업을 조율합니다 (리서치 → 아이디어 → 계획 → 실행 → 최적화 → 검토).

**협업 모델**:
- **Gemini** – 프론트엔드 UI/UX (**프론트엔드 권위자, 신뢰할 수 있음**)
- **Codex** – 백엔드 관점 (**프론트엔드 의견은 참조용만**)
- **Claude (self)** – 오케스트레이션, 계획, 실행, 납품

---

## 멀티 모델 호출 사양

**호출 구문**:

```
# 새 세션 호출
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend gemini --gemini-model gemini-3-pro-preview - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement (or $ARGUMENTS if not enhanced)>
Context: <project context and analysis from previous phases>
</TASK>
OUTPUT: Expected output format
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "간략한 설명"
})

# 세션 재개 호출
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend gemini --gemini-model gemini-3-pro-preview resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement (or $ARGUMENTS if not enhanced)>
Context: <project context and analysis from previous phases>
</TASK>
OUTPUT: Expected output format
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "간략한 설명"
})
```

**역할 프롬프트**:

| 단계 | Gemini |
|-------|--------|
| 분석 | `~/.claude/.ccg/prompts/gemini/analyzer.md` |
| 계획 | `~/.claude/.ccg/prompts/gemini/architect.md` |
| 검토 | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**세션 재사용**: 각 호출은 `SESSION_ID: xxx`를 반환하며, 후속 단계에는 `resume xxx`를 사용합니다. 2단계에서 `GEMINI_SESSION`을 저장하고, 3단계와 5단계에서 `resume`을 사용합니다.

---

## 커뮤니케이션 가이드라인

1. 응답을 모드 레이블 `[Mode: X]`로 시작하며, 초기값은 `[Mode: Research]`
2. 엄격한 순서 준수: `리서치 → 아이디어 → 계획 → 실행 → 최적화 → 검토`
3. 필요 시 (확인/선택/승인 등) `AskUserQuestion` 도구로 사용자와 상호작용

---

## 핵심 워크플로우

### 0단계: 프롬프트 향상 (선택 사항)

`[Mode: Prepare]` - ace-tool MCP를 사용할 수 있는 경우 `mcp__ace-tool__enhance_prompt` 호출, **후속 Gemini 호출에 원래 $ARGUMENTS 대신 향상된 결과 사용**

### 1단계: 리서치

`[Mode: Research]` - 요구 사항 이해 및 컨텍스트 수집

1. **코드 검색** (ace-tool MCP 사용 가능한 경우): `mcp__ace-tool__search_context`를 호출하여 기존 컴포넌트, 스타일, 디자인 시스템 검색
2. 요구 사항 완성도 점수 (0-10): >=7이면 계속, <7이면 중지하고 보완

### 2단계: 아이디어

`[Mode: Ideation]` - Gemini 주도 분석

**반드시 Gemini 호출** (위의 호출 사양 준수):
- ROLE_FILE: `~/.claude/.ccg/prompts/gemini/analyzer.md`
- Requirement: 향상된 요구 사항 (향상되지 않은 경우 $ARGUMENTS)
- Context: 1단계의 프로젝트 컨텍스트
- OUTPUT: UI 실현 가능성 분석, 권장 솔루션 (최소 2개), UX 평가

**SESSION_ID 저장** (`GEMINI_SESSION`) 후속 단계 재사용을 위해.

솔루션 출력 (최소 2개), 사용자 선택 대기.

### 3단계: 계획

`[Mode: Plan]` - Gemini 주도 계획

**반드시 Gemini 호출** (`resume <GEMINI_SESSION>`으로 세션 재사용):
- ROLE_FILE: `~/.claude/.ccg/prompts/gemini/architect.md`
- Requirement: 사용자가 선택한 솔루션
- Context: 2단계의 분석 결과
- OUTPUT: 컴포넌트 구조, UI 플로우, 스타일링 접근 방식

Claude가 계획을 종합하고, 사용자 승인 후 `.claude/plan/task-name.md`에 저장.

### 4단계: 구현

`[Mode: Execute]` - 코드 개발

- 승인된 계획을 엄격히 준수
- 기존 프로젝트 디자인 시스템 및 코드 표준 준수
- 반응형 및 접근성 확보

### 5단계: 최적화

`[Mode: Optimize]` - Gemini 주도 검토

**반드시 Gemini 호출** (위의 호출 사양 준수):
- ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
- Requirement: 다음 프론트엔드 코드 변경 사항 검토
- Context: git diff 또는 코드 내용
- OUTPUT: 접근성, 반응성, 성능, 디자인 일관성 문제 목록

검토 피드백 통합, 사용자 확인 후 최적화 실행.

### 6단계: 품질 검토

`[Mode: Review]` - 최종 평가

- 계획 대비 완성도 확인
- 반응성 및 접근성 검증
- 문제 및 권장 사항 보고

---

## 핵심 규칙

1. **Gemini 프론트엔드 의견은 신뢰할 수 있음**
2. **Codex 프론트엔드 의견은 참조용만**
3. 외부 모델은 **파일 시스템 쓰기 접근 없음**
4. Claude가 모든 코드 작성 및 파일 작업 처리
