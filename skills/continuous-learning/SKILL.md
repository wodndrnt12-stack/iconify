---
name: continuous-learning
description: Claude Code 세션에서 재사용 가능한 패턴을 자동으로 추출하여 향후 사용을 위한 학습된 스킬로 저장합니다.
origin: ECC
---

# 지속적 학습 스킬

세션 종료 시 Claude Code 세션을 자동으로 평가하여 학습된 스킬로 저장할 수 있는 재사용 가능한 패턴을 추출합니다.

## 활성화 조건

- Claude Code 세션에서 자동 패턴 추출 설정 시
- 세션 평가를 위한 Stop 훅 구성 시
- `~/.claude/skills/learned/`의 학습된 스킬 검토 또는 정리 시
- 추출 임계값 또는 패턴 카테고리 조정 시
- v1(이것)과 v2(본능 기반) 접근 방식 비교 시

## 작동 방식

이 스킬은 각 세션 종료 시 **Stop 훅**으로 실행됩니다:

1. **세션 평가**: 세션에 충분한 메시지가 있는지 확인 (기본값: 10개 이상)
2. **패턴 감지**: 세션에서 추출 가능한 패턴 식별
3. **스킬 추출**: 유용한 패턴을 `~/.claude/skills/learned/`에 저장

## 설정

`config.json`을 편집하여 커스터마이징:

```json
{
  "min_session_length": 10,
  "extraction_threshold": "medium",
  "auto_approve": false,
  "learned_skills_path": "~/.claude/skills/learned/",
  "patterns_to_detect": [
    "error_resolution",
    "user_corrections",
    "workarounds",
    "debugging_techniques",
    "project_specific"
  ],
  "ignore_patterns": [
    "simple_typos",
    "one_time_fixes",
    "external_api_issues"
  ]
}
```

## 패턴 유형

| 패턴 | 설명 |
|---------|-------------|
| `error_resolution` | 특정 에러가 해결된 방법 |
| `user_corrections` | 사용자 수정으로부터의 패턴 |
| `workarounds` | 프레임워크/라이브러리 특이사항에 대한 해결책 |
| `debugging_techniques` | 효과적인 디버깅 접근 방식 |
| `project_specific` | 프로젝트별 관례 |

## 훅 설정

`~/.claude/settings.json`에 추가:

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning/evaluate-session.sh"
      }]
    }]
  }
}
```

## Stop 훅을 사용하는 이유?

- **경량**: 세션 종료 시 한 번만 실행
- **비차단**: 모든 메시지에 지연을 추가하지 않음
- **완전한 컨텍스트**: 전체 세션 트랜스크립트에 접근 가능

## 관련 항목

- [롱폼 가이드](https://x.com/affaanmustafa/status/2014040193557471352) - 지속적 학습 섹션
- `/learn` 명령어 - 세션 중 수동 패턴 추출

---

## 비교 노트 (리서치: 2025년 1월)

### Homunculus와 비교

Homunculus v2는 더 정교한 접근 방식을 취합니다:

| 기능 | 우리의 접근 방식 | Homunculus v2 |
|---------|--------------|---------------|
| 관찰 | Stop 훅 (세션 종료) | PreToolUse/PostToolUse 훅 (100% 신뢰성) |
| 분석 | 메인 컨텍스트 | 백그라운드 에이전트 (Haiku) |
| 세분성 | 전체 스킬 | 원자적 "본능" |
| 신뢰도 | 없음 | 0.3-0.9 가중치 |
| 발전 | 스킬로 직접 | 본능 → 클러스터 → 스킬/명령어/에이전트 |
| 공유 | 없음 | 본능 내보내기/가져오기 |

**homunculus의 핵심 인사이트:**
> "v1은 스킬을 사용하여 관찰에 의존했습니다. 스킬은 확률적 — Claude의 판단에 따라 ~50-80% 시간만 실행됩니다. v2는 훅을 관찰에 사용하고 (100% 신뢰성) 본능을 학습된 행동의 원자 단위로 사용합니다."

### 잠재적 v2 개선 사항

1. **본능 기반 학습** - 신뢰도 점수를 가진 더 작고 원자적인 동작
2. **백그라운드 관찰자** - 병렬로 분석하는 Haiku 에이전트
3. **신뢰도 감소** - 모순될 경우 본능이 신뢰도를 잃음
4. **도메인 태깅** - code-style, testing, git, debugging 등
5. **발전 경로** - 관련 본능을 스킬/명령어로 클러스터링

참조: `/Users/affoon/Documents/tasks/12-continuous-learning-v2.md` 전체 명세.
