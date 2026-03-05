---
description: Go 빌드 오류, go vet 경고 및 린터 문제를 점진적으로 수정합니다. 최소한의 정밀한 수정을 위해 go-build-resolver 에이전트를 호출합니다.
---

# Go 빌드 및 수정

이 명령은 **go-build-resolver** 에이전트를 호출하여 Go 빌드 오류를 최소한의 변경으로 점진적으로 수정합니다.

## 이 명령이 하는 일

1. **진단 실행**: `go build`, `go vet`, `staticcheck` 실행
2. **오류 파싱**: 파일별로 그룹화하고 심각도로 정렬
3. **점진적 수정**: 오류 하나씩 처리
4. **각 수정 검증**: 각 변경 후 빌드 재실행
5. **요약 보고**: 수정된 내용과 남은 내용 표시

## 사용 시기

다음 경우에 `/go-build`를 사용합니다:
- `go build ./...`가 오류로 실패할 때
- `go vet ./...`가 문제를 보고할 때
- `golangci-lint run`이 경고를 표시할 때
- 모듈 의존성이 손상되었을 때
- 빌드를 깨뜨리는 변경을 가져온 후

## 실행되는 진단 명령

```bash
# 기본 빌드 확인
go build ./...

# 정적 분석
go vet ./...

# 확장 린팅 (설치된 경우)
staticcheck ./...
golangci-lint run

# 모듈 문제
go mod verify
go mod tidy -v
```

## 예시 세션

```text
사용자: /go-build

에이전트:
# Go 빌드 해결

## 초기 진단

```bash
$ go build ./...
internal/service/user.go:25:15: undefined: UserRepository
internal/handler/api.go:42:9: cannot use x (type string) as type int
internal/handler/api.go:58:2: missing return at end of function
```

발견된 오류: 3개

## 수정 1: 정의되지 않은 식별자

파일: internal/service/user.go:25
오류: undefined: UserRepository
원인: import 누락

```go
// import 추가
import "project/internal/repository"

// 변경 전
var repo UserRepository
// 변경 후
var repo repository.UserRepository
```

```bash
$ go build ./...
# 오류 2개 남음
```

## 수정 2: 타입 불일치

파일: internal/handler/api.go:42
오류: cannot use x (type string) as type int

```go
// 변경 전
count := params.Get("count")
// 변경 후
countStr := params.Get("count")
count, _ := strconv.Atoi(countStr)
```

```bash
$ go build ./...
# 오류 1개 남음
```

## 수정 3: return 누락

파일: internal/handler/api.go:58
오류: missing return at end of function

```go
func GetUser(id string) (*User, error) {
    if id == "" {
        return nil, ErrInvalidID
    }
    user := findUser(id)
    // 누락된 return 추가
    return user, nil
}
```

```bash
$ go build ./...
# 빌드 성공!
```

## 최종 검증

```bash
$ go vet ./...
# 문제 없음

$ go test ./...
ok      project/internal/service   0.015s
ok      project/internal/handler   0.023s
```

## 요약

| 지표 | 수량 |
|--------|-------|
| 수정된 빌드 오류 | 3 |
| 수정된 vet 경고 | 0 |
| 수정된 파일 | 2 |
| 남은 문제 | 0 |

빌드 상태: ✅ 성공
```

## 일반적으로 수정되는 오류

| 오류 | 일반적인 수정 |
|-------|-------------|
| `undefined: X` | import 추가 또는 오타 수정 |
| `cannot use X as Y` | 타입 변환 또는 할당 수정 |
| `missing return` | return 구문 추가 |
| `X does not implement Y` | 누락된 메서드 추가 |
| `import cycle` | 패키지 구조 재조정 |
| `declared but not used` | 변수 제거 또는 사용 |
| `cannot find package` | `go get` 또는 `go mod tidy` |

## 수정 전략

1. **빌드 오류 먼저** - 코드가 컴파일되어야 함
2. **vet 경고 다음** - 의심스러운 구조 수정
3. **린트 경고 마지막** - 스타일 및 모범 사례
4. **한 번에 하나씩** - 각 변경 검증
5. **최소 변경** - 리팩터링이 아닌 수정만

## 중지 조건

다음 경우 에이전트가 중지하고 보고합니다:
- 3번 시도 후에도 동일한 오류가 지속됨
- 수정으로 인해 더 많은 오류가 발생함
- 아키텍처 변경이 필요함
- 외부 의존성 누락

## 관련 명령

- `/go-test` - 빌드 성공 후 테스트 실행
- `/go-review` - 코드 품질 검토
- `/verify` - 전체 검증 루프

## 관련

- 에이전트: `agents/go-build-resolver.md`
- 스킬: `skills/golang-patterns/`
