---
description: Go에 대한 TDD 워크플로우를 강제합니다. 먼저 테이블 기반 테스트를 작성한 후 구현합니다. go test -cover로 80% 이상의 커버리지를 검증합니다.
---

# Go TDD 명령

이 명령은 관용적인 Go 테스트 패턴을 사용하여 Go 코드에 대한 테스트 주도 개발 방법론을 강제합니다.

## 이 명령이 하는 일

1. **타입/인터페이스 정의**: 먼저 함수 시그니처 스캐폴딩
2. **테이블 기반 테스트 작성**: 포괄적인 테스트 케이스 생성 (RED)
3. **테스트 실행**: 올바른 이유로 테스트가 실패하는지 확인
4. **코드 구현**: 통과를 위한 최소한의 코드 작성 (GREEN)
5. **리팩터링**: 테스트를 통과하는 상태를 유지하며 개선
6. **커버리지 확인**: 80% 이상의 커버리지 확보

## 사용 시기

다음 경우에 `/go-test`를 사용합니다:
- 새 Go 함수 구현 시
- 기존 코드에 테스트 커버리지 추가 시
- 버그 수정 시 (먼저 실패하는 테스트 작성)
- 중요한 비즈니스 로직 구축 시
- Go의 TDD 워크플로우 학습 시

## TDD 사이클

```
RED     → 실패하는 테이블 기반 테스트 작성
GREEN   → 통과를 위한 최소한의 코드 구현
REFACTOR → 코드 개선, 테스트는 계속 통과
REPEAT  → 다음 테스트 케이스
```

## 예시 세션

````
사용자: /go-test 이메일 주소를 검증하는 함수가 필요합니다

에이전트:
# TDD 세션: 이메일 검증기

## 1단계: 인터페이스 정의

```go
// validator/email.go
package validator

// ValidateEmail은 주어진 문자열이 유효한 이메일 주소인지 확인합니다.
// 유효하면 nil을 반환하고, 그렇지 않으면 문제를 설명하는 오류를 반환합니다.
func ValidateEmail(email string) error {
    panic("not implemented")
}
```

## 2단계: 테이블 기반 테스트 작성 (RED)

```go
// validator/email_test.go
package validator

import (
    "testing"
)

func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        // 유효한 이메일
        {"simple email", "user@example.com", false},
        {"with subdomain", "user@mail.example.com", false},
        {"with plus", "user+tag@example.com", false},
        {"with dots", "first.last@example.com", false},

        // 유효하지 않은 이메일
        {"empty string", "", true},
        {"no at sign", "userexample.com", true},
        {"no domain", "user@", true},
        {"no local part", "@example.com", true},
        {"double at", "user@@example.com", true},
        {"spaces", "user @example.com", true},
        {"no tld", "user@example", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateEmail(tt.email)
            if tt.wantErr && err == nil {
                t.Errorf("ValidateEmail(%q) = nil; want error", tt.email)
            }
            if !tt.wantErr && err != nil {
                t.Errorf("ValidateEmail(%q) = %v; want nil", tt.email, err)
            }
        })
    }
}
```

## 3단계: 테스트 실행 - 실패 확인

```bash
$ go test ./validator/...

--- FAIL: TestValidateEmail (0.00s)
    --- FAIL: TestValidateEmail/simple_email (0.00s)
        panic: not implemented

FAIL
```

✓ 예상대로 테스트가 실패합니다 (패닉).

## 4단계: 최소한의 코드 구현 (GREEN)

```go
// validator/email.go
package validator

import (
    "errors"
    "regexp"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

var (
    ErrEmailEmpty   = errors.New("email cannot be empty")
    ErrEmailInvalid = errors.New("email format is invalid")
)

func ValidateEmail(email string) error {
    if email == "" {
        return ErrEmailEmpty
    }
    if !emailRegex.MatchString(email) {
        return ErrEmailInvalid
    }
    return nil
}
```

## 5단계: 테스트 실행 - 통과 확인

```bash
$ go test ./validator/...

PASS
ok      project/validator    0.003s
```

✓ 모든 테스트 통과!

## 6단계: 커버리지 확인

```bash
$ go test -cover ./validator/...

PASS
coverage: 100.0% of statements
ok      project/validator    0.003s
```

✓ 커버리지: 100%

## TDD 완료!
````

## 테스트 패턴

### 테이블 기반 테스트
```go
tests := []struct {
    name     string
    input    InputType
    want     OutputType
    wantErr  bool
}{
    {"case 1", input1, want1, false},
    {"case 2", input2, want2, true},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := Function(tt.input)
        // 검증
    })
}
```

### 병렬 테스트
```go
for _, tt := range tests {
    tt := tt // 캡처
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        // 테스트 본문
    })
}
```

### 테스트 헬퍼
```go
func setupTestDB(t *testing.T) *sql.DB {
    t.Helper()
    db := createDB()
    t.Cleanup(func() { db.Close() })
    return db
}
```

## 커버리지 명령

```bash
# 기본 커버리지
go test -cover ./...

# 커버리지 프로파일
go test -coverprofile=coverage.out ./...

# 브라우저에서 보기
go tool cover -html=coverage.out

# 함수별 커버리지
go tool cover -func=coverage.out

# 레이스 감지와 함께
go test -race -cover ./...
```

## 커버리지 목표

| 코드 유형 | 목표 |
|-----------|--------|
| 중요 비즈니스 로직 | 100% |
| 공개 API | 90%+ |
| 일반 코드 | 80%+ |
| 생성된 코드 | 제외 |

## TDD 모범 사례

**권장:**
- 구현 전에 테스트를 먼저 작성
- 각 변경 후 테스트 실행
- 포괄적인 커버리지를 위해 테이블 기반 테스트 사용
- 구현 세부 사항이 아닌 동작 테스트
- 엣지 케이스 포함 (빈 값, nil, 최대값)

**비권장:**
- 테스트 전에 구현 작성
- RED 단계 건너뛰기
- private 함수 직접 테스트
- 테스트에서 `time.Sleep` 사용
- 불안정한 테스트 무시

## 관련 명령

- `/go-build` - 빌드 오류 수정
- `/go-review` - 구현 후 코드 검토
- `/verify` - 전체 검증 루프 실행

## 관련

- 스킬: `skills/golang-testing/`
- 스킬: `skills/tdd-workflow/`
