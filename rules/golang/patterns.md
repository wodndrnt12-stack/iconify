---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go 패턴

> 이 파일은 [common/patterns.md](../common/patterns.md)를 Go 특화 내용으로 확장한다.

## 함수형 옵션

```go
type Option func(*Server)

func WithPort(port int) Option {
    return func(s *Server) { s.port = port }
}

func NewServer(opts ...Option) *Server {
    s := &Server{port: 8080}
    for _, opt := range opts {
        opt(s)
    }
    return s
}
```

## 작은 인터페이스

인터페이스는 구현되는 곳이 아니라 사용되는 곳에서 정의한다.

## 의존성 주입

생성자 함수를 사용하여 의존성을 주입:

```go
func NewUserService(repo UserRepository, logger Logger) *UserService {
    return &UserService{repo: repo, logger: logger}
}
```

## 참조

동시성, 오류 처리, 패키지 구성을 포함한 포괄적인 Go 패턴은 스킬: `golang-patterns`을 참조.
