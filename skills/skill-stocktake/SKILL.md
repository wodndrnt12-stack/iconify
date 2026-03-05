---
description: "품질 감사를 위해 Claude skill 및 명령어를 검토할 때 사용합니다. 순차적 서브에이전트 배치 평가를 사용하는 빠른 스캔(변경된 skill만)과 전체 점검 모드를 지원합니다."
origin: ECC
---

# skill-stocktake

모든 Claude skill과 명령어를 품질 체크리스트 + AI 종합 판단으로 감사하는 슬래시 명령어(`/skill-stocktake`). 최근 변경된 skill을 위한 빠른 스캔과 전체 검토를 위한 전체 점검, 두 가지 모드를 지원합니다.

## 범위

이 명령어는 **호출된 디렉토리 기준** 다음 경로를 대상으로 합니다:

| 경로 | 설명 |
|------|-------------|
| `~/.claude/skills/` | 전역 skill (모든 프로젝트) |
| `{cwd}/.claude/skills/` | 프로젝트 수준 skill (디렉토리가 존재하는 경우) |

**Phase 1 시작 시 명령어는 발견되고 스캔된 경로를 명시적으로 나열합니다.**

### 특정 프로젝트 대상 지정

프로젝트 수준 skill을 포함하려면 해당 프로젝트의 루트 디렉토리에서 실행:

```bash
cd ~/path/to/my-project
/skill-stocktake
```

프로젝트에 `.claude/skills/` 디렉토리가 없으면 전역 skill과 명령어만 평가됩니다.

## 모드

| 모드 | 트리거 | 소요 시간 |
|------|---------|---------|
| 빠른 스캔 | `results.json` 존재 (기본값) | 5~10분 |
| 전체 점검 | `results.json` 없음, 또는 `/skill-stocktake full` | 20~30분 |

**결과 캐시:** `~/.claude/skills/skill-stocktake/results.json`

## 빠른 스캔 흐름

마지막 실행 이후 변경된 skill만 재평가합니다 (5~10분).

1. `~/.claude/skills/skill-stocktake/results.json` 읽기
2. 실행: `bash ~/.claude/skills/skill-stocktake/scripts/quick-diff.sh \
         ~/.claude/skills/skill-stocktake/results.json`
   (프로젝트 디렉토리는 `$PWD/.claude/skills`에서 자동 감지; 필요한 경우에만 명시적으로 전달)
3. 출력이 `[]`이면: "마지막 실행 이후 변경 사항 없음"을 보고하고 종료
4. 변경된 파일만 동일한 Phase 2 기준으로 재평가
5. 이전 결과에서 변경되지 않은 skill 유지
6. 차이점만 출력
7. 실행: `bash ~/.claude/skills/skill-stocktake/scripts/save-results.sh \
         ~/.claude/skills/skill-stocktake/results.json <<< "$EVAL_RESULTS"`

## 전체 점검 흐름

### Phase 1 — 인벤토리

실행: `bash ~/.claude/skills/skill-stocktake/scripts/scan.sh`

스크립트는 skill 파일을 열거하고, 프론트매터를 추출하며, UTC mtime을 수집합니다.
프로젝트 디렉토리는 `$PWD/.claude/skills`에서 자동 감지; 필요한 경우에만 명시적으로 전달.
스크립트 출력에서 스캔 요약 및 인벤토리 표를 제시:

```
스캔 중:
  ✓ ~/.claude/skills/         (17개 파일)
  ✗ {cwd}/.claude/skills/    (없음 — 전역 skill만)
```

| Skill | 7일 사용 | 30일 사용 | 설명 |
|-------|--------|---------|-------------|

### Phase 2 — 품질 평가

전체 인벤토리와 체크리스트를 포함한 Task 도구 서브에이전트(**Explore 에이전트, 모델: opus**)를 실행합니다.
서브에이전트는 각 skill을 읽고, 체크리스트를 적용하며, skill별 JSON을 반환합니다:

`{ "verdict": "유지"|"개선"|"업데이트"|"폐기"|"[X]에 병합", "reason": "..." }`

**청크 지침:** 컨텍스트를 관리 가능하게 유지하기 위해 서브에이전트 호출당 약 20개의 skill을 처리합니다. 각 청크 후 `results.json`에 중간 결과 저장 (`status: "in_progress"`).

모든 skill 평가 완료 후: `status: "completed"` 설정, Phase 3으로 진행.

**재개 감지:** 시작 시 `status: "in_progress"`가 발견되면 첫 번째 미평가 skill부터 재개.

각 skill은 다음 체크리스트에 따라 평가됩니다:

```
- [ ] 다른 skill과의 내용 중복 확인
- [ ] MEMORY.md / CLAUDE.md와의 중복 확인
- [ ] 기술적 참조의 최신성 검증 (도구 이름/CLI 플래그/API가 있는 경우 WebSearch 사용)
- [ ] 사용 빈도 고려
```

