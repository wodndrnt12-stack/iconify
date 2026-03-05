---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go 코딩 스타일

> 이 파일은 [common/coding-style.md](../common/coding-style.md)를 Go 특화 내용으로 확장한다.

## 포맷팅

- **gofmt**와 **goimports**는 필수 — 스타일 논쟁 불필요

## 설계 원칙

- 인터페이스를 받고, 구조체를 반환한다
- 인터페이스를 작게 유지한다 (1~3개 메서드)

## 오류 처리

항상 오류에 컨텍스트를 추가하여 래핑:

```go
if err != nil {
    return fmt.Errorf("failed to create user: %w", err)
}
```

## 참조

포괄적인 Go 관용구 및 패턴은 스킬: `golang-patterns`을 참조.
