# 실행 - 멀티 모델 협업 실행

멀티 모델 협업 실행 - 계획에서 프로토타입 획득 → Claude가 리팩터링 및 구현 → 멀티 모델 감사 및 납품.

$ARGUMENTS

---

## 핵심 프로토콜

- **언어 프로토콜**: 도구/모델과 상호작용 시 **영어** 사용, 사용자와는 사용자 언어로 소통
- **코드 주권**: 외부 모델은 **파일 시스템 쓰기 접근 없음**, 모든 수정은 Claude가 수행
- **더티 프로토타입 리팩터링**: Codex/Gemini Unified Diff를 "더티 프로토타입"으로 취급, 프로덕션 수준 코드로 리팩터링 필수
- **손절 메커니즘**: 현재 단계 출력이 검증될 때까지 다음 단계로 진행하지 않음
- **선행 조건**: 사용자가 `/ccg:plan` 출력에 명시적으로 "Y"로 응답한 후에만 실행 (없는 경우 먼저 확인 필수)

---

## 멀티 모델 호출 사양

**호출 구문** (병렬: `run_in_background: true` 사용):

```
# 세션 재개 호출 (권장) - 구현 프로토타입
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <task description>
Context: <plan content + target files>
</TASK>
OUTPUT: Unified Diff Patch ONLY. Strictly prohibit any actual modifications.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "간략한 설명"
})

# 새 세션 호출 - 구현 프로토타입
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <task description>
Context: <plan content + target files>
</TASK>
OUTPUT: Unified Diff Patch ONLY. Strictly prohibit any actual modifications.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "간략한 설명"
})
```

**감사 호출 구문** (코드 검토 / 감사):

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Scope: 최종 코드 변경 사항 감사.
입력:
- 적용된 패치 (git diff / 최종 unified diff)
- 수정된 파일 (필요 시 관련 발췌)
제약:
- 파일을 수정하지 않음.
- 파일 시스템 접근을 가정하는 도구 명령을 출력하지 않음.
</TASK>
OUTPUT:
1) 우선순위가 지정된 문제 목록 (심각도, 파일, 근거)
2) 구체적인 수정; 코드 변경이 필요한 경우 펜스 코드 블록에 Unified Diff Patch 포함.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "간략한 설명"
})
```

**모델 파라미터 참고**:
- `{{GEMINI_MODEL_FLAG}}`: `--backend gemini` 사용 시 `--gemini-model gemini-3-pro-preview`로 교체 (후행 공백 주의); codex의 경우 빈 문자열 사용

**역할 프롬프트**:

| 단계 | Codex | Gemini |
|-------|-------|--------|
| 구현 | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/frontend.md` |
| 검토 | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**세션 재사용**: `/ccg:plan`이 SESSION_ID를 제공한 경우 `resume <SESSION_ID>`로 컨텍스트 재사용.

**백그라운드 작업 대기** (최대 타임아웃 600000ms = 10분):

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**중요**:
- 반드시 `timeout: 600000` 지정, 그렇지 않으면 기본 30초로 인해 조기 타임아웃 발생
- 10분 후에도 완료되지 않으면 `TaskOutput`으로 계속 폴링, **절대 프로세스를 종료하지 않음**
- 타임아웃으로 인해 대기를 건너뛴 경우, **반드시 `AskUserQuestion`을 호출하여 계속 기다릴지 작업을 종료할지 사용자에게 확인**

---

## 실행 워크플로우

**실행할 작업**: $ARGUMENTS

### 0단계: 계획 읽기

`[Mode: Prepare]`

1. **입력 유형 식별**:
   - 계획 파일 경로 (예: `.claude/plan/xxx.md`)
   - 직접 작업 설명

2. **계획 내용 읽기**:
   - 계획 파일 경로가 제공된 경우 읽고 파싱
   - 추출: 작업 유형, 구현 단계, 주요 파일, SESSION_ID