평결 기준:

| 평결 | 의미 |
|---------|---------|
| 유지 | 유용하고 최신 상태 |
| 개선 | 유지할 가치가 있으나 구체적인 개선 필요 |
| 업데이트 | 참조된 기술이 오래됨 (WebSearch로 확인) |
| 폐기 | 품질 낮음, 오래됨, 또는 비용 대비 효율 불균형 |
| [X]에 병합 | 다른 skill과 상당한 중복 존재; 병합 대상 명시 |

평가는 **종합적 AI 판단** — 수치 루브릭이 아닙니다. 안내 차원:
- **실행 가능성**: 즉시 행동할 수 있는 코드 예시, 명령어 또는 단계
- **범위 적합성**: 이름, 트리거, 내용이 정렬됨; 너무 광범위하거나 좁지 않음
- **독자성**: MEMORY.md / CLAUDE.md / 다른 skill로 대체 불가능한 가치
- **최신성**: 기술적 참조가 현재 환경에서 작동함

**이유 품질 요구사항** — `reason` 필드는 독립적이고 결정을 가능하게 해야 합니다:
- "변경 없음"만 쓰지 말 것 — 항상 핵심 증거를 다시 서술
- **폐기**의 경우: (1) 발견된 구체적 결함, (2) 동일한 필요를 충족하는 대안 서술
  - 나쁜 예: `"대체됨"`
  - 좋은 예: `"disable-model-invocation: true가 이미 설정됨; continuous-learning-v2로 대체됨(동일한 패턴과 신뢰도 점수 포함). 고유한 내용 없음."`
- **병합**의 경우: 대상을 명시하고 통합할 내용 설명
  - 나쁜 예: `"X와 중복"`
  - 좋은 예: `"42줄 얇은 내용; chatlog-to-article의 Step 4가 이미 동일한 워크플로우를 다룸. 'article angle' 팁을 해당 skill의 노트로 통합."`
- **개선**의 경우: 필요한 구체적 변경 설명 (어떤 섹션, 어떤 작업, 해당하는 경우 목표 크기)
  - 나쁜 예: `"너무 길음"`
  - 좋은 예: `"276줄; '프레임워크 비교' 섹션(L80~140)이 ai-era-architecture-principles와 중복; 삭제하여 ~150줄로 줄이기."`
- **유지** (빠른 스캔에서 mtime만 변경된 경우): 원래 평결 근거 재서술, "변경 없음" 쓰지 말 것
  - 나쁜 예: `"변경 없음"`
  - 좋은 예: `"mtime이 업데이트되었으나 내용은 변경 없음. rules/python/에서 명시적으로 임포트하는 고유한 Python 참조; 중복 없음."`

### Phase 3 — 요약 표

| Skill | 7일 사용 | 평결 | 이유 |
|-------|--------|---------|--------|

### Phase 4 — 통합

1. **폐기 / 병합**: 사용자 확인 전 파일별 상세 근거 제시:
   - 발견된 구체적 문제 (중복, 오래됨, 깨진 참조 등)
   - 동일한 기능을 다루는 대안 (폐기의 경우: 기존 skill/규칙; 병합의 경우: 대상 파일과 통합할 내용)
   - 제거의 영향 (영향받는 종속 skill, MEMORY.md 참조, 또는 워크플로우)
2. **개선**: 근거와 함께 구체적 개선 제안 제시:
   - 변경할 내용과 이유 (예: "섹션 X/Y가 python-patterns와 중복되므로 430→200줄로 줄이기")
   - 사용자가 실행 여부 결정
3. **업데이트**: 소스 확인과 함께 업데이트된 내용 제시
4. MEMORY.md 줄 수 확인; 100줄 초과 시 압축 제안

## 결과 파일 스키마

`~/.claude/skills/skill-stocktake/results.json`:

**`evaluated_at`**: 평가 완료의 실제 UTC 시간으로 설정해야 합니다.
Bash로 얻기: `date -u +%Y-%m-%dT%H:%M:%SZ`. `T00:00:00Z`와 같은 날짜만 있는 근사값 사용 금지.

```json
{
  "evaluated_at": "2026-02-21T10:00:00Z",
  "mode": "full",
  "batch_progress": {
    "total": 80,
    "evaluated": 80,
    "status": "completed"
  },
  "skills": {
    "skill-name": {
      "path": "~/.claude/skills/skill-name/SKILL.md",
      "verdict": "Keep",
      "reason": "Concrete, actionable, unique value for X workflow",
      "mtime": "2026-01-15T08:30:00Z"
    }
  }
}
```

## 참고 사항

- 평가는 블라인드: 출처(ECC, 직접 작성, 자동 추출)에 관계없이 모든 skill에 동일한 체크리스트 적용
- 아카이브 / 삭제 작업은 항상 사용자의 명시적 확인 필요
- skill 출처에 따른 평결 분기 없음
