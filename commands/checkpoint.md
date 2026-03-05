# 체크포인트 명령

워크플로우에서 체크포인트를 생성하거나 검증합니다.

## 사용법

`/checkpoint [create|verify|list] [name]`

## 체크포인트 생성

체크포인트를 생성할 때:

1. `/verify quick`을 실행하여 현재 상태가 깨끗한지 확인합니다
2. 체크포인트 이름으로 git stash 또는 commit을 생성합니다
3. `.claude/checkpoints.log`에 체크포인트를 기록합니다:

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .claude/checkpoints.log
```

4. 체크포인트 생성 완료를 보고합니다

## 체크포인트 검증

체크포인트를 기준으로 검증할 때:

1. 로그에서 체크포인트를 읽습니다
2. 현재 상태를 체크포인트와 비교합니다:
   - 체크포인트 이후 추가된 파일
   - 체크포인트 이후 수정된 파일
   - 현재 vs 당시 테스트 통과율
   - 현재 vs 당시 커버리지

3. 보고:
```
CHECKPOINT COMPARISON: $NAME
============================
Files changed: X
Tests: +Y passed / -Z failed
Coverage: +X% / -Y%
Build: [PASS/FAIL]
```

## 체크포인트 목록

다음 정보와 함께 모든 체크포인트를 표시합니다:
- 이름
- 타임스탬프
- Git SHA
- 상태 (현재, 이전, 이후)

## 워크플로우

일반적인 체크포인트 흐름:

```
[시작] --> /checkpoint create "feature-start"
   |
[구현] --> /checkpoint create "core-done"
   |
[테스트] --> /checkpoint verify "core-done"
   |
[리팩터링] --> /checkpoint create "refactor-done"
   |
[PR] --> /checkpoint verify "feature-start"
```

## 인수

$ARGUMENTS:
- `create <name>` - 이름이 지정된 체크포인트 생성
- `verify <name>` - 이름이 지정된 체크포인트 기준으로 검증
- `list` - 모든 체크포인트 표시
- `clear` - 오래된 체크포인트 제거 (마지막 5개 유지)