3. **실행 전 확인**:
   - 입력이 "직접 작업 설명"이거나 계획에 `SESSION_ID` / 주요 파일이 없는 경우: 먼저 사용자 확인
   - 사용자가 계획에 "Y"로 응답했음을 확인할 수 없는 경우: 진행 전에 다시 확인 필수

4. **작업 유형 라우팅**:

   | 작업 유형 | 감지 | 경로 |
   |-----------|-----------|-------|
   | **프론트엔드** | 페이지, 컴포넌트, UI, 스타일, 레이아웃 | Gemini |
   | **백엔드** | API, 인터페이스, 데이터베이스, 로직, 알고리즘 | Codex |
   | **풀스택** | 프론트엔드와 백엔드 모두 포함 | Codex ∥ Gemini 병렬 |

---

### 1단계: 빠른 컨텍스트 검색

`[Mode: Retrieval]`

**MCP 도구를 사용한 빠른 컨텍스트 검색 필수, 파일을 하나씩 수동으로 읽지 않음**

계획의 "주요 파일" 목록을 기반으로 `mcp__ace-tool__search_context` 호출:

```
mcp__ace-tool__search_context({
  query: "<계획 내용 기반 시맨틱 쿼리, 주요 파일, 모듈, 함수 이름 포함>",
  project_root_path: "$PWD"
})
```

**검색 전략**:
- 계획의 "주요 파일" 테이블에서 대상 경로 추출
- 진입 파일, 의존성 모듈, 관련 타입 정의를 포함하는 시맨틱 쿼리 구성
- 결과가 불충분하면 1-2회 재귀적 검색 추가
- **절대** Bash + find/ls를 사용하여 프로젝트 구조를 수동으로 탐색하지 않음

**검색 후**:
- 검색된 코드 스니펫 정리
- 구현을 위한 완전한 컨텍스트 확인
- 3단계로 진행

---

### 3단계: 프로토타입 획득

`[Mode: Prototype]`

**작업 유형에 따른 라우팅**:

#### 경로 A: 프론트엔드/UI/스타일 → Gemini

**제한**: 컨텍스트 < 32k 토큰

1. Gemini 호출 (`~/.claude/.ccg/prompts/gemini/frontend.md` 사용)
2. 입력: 계획 내용 + 검색된 컨텍스트 + 대상 파일
3. OUTPUT: `Unified Diff Patch ONLY. Strictly prohibit any actual modifications.`
4. **Gemini는 프론트엔드 설계 권위자, CSS/React/Vue 프로토타입이 최종 시각적 기준선**
5. **경고**: Gemini의 백엔드 로직 제안 무시
6. 계획에 `GEMINI_SESSION`이 있는 경우: `resume <GEMINI_SESSION>` 선호

#### 경로 B: 백엔드/로직/알고리즘 → Codex

1. Codex 호출 (`~/.claude/.ccg/prompts/codex/architect.md` 사용)
2. 입력: 계획 내용 + 검색된 컨텍스트 + 대상 파일
3. OUTPUT: `Unified Diff Patch ONLY. Strictly prohibit any actual modifications.`
4. **Codex는 백엔드 로직 권위자, 논리적 추론 및 디버그 능력 활용**
5. 계획에 `CODEX_SESSION`이 있는 경우: `resume <CODEX_SESSION>` 선호

#### 경로 C: 풀스택 → 병렬 호출

1. **병렬 호출** (`run_in_background: true`):
   - Gemini: 프론트엔드 처리
   - Codex: 백엔드 처리
2. `TaskOutput`으로 두 모델의 완전한 결과 대기
3. 각각 `resume` 호출을 위해 계획의 해당 `SESSION_ID` 사용 (없으면 새 세션 생성)

**위의 `멀티 모델 호출 사양`의 `중요` 지침 준수**

---

### 4단계: 코드 구현

`[Mode: Implement]`

**Claude가 코드 주권자로서 다음 단계를 실행**:

