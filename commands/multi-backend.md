# 백엔드 - 백엔드 중심 개발

백엔드 중심 워크플로우 (리서치 → 아이디어 → 계획 → 실행 → 최적화 → 검토), Codex 주도.

## 사용법

```bash
/backend <백엔드 작업 설명>
```

## 컨텍스트

- 백엔드 작업: $ARGUMENTS
- Codex 주도, Gemini는 보조 참조용
- 적용 대상: API 설계, 알고리즘 구현, 데이터베이스 최적화, 비즈니스 로직

## 역할

**백엔드 오케스트레이터**로서 서버 사이드 작업을 위한 멀티 모델 협업을 조율합니다 (리서치 → 아이디어 → 계획 → 실행 → 최적화 → 검토).

**협업 모델**:
- **Codex** – 백엔드 로직, 알고리즘 (**백엔드 권위자, 신뢰할 수 있음**)
- **Gemini** – 프론트엔드 관점 (**백엔드 의견은 참조용만**)
- **Claude (self)** – 오케스트레이션, 계획, 실행, 납품

---

## 멀티 모델 호출 사양

**호출 구문**:

```
# 새 세션 호출
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend codex - \"$PWD\" <<'EOF'
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
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend codex resume <SESSION_ID> - \"$PWD\" <<'EOF'
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

| 단계 | Codex |
|-------|-------|
| 분석 | `~/.claude/.ccg/prompts/codex/analyzer.md` |
| 계획 | `~/.claude/.ccg/prompts/codex/architect.md` |
| 검토 | `~/.claude/.ccg/prompts/codex/reviewer.md` |

**세션 재사용**: 각 호출은 `SESSION_ID: xxx`를 반환하며, 후속 단계에는 `resume xxx`를 사용합니다. 2단계에서 `CODEX_SESSION`을 저장하고, 3단계와 5단계에서 `resume`을 사용합니다.

---

## 커뮤니케이션 가이드라인

1. 응답을 모드 레이블 `[Mode: X]`로 시작하며, 초기값은 `[Mode: Research]`
2. 엄격한 순서 준수: `리서치 → 아이디어 → 계획 → 실행 → 최적화 → 검토`
3. 필요 시 (확인/선택/승인 등) `AskUserQuestion` 도구로 사용자와 상호작용

---

## 핵심 워크플로우

### 0단계: 프롬프트 향상 (선택 사항)

`[Mode: Prepare]` - ace-tool MCP를 사용할 수 있는 경우 `mcp__ace-tool__enhance_prompt` 호출, **후속 Codex 호출에 원래 $ARGUMENTS 대신 향상된 결과 사용**

### 1단계: 리서치

`[Mode: Research]` - 요구 사항 이해 및 컨텍스트 수집

1. **코드 검색** (ace-tool MCP 사용 가능한 경우): `mcp__ace-tool__search_context`를 호출하여 기존 API, 데이터 모델, 서비스 아키텍처 검색
2. 요구 사항 완성도 점수 (0-10): >=7이면 계속, <7이면 중지하고 보완

### 2단계: 아이디어

`[Mode: Ideation]` - Codex 주도 분석

**반드시 Codex 호출** (위의 호출 사양 준수):
- ROLE_FILE: `~/.claude/.ccg/prompts/codex/analyzer.md`
- Requirement: 향상된 요구 사항 (향상되지 않은 경우 $ARGUMENTS)
- Context: 1단계의 프로젝트 컨텍스트
- OUTPUT: 기술 실현 가능성 분석, 권장 솔루션 (최소 2개), 위험 평가

**SESSION_ID 저장** (`CODEX_SESSION`) 후속 단계 재사용을 위해.

솔루션 출력 (최소 2개), 사용자 선택 대기.

### 3단계: 계획

`[Mode: Plan]` - Codex 주도 계획

**반드시 Codex 호출** (`resume <CODEX_SESSION>`으로 세션 재사용):
- ROLE_FILE: `~/.claude/.ccg/prompts/codex/architect.md`
- Requirement: 사용자가 선택한 솔루션
- Context: 2단계의 분석 결과
- OUTPUT: 파일 구조, 함수/클래스 설계, 의존성 관계

Claude가 계획을 종합하고, 사용자 승인 후 `.claude/plan/task-name.md`에 저장.

### 4단계: 구현

`[Mode: Execute]` - 코드 개발

- 승인된 계획을 엄격히 준수
- 기존 프로젝트 코드 표준 준수
- 오류 처리, 보안, 성능 최적화 확보

### 5단계: 최적화

`[Mode: Optimize]` - Codex 주도 검토

**반드시 Codex 호출** (위의 호출 사양 준수):
- ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
- Requirement: 다음 백엔드 코드 변경 사항 검토
- Context: git diff 또는 코드 내용
- OUTPUT: 보안, 성능, 오류 처리, API 준수 문제 목록

검토 피드백 통합, 사용자 확인 후 최적화 실행.

### 6단계: 품질 검토

`[Mode: Review]` - 최종 평가

- 계획 대비 완성도 확인
- 기능 검증을 위한 테스트 실행
- 문제 및 권장 사항 보고

---

## 핵심 규칙

1. **Codex 백엔드 의견은 신뢰할 수 있음**
2. **Gemini 백엔드 의견은 참조용만**
3. 외부 모델은 **파일 시스템 쓰기 접근 없음**
4. Claude가 모든 코드 작성 및 파일 작업 처리
