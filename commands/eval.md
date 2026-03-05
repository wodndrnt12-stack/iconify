# Eval 명령

평가 중심 개발 워크플로우를 관리합니다.

## 사용법

`/eval [define|check|report|list] [feature-name]`

## 평가 정의

`/eval define feature-name`

새 평가 정의를 생성합니다:

1. 템플릿으로 `.claude/evals/feature-name.md` 생성:

```markdown
## EVAL: feature-name
Created: $(date)

### 기능 평가
- [ ] [기능 1 설명]
- [ ] [기능 2 설명]

### 회귀 평가
- [ ] [기존 동작 1이 여전히 작동함]
- [ ] [기존 동작 2가 여전히 작동함]

### 성공 기준
- 기능 평가에서 pass@3 > 90%
- 회귀 평가에서 pass^3 = 100%
```

2. 사용자에게 구체적인 기준을 입력하도록 요청합니다

## 평가 확인

`/eval check feature-name`

기능에 대한 평가를 실행합니다:

1. `.claude/evals/feature-name.md`에서 평가 정의를 읽습니다
2. 각 기능 평가에 대해:
   - 기준 검증 시도
   - PASS/FAIL 기록
   - `.claude/evals/feature-name.log`에 시도 기록
3. 각 회귀 평가에 대해:
   - 관련 테스트 실행
   - 기준선과 비교
   - PASS/FAIL 기록
4. 현재 상태 보고:

```
EVAL CHECK: feature-name
========================
기능: X/Y 통과
회귀: X/Y 통과
상태: 진행 중 / 준비 완료
```

## 평가 보고

`/eval report feature-name`

포괄적인 평가 보고서를 생성합니다:

```
EVAL REPORT: feature-name
=========================
Generated: $(date)

기능 평가
----------------
[eval-1]: PASS (pass@1)
[eval-2]: PASS (pass@2) - 재시도 필요
[eval-3]: FAIL - 참고 사항 확인

회귀 평가
----------------
[test-1]: PASS
[test-2]: PASS
[test-3]: PASS

지표
-------
기능 pass@1: 67%
기능 pass@3: 100%
회귀 pass^3: 100%

참고 사항
-----
[문제점, 엣지 케이스 또는 관찰 사항]

권장 사항
--------------
[배포 / 개선 필요 / 차단됨]
```

## 평가 목록

`/eval list`

모든 평가 정의를 표시합니다:

```
평가 정의
================
feature-auth      [3/5 통과] 진행 중
feature-search    [5/5 통과] 준비 완료
feature-export    [0/4 통과] 미시작
```

## 인수

$ARGUMENTS:
- `define <name>` - 새 평가 정의 생성
- `check <name>` - 평가 실행 및 확인
- `report <name>` - 전체 보고서 생성
- `list` - 모든 평가 표시
- `clean` - 오래된 평가 로그 제거 (마지막 10회 실행 유지)