1. **Diff 읽기**: Codex/Gemini가 반환한 Unified Diff Patch 파싱

2. **멘탈 샌드박스**:
   - 대상 파일에 Diff 적용 시뮬레이션
   - 논리적 일관성 확인
   - 잠재적 충돌 또는 부작용 파악

3. **리팩터링 및 정리**:
   - "더티 프로토타입"을 **가독성 높고 유지 관리 가능한 엔터프라이즈 수준 코드**로 리팩터링
   - 중복 코드 제거
   - 프로젝트의 기존 코드 표준 준수 확보
   - **필요한 경우가 아니면 주석/문서 생성 안 함**, 코드는 자체 설명적이어야 함

4. **최소 범위**:
   - 요구 사항 범위에만 변경 제한
   - 부작용에 대한 **필수 검토**
   - 타겟화된 수정 실행

5. **변경 사항 적용**:
   - Edit/Write 도구를 사용하여 실제 수정 실행
   - **필요한 코드만 수정**, 사용자의 다른 기존 기능에 영향 미치지 않음

6. **자체 검증** (강력 권장):
   - 프로젝트의 기존 lint / typecheck / 테스트 실행 (최소 관련 범위 우선)
   - 실패 시: 먼저 회귀 수정 후 5단계 진행

---

### 5단계: 감사 및 납품

`[Mode: Audit]`

#### 5.1 자동 감사

**변경 사항이 적용된 후, 즉시 Codex와 Gemini를 병렬로 호출하여 코드 검토 수행**:

1. **Codex 검토** (`run_in_background: true`):
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
   - 입력: 변경된 Diff + 대상 파일
   - 집중: 보안, 성능, 오류 처리, 로직 정확성

2. **Gemini 검토** (`run_in_background: true`):
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
   - 입력: 변경된 Diff + 대상 파일
   - 집중: 접근성, 디자인 일관성, 사용자 경험

`TaskOutput`으로 두 모델의 완전한 검토 결과 대기. 컨텍스트 일관성을 위해 3단계 세션 재사용 선호 (`resume <SESSION_ID>`).

#### 5.2 통합 및 수정

1. Codex + Gemini 검토 피드백 종합
2. 신뢰 규칙에 따라 가중치 부여: 백엔드는 Codex, 프론트엔드는 Gemini 준수
3. 필요한 수정 실행
4. 위험이 허용 가능할 때까지 필요 시 5.1 반복

#### 5.3 납품 확인

감사 통과 후 사용자에게 보고:

```markdown
## 실행 완료

### 변경 요약
| 파일 | 작업 | 설명 |
|------|-----------|-------------|
| path/to/file.ts | 수정됨 | 설명 |

### 감사 결과
- Codex: <통과/N개 문제 발견>
- Gemini: <통과/N개 문제 발견>

### 권장 사항
1. [ ] <제안된 테스트 단계>
2. [ ] <제안된 검증 단계>
```

---

## 핵심 규칙

1. **코드 주권** – 모든 파일 수정은 Claude, 외부 모델은 쓰기 접근 없음
2. **더티 프로토타입 리팩터링** – Codex/Gemini 출력을 초안으로 취급, 리팩터링 필수
3. **신뢰 규칙** – 백엔드는 Codex, 프론트엔드는 Gemini 준수
4. **최소 변경** – 필요한 코드만 수정, 부작용 없음
5. **필수 감사** – 변경 후 반드시 멀티 모델 코드 검토 수행

---

## 사용법

```bash
# 계획 파일 실행
/ccg:execute .claude/plan/feature-name.md

# 직접 작업 실행 (컨텍스트에서 이미 논의된 계획의 경우)
/ccg:execute implement user authentication based on previous plan
```

---

## /ccg:plan과의 관계

1. `/ccg:plan`이 계획 + SESSION_ID 생성
2. 사용자가 "Y"로 확인
3. `/ccg:execute`가 계획을 읽고, SESSION_ID를 재사용하여 구현 실행
