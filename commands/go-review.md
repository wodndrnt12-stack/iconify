---
description: 관용적 패턴, 동시성 안전성, 오류 처리 및 보안에 대한 포괄적인 Go 코드 리뷰. go-reviewer 에이전트를 호출합니다.
---

# Go 코드 리뷰

이 명령은 포괄적인 Go 특화 코드 리뷰를 위해 **go-reviewer** 에이전트를 호출합니다.

## 이 명령이 하는 일

1. **Go 변경 사항 식별**: `git diff`를 통해 수정된 `.go` 파일 찾기
2. **정적 분석 실행**: `go vet`, `staticcheck`, `golangci-lint` 실행
3. **보안 스캔**: SQL 인젝션, 명령 인젝션, 레이스 컨디션 확인
4. **동시성 검토**: 고루틴 안전성, 채널 사용, 뮤텍스 패턴 분석
5. **관용적 Go 확인**: Go 관례 및 모범 사례 준수 여부 확인
6. **보고서 생성**: 심각도별 문제 분류

## 사용 시기

다음 경우에 `/go-review`를 사용합니다:
- Go 코드를 작성하거나 수정한 후
- Go 변경 사항을 커밋하기 전
- Go 코드가 포함된 Pull Request 검토 시
- 새로운 Go 코드베이스에 온보딩 시
- 관용적 Go 패턴 학습 시

## 검토 분류

### CRITICAL (반드시 수정)
- SQL/명령 인젝션 취약점
- 동기화 없는 레이스 컨디션
- 고루틴 누수
- 하드코딩된 자격증명
- 안전하지 않은 포인터 사용
- 중요 경로에서 무시된 오류

### HIGH (수정 권장)
- 컨텍스트 없는 오류 래핑 누락
- 오류 반환 대신 패닉 사용
- 컨텍스트가 전파되지 않음
- 데드락을 유발하는 버퍼 없는 채널
- 인터페이스 미충족 오류
- 뮤텍스 보호 누락

### MEDIUM (고려 사항)
- 비관용적 코드 패턴
- 내보낸 항목에 godoc 주석 누락
- 비효율적인 문자열 연결
- 슬라이스 사전 할당 안 됨
- 테이블 기반 테스트 미사용

## 실행되는 자동 검사

```bash
# 정적 분석
go vet ./...

# 고급 검사 (설치된 경우)
staticcheck ./...
golangci-lint run

# 레이스 감지
go build -race ./...

# 보안 취약점
govulncheck ./...
```

## 사용 예시

```text
사용자: /go-review

에이전트:
# Go 코드 리뷰 보고서

## 검토된 파일
- internal/handler/user.go (수정됨)
- internal/service/auth.go (수정됨)

## 정적 분석 결과
✓ go vet: 문제 없음
✓ staticcheck: 문제 없음

## 발견된 문제

[CRITICAL] 레이스 컨디션
파일: internal/service/auth.go:45
문제: 동기화 없이 공유 맵에 접근
```go
var cache = map[string]*Session{}  // 동시 접근!

func GetSession(id string) *Session {
    return cache[id]  // 레이스 컨디션
}
```
수정: sync.RWMutex 또는 sync.Map 사용
```go
var (
    cache   = map[string]*Session{}
    cacheMu sync.RWMutex
)

func GetSession(id string) *Session {
    cacheMu.RLock()
    defer cacheMu.RUnlock()
    return cache[id]
}
```

[HIGH] 오류 컨텍스트 누락
파일: internal/handler/user.go:28
문제: 컨텍스트 없이 오류 반환
```go
return err  // 컨텍스트 없음
```
수정: 컨텍스트와 함께 래핑
```go
return fmt.Errorf("get user %s: %w", userID, err)
```

## 요약
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

권장 사항: ❌ CRITICAL 문제가 수정될 때까지 병합 차단
```

## 승인 기준

| 상태 | 조건 |
|--------|-----------|
| ✅ 승인 | CRITICAL 또는 HIGH 문제 없음 |
| 주의 | MEDIUM 문제만 있음 (주의하여 병합) |
| ❌ 차단 | CRITICAL 또는 HIGH 문제 발견 |

## 다른 명령과의 통합

- 테스트가 통과하는지 먼저 `/go-test` 사용
- 빌드 오류가 발생하면 `/go-build` 사용
- 커밋 전에 `/go-review` 사용
- Go 특화가 아닌 관심사에는 `/code-review` 사용

## 관련

- 에이전트: `agents/go-reviewer.md`
- 스킬: `skills/golang-patterns/`, `skills/golang-testing/`
