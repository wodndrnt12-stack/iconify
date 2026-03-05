---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go 테스트

> 이 파일은 [common/testing.md](../common/testing.md)를 Go 특화 내용으로 확장한다.

## 프레임워크

**테이블 기반 테스트**와 함께 표준 `go test` 사용.

## 경쟁 조건 감지

항상 `-race` 플래그와 함께 실행:

```bash
go test -race ./...
```

## 커버리지

```bash
go test -cover ./...
```

## 참조

상세한 Go 테스트 패턴과 헬퍼는 스킬: `golang-testing`을 참조.
